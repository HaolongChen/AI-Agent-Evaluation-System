import { Command } from '@langchain/langgraph';
import { logger } from '../utils/logger.ts';
import { evaluationPersistenceService } from '../services/EvaluationPersistenceService.ts';
import { executionService } from '../services/ExecutionService.ts';
import { SESSION_STATUS } from '../config/constants.ts';
import { graph, type GraphConfigurable } from '../langGraph/agent.ts';
import type { FinalReport } from '../langGraph/state/state.ts';

const DEFAULT_TIMEOUT_MS = 300000; // 5 minutes

interface SessionMetadata {
  threadId: string;
  goldenSetId?: number;
  skipHumanReview?: boolean;
  skipHumanEvaluation?: boolean;
}

type GraphResult =
  typeof import('../langGraph/state/state.ts').rubricAnnotation.State & {
    __interrupt__?: Array<{
      value: {
        message?: string;
        questionSetFinal?: unknown;
      };
      resumable: boolean;
      ns: string[];
    }>;
  };

export interface HumanEvaluationJobResult {
  status: 'succeeded' | 'failed';
  sessionId?: number;
  threadId?: string;
  graphStatus?: 'completed';
  message?: string;
  finalReport?: FinalReport | null;
  error?: string;
}

export class HumanEvaluationJobRunner {
  private completionPromise: Promise<HumanEvaluationJobResult>;
  private resolveCompletion?: (value: HumanEvaluationJobResult) => void;
  private rejectCompletion?: (reason: Error) => void;
  private timeoutId: NodeJS.Timeout | null = null;
  private isCompleted: boolean = false;

  constructor(
    private readonly sessionId: number,
    private readonly threadId: string,
    private readonly answers: Array<{
      id: number;
      answer: boolean;
      explanation: string;
    }>,
    private readonly overallAssessment: string,
  ) {
    this.completionPromise = new Promise<HumanEvaluationJobResult>(
      (resolve, reject) => {
        this.resolveCompletion = resolve;
        this.rejectCompletion = reject;
      },
    );
  }

  private clearTimeout(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  /**
   * Core logic for human evaluation submission.
   *
   * RESPONSIBILITIES:
   * - Saves human answers to DB BEFORE resuming graph (for persistence)
   * - Resumes LangGraph workflow with human evaluation input
   * - Detects unexpected interrupts (defensive programming)
   * - Persists final report and updates session status
   *
   * POSITION IN WORKFLOW: Final HITL checkpoint before report generation
   */
  async submitHumanEvaluation(): Promise<HumanEvaluationJobResult> {
    try {
      const session = await executionService.getSessionWithRubrics(
        this.sessionId,
      );

      if (!session) {
        throw new Error('Session not found');
      }

      const metadata = session.metadata as SessionMetadata | null;
      if (!metadata || metadata.threadId !== this.threadId) {
        throw new Error('Thread ID mismatch');
      }


      const humanEvaluationInput = {
        answers: this.answers,
        overallAssessment: this.overallAssessment,
      };

      const provider = session.modelName.toLowerCase().startsWith('gemini')
        ? 'gemini'
        : 'azure';

      const evalConfigurable: GraphConfigurable = {
        sessionId: this.sessionId,
        thread_id: this.threadId,
        provider,
        model: session.modelName,
        skipHumanReview: metadata.skipHumanReview ?? false,
        skipHumanEvaluation: metadata.skipHumanEvaluation ?? false,
      };

      const result = (await graph.invoke(
        new Command({ resume: humanEvaluationInput }),
        {
          configurable: evalConfigurable,
        },
      )) as GraphResult;

      const graphStatus: HumanEvaluationJobResult['graphStatus'] = 'completed';
      const message = 'Evaluation completed successfully';

      if (result.__interrupt__ && result.__interrupt__.length > 0) {
        logger.warn('Unexpected interrupt after human evaluation', {
          sessionId: this.sessionId,
          interrupts: result.__interrupt__,
        });
        throw new Error(
          'Unexpected workflow interrupt after human evaluation. Graph should complete after this checkpoint.',
        );
      }

      if (result.finalReport) {
        await evaluationPersistenceService.saveFinalReport(
          this.sessionId,
          undefined,
          session.modelName,
          result.finalReport,
        );
      }

      await executionService.updateSessionStatus(
        this.sessionId,
        SESSION_STATUS.COMPLETED,
        new Date(),
      );

      return {
        status: 'succeeded',
        sessionId: this.sessionId,
        threadId: this.threadId,
        graphStatus,
        message,
        finalReport: result.finalReport ?? null,
      };
    } catch (error) {
      logger.error('Error submitting human evaluation:', error);
      throw error;
    }
  }

  async startJob(): Promise<void> {
    logger.info('Submitting human evaluation', {
      sessionId: this.sessionId,
      answersCount: this.answers.length,
    });

    try {
      const result = await this.submitHumanEvaluation();
      if (!this.isCompleted && this.resolveCompletion) {
        this.clearTimeout();
        this.isCompleted = true;
        this.resolveCompletion(result);
      }
    } catch (error) {
      logger.error('Human evaluation submission failed:', error);
      const errorResult: HumanEvaluationJobResult = {
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

  async waitForCompletion(
    timeoutMs: number = DEFAULT_TIMEOUT_MS,
  ): Promise<HumanEvaluationJobResult> {
    this.clearTimeout();

    this.timeoutId = setTimeout(() => {
      if (!this.isCompleted && this.rejectCompletion) {
        this.timeoutId = null;
        this.isCompleted = true;
        this.rejectCompletion(
          new Error(`Human evaluation job timed out after ${timeoutMs}ms`),
        );
      }
    }, timeoutMs);

    try {
      return await this.completionPromise;
    } finally {
      this.clearTimeout();
    }
  }

  stopJob(): void {
    this.clearTimeout();
    if (!this.isCompleted) {
      this.isCompleted = true;
      this.rejectCompletion?.(new Error('Job stopped by user'));
    }
  }
}

