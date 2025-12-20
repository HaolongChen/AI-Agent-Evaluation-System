import { v4 as uuidv4 } from 'uuid';
import * as z from 'zod';
import { logger } from '../utils/logger.ts';
import { RUN_KUBERNETES_JOBS } from '../config/env.ts';
import {
  graph,
  automatedGraph,
  type GraphConfigurable,
} from '../langGraph/agent.ts';
import type { Rubric, FinalReport } from '../langGraph/state/state.ts';
import { prisma } from '../config/prisma.ts';
import { executionService } from '../services/ExecutionService.ts';
import { evaluationPersistenceService } from '../services/EvaluationPersistenceService.ts';
import { SESSION_STATUS } from '../config/constants.ts';

const DEFAULT_TIMEOUT_MS = 300000; // 5 minutes

export interface RubricGenerationResult {
  status: 'succeeded' | 'failed';
  sessionId?: number;
  threadId?: string;
  graphStatus?:
    | 'completed'
    | 'awaiting_rubric_review'
    | 'awaiting_human_evaluation';
  message?: string;
  rubric?: Rubric | null;
  evaluationScore?: number | undefined;
  finalReport?: FinalReport | null;
  error?: string;
}

/**
 * Interrupt payload structure from LangGraph
 */
interface InterruptInfo {
  value: {
    message?: string;
    rubricDraft?: Rubric;
    rubricFinal?: Rubric;
    query?: string;
    context?: string | null;
    candidateOutput?: string;
  };
  resumable: boolean;
  ns: string[];
}

/**
 * Result from graph.invoke() with potential interrupt info
 */
interface GraphResult {
  query: string;
  context: string;
  candidateOutput: string;
  rubricDraft?: Rubric | null;
  rubricApproved?: boolean;
  rubricFinal?: Rubric | null;
  finalReport?: FinalReport | null;
  agentEvaluation?: { overallScore?: number } | null;
  __interrupt__?: InterruptInfo[];
}

/**
 * Job runner for rubric generation using LangGraph workflow.
 * Uses the same LangGraph invocation + interrupt handling as GraphExecutionService,
 * but wraps it in a JobRunner lifecycle (start/wait/stop) like EvaluationJobRunner.
 */
export class RubricGenerationJobRunner {
  private completionPromise: Promise<RubricGenerationResult>;
  private resolveCompletion?: (value: RubricGenerationResult) => void;
  private rejectCompletion?: (reason: Error) => void;
  private timeoutId: NodeJS.Timeout | null = null;
  private isCompleted: boolean = false;

  constructor(
    private readonly goldenSetId: number,
    private readonly query: string,
    private readonly context: string,
    private readonly candidateOutput: string,
    private readonly modelName: string,
    private readonly skipHumanReview: boolean = true,
    private readonly skipHumanEvaluation: boolean = true
  ) {
    this.completionPromise = new Promise<RubricGenerationResult>(
      (resolve, reject) => {
        this.resolveCompletion = resolve;
        this.rejectCompletion = reject;
      }
    );
  }

  /**
   * Clear the timeout if set
   */
  private clearTimeout(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  /**
   * Start the rubric generation job using LangGraph workflow.
   * - Creates a copilotSimulation record for observability and HITL resumption
   * - Invokes graph/automatedGraph depending on skip flags
   * - Saves rubric + final report to DB following GraphExecutionService semantics
   */
  async startJob(): Promise<void> {
    logger.info(
      `Starting rubric generation job for goldenSet ${this.goldenSetId} with model ${this.modelName}`
    );

    try {
      // Create a unique thread ID for this session (used by LangGraph checkpointer)
      const threadId = uuidv4();

      // Create the simulation session in database
      const session = await executionService.createSimulationSession(
        this.goldenSetId,
        this.modelName,
        {
          skipHumanReview: this.skipHumanReview,
          skipHumanEvaluation: this.skipHumanEvaluation,
        }
      );

      // Update metadata with threadId
      await prisma.copilotSimulation.update({
        where: { id: session.id },
        data: {
          metadata: {
            threadId,
            goldenSetId: this.goldenSetId,
            skipHumanReview: this.skipHumanReview,
            skipHumanEvaluation: this.skipHumanEvaluation,
          },
        },
      });

      const graphToUse =
        this.skipHumanReview && this.skipHumanEvaluation
          ? automatedGraph
          : graph;

      // Determine provider from model name (gemini models start with 'gemini', otherwise azure)
      const provider = this.modelName.toLowerCase().startsWith('gemini')
        ? 'gemini'
        : 'azure';

      const configurable: GraphConfigurable = {
        thread_id: threadId,
        provider,
        model: this.modelName,
        goldenSetId: this.goldenSetId,
        skipHumanReview: this.skipHumanReview,
        skipHumanEvaluation: this.skipHumanEvaluation,
      };

      const initialState = {
        query: this.query,
        context: this.context,
        candidateOutput: this.candidateOutput,
      };

      const result = (await graphToUse.invoke(initialState, {
        configurable,
      })) as GraphResult;

      // Determine graph pause/completion status based on interrupts
      let graphStatus: RubricGenerationResult['graphStatus'] = 'completed';
      let message = 'Evaluation completed successfully';
      let rubricForResponse: Rubric | null | undefined =
        result.rubricFinal || result.rubricDraft;

      if (result.__interrupt__ && result.__interrupt__.length > 0) {
        const interruptValue = result.__interrupt__[0]?.value;
        if (interruptValue?.rubricDraft && !interruptValue?.rubricFinal) {
          graphStatus = 'awaiting_rubric_review';
          message =
            'Graph paused for rubric review. Call submitRubricReview to continue.';
          rubricForResponse = interruptValue.rubricDraft || rubricForResponse;
        } else if (interruptValue?.rubricFinal) {
          graphStatus = 'awaiting_human_evaluation';
          message =
            'Graph paused for human evaluation. Call submitHumanEvaluation to continue.';
          rubricForResponse = interruptValue.rubricFinal || rubricForResponse;
        }
      }

      // Update session status
      await prisma.copilotSimulation.update({
        where: { id: session.id },
        data: {
          status:
            graphStatus === 'completed'
              ? SESSION_STATUS.COMPLETED
              : SESSION_STATUS.RUNNING,
          ...(graphStatus === 'completed' && { completedAt: new Date() }),
        },
      });

      // Save rubric to database for review/evaluation
      if (rubricForResponse) {
        await evaluationPersistenceService.saveRubric(
          session.id,
          rubricForResponse
        );
      }

      // Save final report if completed
      if (graphStatus === 'completed' && result.finalReport) {
        await evaluationPersistenceService.saveFinalReport(
          session.id,
          result.finalReport
        );
      }

      const rubricResult: RubricGenerationResult = {
        status: 'succeeded',
        sessionId: session.id,
        threadId,
        graphStatus,
        message,
        rubric: rubricForResponse ?? null,
        evaluationScore: result.agentEvaluation?.overallScore,
        finalReport: result.finalReport ?? null,
      };

      if (rubricResult.evaluationScore !== undefined) {
        logger.info(
          `Overall Evaluation Score: ${rubricResult.evaluationScore}`
        );
      }

      if (rubricResult.finalReport) {
        logger.info(
          `Final Report Verdict: ${rubricResult.finalReport.verdict}`
        );
        logger.info(
          `Final Report Summary: ${rubricResult.finalReport.summary.substring(
            0,
            200
          )}${rubricResult.finalReport.summary.length > 200 ? '...' : ''}`
        );
      }

      if (rubricResult.rubric) {
        logger.info(
          `Generated Rubric: ${rubricResult.rubric.id} (v${rubricResult.rubric.version})`
        );
        logger.info(`  Total weight: ${rubricResult.rubric.totalWeight}`);
      }

      if (!this.isCompleted && this.resolveCompletion) {
        this.clearTimeout();
        this.isCompleted = true;
        this.resolveCompletion(rubricResult);
      }
    } catch (error) {
      logger.error(
        `Rubric generation failed for goldenSet ${this.goldenSetId}:`,
        error
      );

      const errorResult: RubricGenerationResult = {
        status: 'failed',
        error: error instanceof Error ? error.message : String(error),
      };

      if (!this.isCompleted && this.resolveCompletion) {
        this.clearTimeout();
        this.isCompleted = true;
        this.resolveCompletion(errorResult);
      }
    }
  }

  /**
   * Wait for the job to complete with an optional timeout.
   * @param timeoutMs Optional timeout in milliseconds (default: 5 minutes)
   * @returns Promise that resolves with the rubric generation result
   */
  async waitForCompletion(
    timeoutMs: number = DEFAULT_TIMEOUT_MS
  ): Promise<RubricGenerationResult> {
    // Clear any existing timeout before setting a new one
    this.clearTimeout();

    // Add timeout handling
    this.timeoutId = setTimeout(() => {
      if (!this.isCompleted && this.rejectCompletion) {
        this.timeoutId = null;
        this.isCompleted = true;
        this.rejectCompletion(
          new Error(`Rubric generation timed out after ${timeoutMs}ms`)
        );
      }
    }, timeoutMs);

    try {
      return await this.completionPromise;
    } finally {
      this.clearTimeout();
    }
  }

  /**
   * Stop the job and clean up resources
   */
  stopJob(): void {
    this.clearTimeout();
    if (!this.isCompleted) {
      this.isCompleted = true;
      this.rejectCompletion?.(new Error('Job stopped by user'));
    }
  }
}

// CLI entry point for Kubernetes job execution
if (
  RUN_KUBERNETES_JOBS &&
  process.argv[2] &&
  process.argv[3] &&
  process.argv[4]
) {
  logger.debug(`RubricGenerationJobRunner CLI args: ${process.argv}`);

  const args = z
    .object({
      goldenSetId: z.coerce.number().int().positive('goldenSetId is required'),
      query: z.string().min(1, 'query is required'),
      context: z.string(),
      candidateOutput: z.string(),
      modelName: z.string().min(1, 'modelName is required'),
      skipHumanReview: z
        .string()
        .optional()
        .transform((v) => v === 'true'),
      skipHumanEvaluation: z
        .string()
        .optional()
        .transform((v) => v === 'true'),
    })
    .parse({
      goldenSetId: process.argv[2],
      query: process.argv[3] || '',
      context: process.argv[4] || '',
      candidateOutput: process.argv[5] || '',
      modelName: process.argv[6] || 'gpt-4o',
      skipHumanReview: process.argv[7],
      skipHumanEvaluation: process.argv[8],
    });

  const jobRunner = new RubricGenerationJobRunner(
    args.goldenSetId,
    args.query,
    args.context,
    args.candidateOutput,
    args.modelName,
    args.skipHumanReview ?? true,
    args.skipHumanEvaluation ?? true
  );

  jobRunner.startJob();

  jobRunner
    .waitForCompletion()
    .then((result) => {
      console.log(`JOB_RESULT_JSON: ${JSON.stringify(result)}`);
      process.exit(result.status === 'succeeded' ? 0 : 1);
    })
    .catch((error) => {
      logger.error('Rubric generation job execution failed:', error);
      console.log(
        `JOB_RESULT_JSON: ${JSON.stringify({
          status: 'failed',
          error: error instanceof Error ? error.message : String(error),
        })}`
      );
      process.exit(1);
    });
}
