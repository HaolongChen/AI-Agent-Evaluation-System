import { prisma } from '../config/prisma.ts';
import { SESSION_STATUS, REVIEW_STATUS } from '../config/constants.ts';
import type { Prisma } from '../../build/generated/prisma/client.ts';
import { logger } from '../utils/logger.ts';
import type {
  Rubric,
  Evaluation,
  FinalReport,
} from '../langGraph/state/state.ts';
import { RUN_KUBERNETES_JOBS } from '../config/env.ts';
import {
  applyAndWatchJob,
  type HumanEvaluationK8sJobResult,
  type RubricReviewK8sJobResult,
} from '../kubernetes/utils/apply-from-file.ts';
import { HumanEvaluationJobRunner } from '../jobs/HumanEvaluationJobRunner.ts';
import { RubricReviewJobRunner } from '../jobs/RubricReviewJobRunner.ts';

/**
 * Session state indicating where the graph is paused
 */
export type GraphSessionStatus =
  | 'pending'
  | 'awaiting_rubric_review'
  | 'awaiting_human_evaluation'
  | 'completed'
  | 'failed';

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
 * Result returned when starting a graph session
 */
export interface StartSessionResult {
  sessionId: number;
  threadId: string;
  status: GraphSessionStatus;
  rubricDraft?: Rubric | null | undefined;
  message: string;
}

/**
 * Result returned when resuming with rubric review
 */
export interface RubricReviewResult {
  sessionId: number;
  threadId: string;
  status: GraphSessionStatus;
  rubricFinal?: Rubric | null | undefined;
  message: string;
}

/**
 * Result returned when resuming with human evaluation
 */
export interface HumanEvaluationResult {
  sessionId: number;
  threadId: string;
  status: GraphSessionStatus;
  finalReport?: FinalReport | null | undefined;
  message: string;
}

/**
 * GraphExecutionService
 *
 * Manages LangGraph execution with Human-in-the-Loop (HITL) support.
 * Uses callbacks pattern where mutations return immediately after starting or resuming,
 * and the graph pauses at interrupt points waiting for human input.
 */
export class GraphExecutionService {
  /**
   * Submit rubric review and resume the graph.
   */
  async submitRubricReview(
    sessionId: number,
    threadId: string,
    approved: boolean,
    modifiedRubric: Rubric | undefined,
    feedback: string | undefined,
    reviewerAccountId: string
  ): Promise<RubricReviewResult> {
    try {
      if (RUN_KUBERNETES_JOBS) {
        const args: string[] = [
          String(sessionId),
          threadId,
          String(approved),
          reviewerAccountId,
        ];

        // CLI positional args: modifiedRubricJson (argv[6]) then feedback (argv[7])
        if (modifiedRubric !== undefined) {
          args.push(JSON.stringify(modifiedRubric));
          if (feedback !== undefined) args.push(feedback);
        } else if (feedback !== undefined) {
          // allow feedback without a modified rubric
          args.push('null');
          args.push(feedback);
        }

        const reviewJobResult = (await applyAndWatchJob(
          `graph-rubric-review-${sessionId}-${Date.now()}`,
          'default',
          './src/jobs/RubricReviewJobRunner.ts',
          300000,
          'rubric-review',
          ...args
        )) as unknown as RubricReviewK8sJobResult;

        logger.info('Rubric review job completed:', reviewJobResult);

        if (reviewJobResult.status !== 'succeeded') {
          throw new Error(
            reviewJobResult.reason ||
              reviewJobResult.error ||
              'Rubric review Kubernetes job failed'
          );
        }

        const status: GraphSessionStatus =
          reviewJobResult.graphStatus === 'awaiting_human_evaluation'
            ? 'awaiting_human_evaluation'
            : 'completed';

        return {
          sessionId,
          threadId,
          status,
          rubricFinal: reviewJobResult.rubricFinal ?? null,
          message:
            reviewJobResult.message ||
            (status === 'awaiting_human_evaluation'
              ? 'Graph paused for human evaluation. Call submitHumanEvaluation to continue.'
              : 'Evaluation completed successfully'),
        };
      } else {
        const reviewJobRunner = new RubricReviewJobRunner(
          sessionId,
          threadId,
          approved,
          reviewerAccountId,
          modifiedRubric,
          feedback
        );
        reviewJobRunner.startJob();
        const result = await reviewJobRunner.waitForCompletion();
        logger.info('Rubric review completed:', result);
        return {
          sessionId,
          threadId,
          status:
            result.graphStatus === 'awaiting_human_evaluation'
              ? 'awaiting_human_evaluation'
              : 'completed',
          rubricFinal: result.rubricFinal ?? null,
          message:
            result.message ||
            (result.graphStatus === 'awaiting_human_evaluation'
              ? 'Graph paused for human evaluation. Call submitHumanEvaluation to continue.'
              : 'Evaluation completed successfully'),
        };
      }
    } catch (error) {
      logger.error('Error submitting rubric review:', error);
      throw new Error(
        `Failed to submit rubric review: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  /**
   * Submit human evaluation and resume the graph to completion.
   */
  async submitHumanEvaluation(
    sessionId: number,
    threadId: string,
    scores: Array<{ criterionId: string; score: number; reasoning: string }>,
    overallAssessment: string,
    evaluatorAccountId: string
  ): Promise<HumanEvaluationResult> {
    try {
      if (RUN_KUBERNETES_JOBS) {
        const evaluationJobResult = (await applyAndWatchJob(
          `graph-human-eval-${sessionId}-${Date.now()}`,
          'default',
          './src/jobs/HumanEvaluationJobRunner.ts',
          300000,
          'human-evaluation',
          String(sessionId),
          threadId,
          JSON.stringify(scores),
          overallAssessment,
          evaluatorAccountId
        )) as unknown as HumanEvaluationK8sJobResult;

        logger.info('Human evaluation job completed:', evaluationJobResult);

        if (evaluationJobResult.status !== 'succeeded') {
          throw new Error(
            evaluationJobResult.reason ||
              evaluationJobResult.error ||
              'Human evaluation Kubernetes job failed'
          );
        }

        return {
          sessionId,
          threadId,
          status: 'completed',
          finalReport: evaluationJobResult.finalReport ?? null,
          message:
            evaluationJobResult.message || 'Evaluation completed successfully',
        };
      } else {
        const evaluationJobRunner = new HumanEvaluationJobRunner(
          sessionId,
          threadId,
          scores,
          overallAssessment,
          evaluatorAccountId
        );
        evaluationJobRunner.startJob();
        const result = await evaluationJobRunner.waitForCompletion();
        logger.info('Human evaluation completed:', result);
        return {
          sessionId,
          threadId,
          status: 'completed',
          finalReport: result.finalReport ?? null,
          message: result.message || 'Evaluation completed successfully',
        };
      }
    } catch (error) {
      logger.error('Error submitting human evaluation:', error);
      throw new Error(
        `Failed to submit human evaluation: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  /**
   * Get the current state of a graph session
   */
  async getSessionState(sessionId: number): Promise<{
    sessionId: number;
    status: GraphSessionStatus;
    threadId: string | null;
    rubricDraft: Rubric | null;
    rubricFinal: Rubric | null;
    agentEvaluation: Evaluation | null;
    humanEvaluation: Evaluation | null;
    finalReport: FinalReport | null;
  }> {
    const session = await prisma.evaluationSession.findUnique({
      where: { id: sessionId },
      include: {
        rubric: {
          include: { judgeRecords: true },
        },
        result: true,
      },
    });

    if (!session) {
      throw new Error('Session not found');
    }

    const metadata = session.metadata as SessionMetadata | null;

    // Determine status based on session state
    let status: GraphSessionStatus = 'pending';
    if (session.status === SESSION_STATUS.COMPLETED) {
      status = 'completed';
    } else if (session.status === SESSION_STATUS.FAILED) {
      status = 'failed';
    } else if (session.rubric) {
      if (session.rubric.reviewStatus === REVIEW_STATUS.PENDING) {
        status = 'awaiting_rubric_review';
      } else if (
        session.rubric.judgeRecords.some((r) => r.evaluatorType === 'human')
      ) {
        status = 'completed';
      } else {
        status = 'awaiting_human_evaluation';
      }
    }

    return {
      sessionId,
      status,
      threadId: metadata?.threadId ?? null,
      rubricDraft: session.rubric
        ? this.transformDbRubricToState(session.rubric)
        : null,
      rubricFinal:
        session.rubric?.reviewStatus === REVIEW_STATUS.APPROVED
          ? this.transformDbRubricToState(session.rubric)
          : null,
      agentEvaluation: session.rubric
        ? this.extractEvaluation(session.rubric.judgeRecords, 'agent')
        : null,
      humanEvaluation: session.rubric
        ? this.extractEvaluation(session.rubric.judgeRecords, 'human')
        : null,
      finalReport: session.result
        ? this.transformResultToFinalReport(session.result)
        : null,
    };
  }

  private transformDbRubricToState(dbRubric: {
    rubricId: string;
    version: string;
    criteria: Prisma.JsonValue;
    totalWeight: Prisma.Decimal;
    createdAt: Date;
    updatedAt: Date;
  }): Rubric {
    return {
      id: dbRubric.rubricId,
      version: dbRubric.version,
      criteria: dbRubric.criteria as unknown as Rubric['criteria'],
      totalWeight: Number(dbRubric.totalWeight),
      createdAt: dbRubric.createdAt.toISOString(),
      updatedAt: dbRubric.updatedAt.toISOString(),
    };
  }

  private extractEvaluation(
    judgeRecords: Array<{
      evaluatorType: string;
      scores: Prisma.JsonValue;
      overallScore: Prisma.Decimal;
      summary: string;
      timestamp: Date;
    }>,
    type: 'agent' | 'human'
  ): Evaluation | null {
    const record = judgeRecords.find((r) => r.evaluatorType === type);
    if (!record) return null;

    return {
      evaluatorType: type,
      scores: record.scores as unknown as Evaluation['scores'],
      overallScore: Number(record.overallScore),
      summary: record.summary,
      timestamp: record.timestamp.toISOString(),
    };
  }

  private transformResultToFinalReport(result: {
    verdict: string;
    overallScore: Prisma.Decimal;
    summary: string;
    detailedAnalysis: string;
    discrepancies: string[];
    auditTrace: string[];
    generatedAt: Date;
  }): FinalReport {
    return {
      verdict: result.verdict as FinalReport['verdict'],
      overallScore: Number(result.overallScore),
      summary: result.summary,
      detailedAnalysis: result.detailedAnalysis,
      agentEvaluation: null,
      humanEvaluation: null,
      discrepancies: result.discrepancies,
      auditTrace: result.auditTrace,
      generatedAt: result.generatedAt.toISOString(),
    };
  }
}

export const graphExecutionService = new GraphExecutionService();
