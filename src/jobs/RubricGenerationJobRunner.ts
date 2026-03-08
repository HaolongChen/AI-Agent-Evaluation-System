import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger.ts';
import {
  graph,
  automatedGraph,
  type GraphConfigurable,
} from '../langGraph/agent.ts';
import type { QuestionSet, FinalReport } from '../langGraph/state/state.ts';
import type { Prisma } from '../../build/generated/prisma/client.ts';
import { analyticsService } from '../services/AnalyticsService.ts';
import { evaluationPersistenceService } from '../services/EvaluationPersistenceService.ts';
import { executionService } from '../services/ExecutionService.ts';
import { SESSION_STATUS } from '../config/constants.ts';
import type { CopilotType } from '../../build/generated/prisma/enums.ts';
import type { interruptType } from '../utils/types.ts';

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
  questionSet?: QuestionSet | null;
  evaluationScore?: number | undefined;
  finalReport?: FinalReport | null;
  analysis?: string;
  error?: string;
}

interface SessionMetadata {
  threadId: string;
  goldenSetId?: number;
  skipHumanReview?: boolean;
  skipHumanEvaluation?: boolean;
}

interface InterruptInfo {
  value: {
    type: interruptType;
    message: string;
  };
  resumable: boolean;
  ns: string[];
}

type GraphResult =
  typeof import('../langGraph/state/state.ts').rubricAnnotation.State & {
    __interrupt__?: InterruptInfo[];
  };

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
    private readonly projectExId: string,
    private readonly copilotType: CopilotType,
    private readonly query: string,
    private readonly context: string,
    private readonly candidateOutput: string,
    private readonly modelName: string,
    private readonly skipHumanReview: boolean = true,
    private readonly skipHumanEvaluation: boolean = true,
  ) {
    this.completionPromise = new Promise<RubricGenerationResult>(
      (resolve, reject) => {
        this.resolveCompletion = resolve;
        this.rejectCompletion = reject;
      },
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
   * - Creates an EvaluationSession record for observability and HITL resumption
   * - Invokes graph/automatedGraph depending on skip flags
   * - Saves rubric + final report to DB following GraphExecutionService semantics
   */
  async startJob(): Promise<void> {
    logger.info(
      `Starting rubric generation job for goldenSet ${this.goldenSetId} (${this.projectExId}) with model ${this.modelName}`,
    );

    try {
      // Create a unique thread ID for this session (used by LangGraph checkpointer)
      const threadId = uuidv4();

      // Prepare metadata for HITL tracking
      const metadata: SessionMetadata = {
        threadId,
        goldenSetId: this.goldenSetId,
        skipHumanReview: this.skipHumanReview,
        skipHumanEvaluation: this.skipHumanEvaluation,
      };

      // Create the evaluation session in database
      const session = await analyticsService.createEvaluationSession(
        this.goldenSetId,
        this.modelName,
        this.candidateOutput,
        SESSION_STATUS.PENDING,
        metadata as unknown as Prisma.InputJsonValue,
      );

      const graphToUse =
        this.skipHumanReview && this.skipHumanEvaluation
          ? automatedGraph
          : graph;

      // Determine provider from model name (gemini models start with 'gemini', otherwise azure)
      const provider = this.modelName.toLowerCase().startsWith('gemini')
        ? 'gemini'
        : 'azure';

      const configurable: GraphConfigurable = {
        sessionId: session.id,
        thread_id: threadId,
        provider,
        model: this.modelName,
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

      let graphStatus: RubricGenerationResult['graphStatus'] = 'completed';
      let message = 'Evaluation completed successfully';
      const questionSetForResponse: QuestionSet | null | undefined =
        result.questionSetFinal ?? result.questionSetDraft;

      if (result.__interrupt__ && result.__interrupt__.length > 0) {
        const interruptValue = result.__interrupt__[0]?.value;
        if (interruptValue?.type === 'rubric_review') {
          graphStatus = 'awaiting_rubric_review';
          message =
            interruptValue.message ||
            'Graph paused for question set review. Call submitRubricReview to continue.';
        } else if (interruptValue?.type === 'human_evaluation') {
          graphStatus = 'awaiting_human_evaluation';
          message =
            interruptValue.message ||
            'Graph paused for human evaluation. Call submitHumanEvaluation to continue.';
        } else {
          logger.error('Unexpected interrupt type after resuming graph', {
            interruptType: interruptValue?.type,
          });
        }
      }

      await executionService.updateSessionStatus(
        session.id,
        graphStatus === 'completed'
          ? SESSION_STATUS.COMPLETED
          : SESSION_STATUS.RUNNING,
        graphStatus === 'completed' ? new Date() : undefined,
      );

      if (graphStatus === 'completed' && result.finalReport) {
        await evaluationPersistenceService.saveFinalReport(
          session.id,
          this.copilotType,
          this.modelName,
          result.finalReport,
        );
      }
      if (result.evaluation) {
        await evaluationPersistenceService.saveAgentEvaluationAnswers(
          session.id,
          result.evaluation,
        );
      }

      const generationResult: RubricGenerationResult = {
        status: 'succeeded',
        sessionId: session.id,
        threadId,
        graphStatus,
        message,
        questionSet: questionSetForResponse ?? null,
        evaluationScore: result.evaluation?.overallScore,
        finalReport: result.finalReport ?? null,
        ...(result.analysis && { analysis: result.analysis }),
      };

      if (generationResult.evaluationScore !== undefined) {
        logger.info(
          `Overall Evaluation Score: ${generationResult.evaluationScore}`,
        );
      }

      if (generationResult.analysis) {
        logger.info(
          `Analysis: ${generationResult.analysis.substring(0, 200)}${
            generationResult.analysis.length > 200 ? '...' : ''
          }`,
        );
      }

      if (generationResult.finalReport) {
        logger.info(
          `Final Report Summary: ${generationResult.finalReport.summary.substring(
            0,
            200,
          )}${generationResult.finalReport.summary.length > 200 ? '...' : ''}`,
        );
      }

      if (generationResult.questionSet) {
        logger.info(
          `Generated QuestionSet: (v${generationResult.questionSet.version})`,
        );
        logger.info(
          `  Questions count: ${generationResult.questionSet.questions.length}`,
        );
        logger.info(
          `  Total weight: ${generationResult.questionSet.totalWeight}`,
        );
      }

      if (!this.isCompleted && this.resolveCompletion) {
        this.clearTimeout();
        this.isCompleted = true;
        this.resolveCompletion(generationResult);
      }
    } catch (error) {
      logger.error(
        `Rubric generation failed for goldenSet ${this.goldenSetId}:`,
        error,
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
    timeoutMs: number = DEFAULT_TIMEOUT_MS,
  ): Promise<RubricGenerationResult> {
    // Clear any existing timeout before setting a new one
    this.clearTimeout();

    // Add timeout handling
    this.timeoutId = setTimeout(() => {
      if (!this.isCompleted && this.rejectCompletion) {
        this.timeoutId = null;
        this.isCompleted = true;
        this.rejectCompletion(
          new Error(`Rubric generation timed out after ${timeoutMs}ms`),
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

