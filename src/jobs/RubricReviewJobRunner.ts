import * as z from 'zod';
import { Command } from '@langchain/langgraph';
import { logger } from '../utils/logger.ts';
import { RUN_KUBERNETES_JOBS } from '../config/env.ts';
import { evaluationPersistenceService } from '../services/EvaluationPersistenceService.ts';
import { executionService } from '../services/ExecutionService.ts';
import { rubricService } from '../services/RubricService.ts';
import { SESSION_STATUS, REVIEW_STATUS } from '../config/constants.ts';
import { graph, type GraphConfigurable } from '../langGraph/agent.ts';
import type { QuestionSet, FinalReport } from '../langGraph/state/state.ts';

const DEFAULT_TIMEOUT_MS = 300000; // 5 minutes

interface SessionMetadata {
  threadId: string;
  goldenSetId?: number;
  skipHumanReview?: boolean;
  skipHumanEvaluation?: boolean;
}

interface InterruptInfo {
  value: {
    message?: string;
    questionSetDraft?: QuestionSet;
    questionSetFinal?: QuestionSet;
  };
  resumable: boolean;
  ns: string[];
}

interface GraphResult {
  questionSetFinal?: QuestionSet | null;
  agentEvaluation?: import('../langGraph/state/state.ts').QuestionEvaluation | null;
  finalReport?: FinalReport | null;
  __interrupt__?: InterruptInfo[];
}

export interface RubricReviewJobResult {
  status: 'succeeded' | 'failed';
  sessionId?: number;
  threadId?: string;
  graphStatus?: 'completed' | 'awaiting_human_evaluation';
  message?: string;
  questionSetFinal?: QuestionSet | null;
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
    private readonly modifiedQuestionSet?: QuestionSet,
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
   * Core logic for rubric review submission.
   * 
   * RESPONSIBILITIES:
   * - Updates reviewStatus in DB BEFORE resuming graph (audit trail)
   * - Resumes LangGraph workflow with human review input
   * - Detects NEXT interrupt (may pause at human evaluation checkpoint)
   * - Conditionally persists results (only if workflow completed)
   * - Returns appropriate status for cascading HITL workflow
   * 
   * POSITION IN WORKFLOW: First HITL checkpoint (may cascade to second)
   */
  async submitRubricReview(): Promise<RubricReviewJobResult> {
    // Get the session to retrieve metadata
    const session = await executionService.getSessionWithRubrics(this.sessionId);

    if (!session) {
      throw new Error('Session not found');
    }

    const metadata = session.metadata as SessionMetadata | null;
    if (!metadata || metadata.threadId !== this.threadId) {
      logger.error('Thread ID mismatch detected', {
        metadataThreadId: metadata?.threadId,
        providedThreadId: this.threadId,
        sessionId: this.sessionId,
      });
      throw new Error('Thread ID mismatch');
    }

    if (session.rubrics.length > 0) {
      await rubricService.updateRubricsReviewStatus(
        this.sessionId,
        this.approved ? REVIEW_STATUS.APPROVED : REVIEW_STATUS.REJECTED,
        this.reviewerAccountId
      );
    }

    // If we have a modified question set (from patches or full replacement),
    // persist it to the database before resuming the graph
    if (this.modifiedQuestionSet) {
      logger.info('Persisting modified question set to database', {
        sessionId: this.sessionId,
        questionCount: this.modifiedQuestionSet.questions.length,
      });

      await evaluationPersistenceService.updateRubricQuestions(
        this.sessionId,
        this.modifiedQuestionSet
      );
    }

    const humanReviewInput = {
      approved: this.approved,
      ...(this.modifiedQuestionSet && { modifiedQuestionSet: this.modifiedQuestionSet }),
      ...(this.feedback && { feedback: this.feedback }),
    };

    // Determine provider from session's model name
    const provider = session.modelName.toLowerCase().startsWith('gemini')
      ? 'gemini'
      : 'azure';

    const resumeConfigurable: GraphConfigurable = {
      sessionId: this.sessionId,
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

    let graphStatus: RubricReviewJobResult['graphStatus'] = 'completed';
    let message = 'Evaluation completed successfully';
    let questionSetFinalForResponse: QuestionSet | null | undefined = result.questionSetFinal;

    if (result.__interrupt__ && result.__interrupt__.length > 0) {
      const interruptValue = result.__interrupt__[0]?.value;
      if (interruptValue?.questionSetFinal) {
        graphStatus = 'awaiting_human_evaluation';
        message =
          'Graph paused for human evaluation. Call submitHumanEvaluation to continue.';
        questionSetFinalForResponse =
          interruptValue.questionSetFinal || questionSetFinalForResponse;
        
        if (result.agentEvaluation) {
          await evaluationPersistenceService.saveAgentEvaluationAnswers(
            this.sessionId,
            result.agentEvaluation
          );
        }
      }
    }

    // Update session status
    await executionService.updateSessionStatus(
      this.sessionId,
      graphStatus === 'completed' ? SESSION_STATUS.COMPLETED : SESSION_STATUS.RUNNING,
      graphStatus === 'completed' ? new Date() : undefined
    );

    // If completed, persist final report when present
    if (graphStatus === 'completed' && result.finalReport) {
      await evaluationPersistenceService.saveFinalReport(
        this.sessionId,
        undefined,
        session.modelName,
        result.finalReport
      );

      if (session.rubrics.length > 0) {
        await evaluationPersistenceService.saveJudgeRecordsFromFinalReport(
          this.sessionId,
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
      questionSetFinal: questionSetFinalForResponse ?? null,
      finalReport: result.finalReport ?? null,
    };
  }

  async startJob(): Promise<void> {
    logger.info('Submitting question set review', {
      sessionId: this.sessionId,
      approved: this.approved,
      hasModifiedQuestionSet: Boolean(this.modifiedQuestionSet),
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

  const modifiedQuestionSet = args.modifiedRubricJson
    ? args.modifiedRubricJson === 'null'
      ? undefined
      : (JSON.parse(args.modifiedRubricJson) as QuestionSet)
    : undefined;

  const runner = new RubricReviewJobRunner(
    args.sessionId,
    args.threadId,
    args.approved,
    args.reviewerAccountId,
    modifiedQuestionSet,
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
