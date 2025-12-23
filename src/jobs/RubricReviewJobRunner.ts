import * as z from 'zod';
import { Command } from '@langchain/langgraph';
import { logger } from '../utils/logger.ts';
import { RUN_KUBERNETES_JOBS } from '../config/env.ts';
import { prisma } from '../config/prisma.ts';
import { evaluationPersistenceService } from '../services/EvaluationPersistenceService.ts';
import { SESSION_STATUS, REVIEW_STATUS } from '../config/constants.ts';
import { graph, type GraphConfigurable } from '../langGraph/agent.ts';
import type { Rubric, FinalReport } from '../langGraph/state/state.ts';
import type { Prisma } from '../../build/generated/prisma/client.ts';
import type { CopilotType } from '../../build/generated/prisma/enums.ts';

const DEFAULT_TIMEOUT_MS = 300000; // 5 minutes

/**
 * Metadata stored in session for HITL tracking
 */
interface SessionMetadata {
  threadId: string;
  goldenSetId?: number;
  skipHumanReview?: boolean;
  skipHumanEvaluation?: boolean;
}

/**
 * Interrupt payload structure from LangGraph
 */
interface InterruptInfo {
  value: {
    message?: string;
    rubricDraft?: Rubric;
    rubricFinal?: Rubric;
  };
  resumable: boolean;
  ns: string[];
}

/**
 * Result from graph.invoke() with potential interrupt info
 */
interface GraphResult {
  rubricFinal?: Rubric | null;
  finalReport?: FinalReport | null;
  __interrupt__?: InterruptInfo[];
}

export interface RubricReviewJobResult {
  status: 'succeeded' | 'failed';
  sessionId?: number;
  threadId?: string;
  graphStatus?: 'completed' | 'awaiting_human_evaluation';
  message?: string;
  rubricFinal?: Rubric | null;
  finalReport?: FinalReport | null;
  error?: string;
}

/**
 * Job runner for submitting rubric review and resuming the LangGraph workflow.
 *
 * This mirrors GraphExecutionService.submitRubricReview, but is wrapped in a
 * start/wait/stop job-runner lifecycle similar to EvaluationJobRunner.
 */
export class RubricReviewJobRunner {
  private completionPromise: Promise<RubricReviewJobResult>;
  private resolveCompletion?: (value: RubricReviewJobResult) => void;
  private rejectCompletion?: (reason: Error) => void;
  private timeoutId: NodeJS.Timeout | null = null;
  private isCompleted: boolean = false;

  constructor(
    private readonly sessionId: number,
    private readonly threadId: string,
    private readonly approved: boolean,
    private readonly reviewerAccountId: string,
    private readonly modifiedRubric?: Rubric,
    private readonly feedback?: string
  ) {
    this.completionPromise = new Promise<RubricReviewJobResult>(
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
   * Core logic for rubric review submission (public as requested).
   */
  async submitRubricReview(): Promise<RubricReviewJobResult> {
    // Get the session to retrieve metadata
    const session = await prisma.evaluationSession.findUnique({
      where: { id: this.sessionId },
      include: { rubric: true },
    });

    if (!session) {
      throw new Error('Session not found');
    }

    const metadata = session.metadata as SessionMetadata | null;
    if (!metadata || metadata.threadId !== this.threadId) {
      throw new Error('Thread ID mismatch');
    }

    // Update rubric in database with review status
    if (session.rubric) {
      const updateData: Prisma.adaptiveRubricUpdateInput = {
        reviewStatus: this.approved
          ? REVIEW_STATUS.APPROVED
          : REVIEW_STATUS.REJECTED,
        reviewedAt: new Date(),
        reviewedBy: this.reviewerAccountId,
      };

      if (this.modifiedRubric) {
        updateData.criteria = JSON.parse(
          JSON.stringify(this.modifiedRubric.criteria)
        );
        updateData.totalWeight = this.modifiedRubric.totalWeight;
        updateData.version = this.modifiedRubric.version;
      }

      await prisma.adaptiveRubric.update({
        where: { id: session.rubric.id },
        data: updateData,
      });
    }

    // Prepare human review input for graph resumption
    const humanReviewInput = {
      approved: this.approved,
      ...(this.modifiedRubric && { modifiedRubric: this.modifiedRubric }),
      ...(this.feedback && { feedback: this.feedback }),
    };

    // Determine provider from session's model name
    const provider = session.modelName.toLowerCase().startsWith('gemini')
      ? 'gemini'
      : 'azure';

    const resumeConfigurable: GraphConfigurable = {
      thread_id: this.threadId,
      provider,
      model: session.modelName,
      skipHumanReview: metadata.skipHumanReview ?? false,
      skipHumanEvaluation: metadata.skipHumanEvaluation ?? false,
    };

    const result = (await graph.invoke(
      new Command({ resume: humanReviewInput }),
      {
        configurable: { ...resumeConfigurable, projectExId: '' },
      }
    )) as GraphResult;

    // Determine the new status based on interrupt state
    let graphStatus: RubricReviewJobResult['graphStatus'] = 'completed';
    let message = 'Evaluation completed successfully';
    let rubricFinalForResponse: Rubric | null | undefined = result.rubricFinal;

    if (result.__interrupt__ && result.__interrupt__.length > 0) {
      const interruptValue = result.__interrupt__[0]?.value;
      if (interruptValue?.rubricFinal) {
        graphStatus = 'awaiting_human_evaluation';
        message =
          'Graph paused for human evaluation. Call submitHumanEvaluation to continue.';
        rubricFinalForResponse =
          interruptValue.rubricFinal || rubricFinalForResponse;
      }
    }

    // Update session status
    await prisma.evaluationSession.update({
      where: { id: this.sessionId },
      data: {
        status:
          graphStatus === 'completed'
            ? SESSION_STATUS.COMPLETED
            : SESSION_STATUS.RUNNING,
        ...(graphStatus === 'completed' && { completedAt: new Date() }),
      },
    });

    // If completed, persist final report when present
    if (graphStatus === 'completed' && result.finalReport) {
      await evaluationPersistenceService.saveFinalReport(
        this.sessionId,
        {
          copilotType: session.copilotType as CopilotType,
          modelName: session.modelName,
        },
        result.finalReport
      );

      // Save judge records (agent and human evaluations) if rubric exists
      if (session.rubric) {
        await evaluationPersistenceService.saveJudgeRecordsFromFinalReport(
          session.rubric.id,
          result.finalReport
        );
      }
    }

    return {
      status: 'succeeded',
      sessionId: this.sessionId,
      threadId: this.threadId,
      graphStatus,
      message,
      rubricFinal: rubricFinalForResponse ?? null,
      finalReport: result.finalReport ?? null,
    };
  }

  /**
   * Start the job (wraps submitRubricReview)
   */
  async startJob(): Promise<void> {
    logger.info('Submitting rubric review', {
      sessionId: this.sessionId,
      approved: this.approved,
      hasModifiedRubric: Boolean(this.modifiedRubric),
    });

    try {
      const result = await this.submitRubricReview();
      if (!this.isCompleted && this.resolveCompletion) {
        this.clearTimeout();
        this.isCompleted = true;
        this.resolveCompletion(result);
      }
    } catch (error) {
      logger.error('Rubric review submission failed:', error);
      const errorResult: RubricReviewJobResult = {
        status: 'failed',
        sessionId: this.sessionId,
        threadId: this.threadId,
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
   */
  async waitForCompletion(
    timeoutMs: number = DEFAULT_TIMEOUT_MS
  ): Promise<RubricReviewJobResult> {
    this.clearTimeout();

    this.timeoutId = setTimeout(() => {
      if (!this.isCompleted && this.rejectCompletion) {
        this.timeoutId = null;
        this.isCompleted = true;
        this.rejectCompletion(
          new Error(`Rubric review job timed out after ${timeoutMs}ms`)
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
  logger.debug(`RubricReviewJobRunner CLI args: ${process.argv}`);

  const args = z
    .object({
      sessionId: z.coerce.number().int().positive('sessionId is required'),
      threadId: z.string().min(1, 'threadId is required'),
      approved: z
        .string()
        .min(1)
        .transform((v) => v === 'true'),
      reviewerAccountId: z.string().min(1, 'reviewerAccountId is required'),
      modifiedRubricJson: z.string().optional(),
      feedback: z.string().optional(),
    })
    .parse({
      sessionId: process.argv[2],
      threadId: process.argv[3],
      approved: process.argv[4],
      reviewerAccountId: process.argv[5] || '',
      modifiedRubricJson: process.argv[6],
      feedback: process.argv[7],
    });

  const modifiedRubric = args.modifiedRubricJson
    ? args.modifiedRubricJson === 'null'
      ? undefined
      : (JSON.parse(args.modifiedRubricJson) as Rubric)
    : undefined;

  const runner = new RubricReviewJobRunner(
    args.sessionId,
    args.threadId,
    args.approved,
    args.reviewerAccountId,
    modifiedRubric,
    args.feedback
  );

  runner.startJob();

  runner
    .waitForCompletion()
    .then((result) => {
      console.log(`JOB_RESULT_JSON: ${JSON.stringify(result)}`);
      process.exit(result.status === 'succeeded' ? 0 : 1);
    })
    .catch((error) => {
      logger.error('Rubric review job execution failed:', error);
      console.log(
        `JOB_RESULT_JSON: ${JSON.stringify({
          status: 'failed',
          error: error instanceof Error ? error.message : String(error),
        })}`
      );
      process.exit(1);
    });
}
