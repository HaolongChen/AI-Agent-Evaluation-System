import * as z from 'zod';
import { Command } from '@langchain/langgraph';
import { logger } from '../utils/logger.ts';
import { RUN_KUBERNETES_JOBS } from '../config/env.ts';
import { prisma } from '../config/prisma.ts';
import { evaluationPersistenceService } from '../services/EvaluationPersistenceService.ts';
import { SESSION_STATUS } from '../config/constants.ts';
import { graph, type GraphConfigurable } from '../langGraph/agent.ts';
import type { FinalReport } from '../langGraph/state/state.ts';
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
 * Minimal evaluation structures needed for persistence
 */
type HumanEvaluation = {
  scores: Array<{ criterionId: string; score: number; reasoning: string }>;
  overallScore: number;
  summary: string;
};

interface GraphResult {
  humanEvaluation?: HumanEvaluation | null;
  finalReport?: FinalReport | null;
}

export interface HumanEvaluationJobResult {
  status: 'succeeded' | 'failed';
  sessionId?: number;
  threadId?: string;
  graphStatus?: 'completed';
  message?: string;
  finalReport?: FinalReport | null;
  error?: string;
}

/**
 * Job runner for submitting human evaluation and resuming the LangGraph workflow to completion.
 *
 * Mirrors GraphExecutionService.submitHumanEvaluation, wrapped in a JobRunner lifecycle.
 */
export class HumanEvaluationJobRunner {
  private completionPromise: Promise<HumanEvaluationJobResult>;
  private resolveCompletion?: (value: HumanEvaluationJobResult) => void;
  private rejectCompletion?: (reason: Error) => void;
  private timeoutId: NodeJS.Timeout | null = null;
  private isCompleted: boolean = false;

  constructor(
    private readonly sessionId: number,
    private readonly threadId: string,
    private readonly scores: Array<{
      criterionId: string;
      score: number;
      reasoning: string;
    }>,
    private readonly overallAssessment: string,
    private readonly evaluatorAccountId: string
  ) {
    this.completionPromise = new Promise<HumanEvaluationJobResult>(
      (resolve, reject) => {
        this.resolveCompletion = resolve;
        this.rejectCompletion = reject;
      }
    );
  }

  private clearTimeout(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  /**
   * Core logic for human evaluation submission (public as requested).
   */
  async submitHumanEvaluation(): Promise<HumanEvaluationJobResult> {
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

    const humanEvaluationInput = {
      scores: this.scores,
      overallAssessment: this.overallAssessment,
    };

    const provider = session.modelName.toLowerCase().startsWith('gemini')
      ? 'gemini'
      : 'azure';

    const evalConfigurable: GraphConfigurable = {
      thread_id: this.threadId,
      provider,
      model: session.modelName,
      skipHumanReview: metadata.skipHumanReview ?? false,
      skipHumanEvaluation: metadata.skipHumanEvaluation ?? false,
    };

    const result = (await graph.invoke(
      new Command({ resume: humanEvaluationInput }),
      {
        configurable: { ...evalConfigurable, projectExId: '' },
      }
    )) as GraphResult;

    // Store the human evaluation in database
    if (session.rubric && result.humanEvaluation) {
      await evaluationPersistenceService.saveJudgeRecord(
        session.rubric.id,
        'human',
        result.humanEvaluation.scores,
        result.humanEvaluation.overallScore,
        result.humanEvaluation.summary,
        this.evaluatorAccountId
      );
    }

    // Store the final report
    if (result.finalReport) {
      await evaluationPersistenceService.saveFinalReport(
        this.sessionId,
        {
          copilotType: session.copilotType as CopilotType,
          modelName: session.modelName,
        },
        result.finalReport
      );

      // Save judge records (including agent evaluation if present in final report)
      if (session.rubric) {
        await evaluationPersistenceService.saveJudgeRecordsFromFinalReport(
          session.rubric.id,
          result.finalReport
        );
      }
    }

    await prisma.evaluationSession.update({
      where: { id: this.sessionId },
      data: {
        status: SESSION_STATUS.COMPLETED,
        completedAt: new Date(),
      },
    });

    return {
      status: 'succeeded',
      sessionId: this.sessionId,
      threadId: this.threadId,
      graphStatus: 'completed',
      message: 'Evaluation completed successfully',
      finalReport: result.finalReport ?? null,
    };
  }

  async startJob(): Promise<void> {
    logger.info('Submitting human evaluation', {
      sessionId: this.sessionId,
      scoresCount: this.scores.length,
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
    timeoutMs: number = DEFAULT_TIMEOUT_MS
  ): Promise<HumanEvaluationJobResult> {
    this.clearTimeout();

    this.timeoutId = setTimeout(() => {
      if (!this.isCompleted && this.rejectCompletion) {
        this.timeoutId = null;
        this.isCompleted = true;
        this.rejectCompletion(
          new Error(`Human evaluation job timed out after ${timeoutMs}ms`)
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

// CLI entry point for Kubernetes job execution
if (
  RUN_KUBERNETES_JOBS &&
  process.argv[2] &&
  process.argv[3] &&
  process.argv[4]
) {
  logger.debug(`HumanEvaluationJobRunner CLI args: ${process.argv}`);

  const args = z
    .object({
      sessionId: z.coerce.number().int().positive('sessionId is required'),
      threadId: z.string().min(1, 'threadId is required'),
      scoresJson: z.string().min(1, 'scoresJson is required'),
      overallAssessment: z.string().min(1, 'overallAssessment is required'),
      evaluatorAccountId: z.string().min(1, 'evaluatorAccountId is required'),
    })
    .parse({
      sessionId: process.argv[2],
      threadId: process.argv[3],
      scoresJson: process.argv[4],
      overallAssessment: process.argv[5] || '',
      evaluatorAccountId: process.argv[6] || '',
    });

  const scores = JSON.parse(args.scoresJson) as Array<{
    criterionId: string;
    score: number;
    reasoning: string;
  }>;

  const runner = new HumanEvaluationJobRunner(
    args.sessionId,
    args.threadId,
    scores,
    args.overallAssessment,
    args.evaluatorAccountId
  );

  runner.startJob();

  runner
    .waitForCompletion()
    .then((result) => {
      console.log(`JOB_RESULT_JSON: ${JSON.stringify(result)}`);
      process.exit(result.status === 'succeeded' ? 0 : 1);
    })
    .catch((error) => {
      logger.error('Human evaluation job execution failed:', error);
      console.log(
        `JOB_RESULT_JSON: ${JSON.stringify({
          status: 'failed',
          error: error instanceof Error ? error.message : String(error),
        })}`
      );
      process.exit(1);
    });
}
