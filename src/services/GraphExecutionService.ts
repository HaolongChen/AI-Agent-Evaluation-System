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
   * Validate criteria patches against base rubric
   */
  private validateCriteriaPatches(
    patches: Array<{ criterionId: string }>,
    baseRubric: Rubric
  ): void {
    const validIds = new Set(baseRubric.criteria.map((c) => c.id));

    for (const patch of patches) {
      if (!validIds.has(patch.criterionId)) {
        throw new Error(`Invalid criterionId in patch: ${patch.criterionId}`);
      }
    }
  }

  /**
   * Merge partial criterion patches into existing rubric
   */
  private mergeRubricPatches(
    baseRubric: Rubric,
    patches: Array<{
      criterionId: string;
      name?: string;
      description?: string;
      weight?: number;
      scoringScale?: { min: number; max: number; labels?: Record<number, string> };
      isHardConstraint?: boolean;
    }>
  ): Rubric {
    this.validateCriteriaPatches(patches, baseRubric);

    const criteria = baseRubric.criteria.map((criterion) => {
      const patch = patches.find((p) => p.criterionId === criterion.id);
      if (!patch) return criterion;

      return {
        ...criterion,
        ...(patch.name !== undefined && { name: patch.name }),
        ...(patch.description !== undefined && {
          description: patch.description,
        }),
        ...(patch.weight !== undefined && { weight: patch.weight }),
        ...(patch.scoringScale !== undefined && {
          scoringScale: patch.scoringScale,
        }),
        ...(patch.isHardConstraint !== undefined && {
          isHardConstraint: patch.isHardConstraint,
        }),
      };
    });

    // Recalculate total weight
    const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);

    return {
      ...baseRubric,
      criteria,
      totalWeight,
      version: `${baseRubric.version}-modified`,
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Validate score patches against rubric criteria
   */
  private validateScorePatches(
    patches: Array<{ criterionId: string; score?: number }>,
    rubric: Rubric
  ): void {
    const validIds = new Set(rubric.criteria.map((c) => c.id));

    for (const patch of patches) {
      if (!validIds.has(patch.criterionId)) {
        throw new Error(`Invalid criterionId in patch: ${patch.criterionId}`);
      }

      if (patch.score !== undefined) {
        const criterion = rubric.criteria.find((c) => c.id === patch.criterionId);
        if (
          criterion &&
          (patch.score < criterion.scoringScale.min ||
            patch.score > criterion.scoringScale.max)
        ) {
          throw new Error(
            `Score ${patch.score} out of range [${criterion.scoringScale.min}, ${criterion.scoringScale.max}] for criterion ${patch.criterionId}`
          );
        }
      }
    }
  }

  /**
   * Merge partial score patches into agent evaluation
   */
  private mergeEvaluationPatches(
    baseEvaluation: Evaluation,
    patches: Array<{
      criterionId: string;
      score?: number;
      reasoning?: string;
      evidence?: string[];
    }>,
    rubric: Rubric
  ): Evaluation {
    this.validateScorePatches(patches, rubric);

    const scores = baseEvaluation.scores.map((score) => {
      const patch = patches.find((p) => p.criterionId === score.criterionId);
      if (!patch) return score;

      return {
        ...score,
        ...(patch.score !== undefined && { score: patch.score }),
        ...(patch.reasoning !== undefined && { reasoning: patch.reasoning }),
        ...(patch.evidence !== undefined && { evidence: patch.evidence }),
      };
    });

    const overallScore = scores.reduce((sum, s) => {
      const criterion = rubric.criteria.find((c) => c.id === s.criterionId);
      const weight = criterion ? criterion.weight / rubric.totalWeight : 0;
      return sum + s.score * weight;
    }, 0);

    return {
      evaluatorType: 'human',
      scores,
      overallScore,
      summary: baseEvaluation.summary,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Submit rubric review and resume the graph.
   */
  async submitRubricReview(
    sessionId: number,
    threadId: string,
    approved: boolean,
    modifiedRubric: Rubric | undefined,
    criteriaPatches:
      | Array<{
          criterionId: string;
          name?: string;
          description?: string;
          weight?: number;
          scoringScale?: { min: number; max: number };
          isHardConstraint?: boolean;
        }>
      | undefined,
    feedback: string | undefined,
    reviewerAccountId: string
  ): Promise<RubricReviewResult> {
    try {
      let finalRubric: Rubric | undefined;

      if (criteriaPatches && criteriaPatches.length > 0) {
        const state = await this.getSessionState(sessionId);
        if (!state.rubricDraft) {
          throw new Error('No rubric draft found to patch');
        }

        finalRubric = this.mergeRubricPatches(state.rubricDraft, criteriaPatches);
        logger.info('Merged rubric patches:', { patchCount: criteriaPatches.length });
      } else if (modifiedRubric) {
        finalRubric = modifiedRubric;
        logger.warn(
          'Using deprecated full rubric submission. Consider using criteriaPatches.'
        );
      } else if (!approved) {
        // Rejection without modification is allowed
        finalRubric = undefined;
      }

      if (RUN_KUBERNETES_JOBS) {
        const args = [
          String(sessionId),
          threadId,
          String(approved),
          reviewerAccountId,
          finalRubric ? JSON.stringify(finalRubric) : '',
          feedback ?? '',
        ];

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

        return {
          sessionId,
          threadId,
          status: 'completed',
          rubricFinal: reviewJobResult.rubricFinal ?? null,
          message: reviewJobResult.message || 'Rubric review completed successfully',
        };
      } else {
        const reviewJobRunner = new RubricReviewJobRunner(
          sessionId,
          threadId,
          approved,
          reviewerAccountId,
          finalRubric,
          feedback
        );
        reviewJobRunner.startJob();
        const result = await reviewJobRunner.waitForCompletion();
        logger.info('Rubric review completed:', result);
        return {
          sessionId,
          threadId,
          status: 'completed',
          rubricFinal: result.rubricFinal ?? null,
          message: result.message || 'Rubric review completed successfully',
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
    scores:
      | Array<{ criterionId: string; score: number; reasoning: string }>
      | undefined,
    scorePatches:
      | Array<{
          criterionId: string;
          score?: number;
          reasoning?: string;
          evidence?: string[];
        }>
      | undefined,
    overallAssessment: string,
    evaluatorAccountId: string
  ): Promise<HumanEvaluationResult> {
    try {
      let finalScores: Array<{
        criterionId: string;
        score: number;
        reasoning: string;
        evidence?: string[] | undefined;
      }>;

      if (scorePatches && scorePatches.length > 0) {
        const state = await this.getSessionState(sessionId);
        if (!state.agentEvaluation) {
          throw new Error('No agent evaluation found to patch');
        }
        if (!state.rubricFinal) {
          throw new Error('No final rubric found for weight calculation');
        }

        const mergedEvaluation = this.mergeEvaluationPatches(
          state.agentEvaluation,
          scorePatches,
          state.rubricFinal
        );
        finalScores = mergedEvaluation.scores;
        logger.info('Merged evaluation patches:', {
          patchCount: scorePatches.length,
        });
      } else if (scores) {
        finalScores = scores;
        logger.warn(
          'Using deprecated full score submission. Consider using scorePatches.'
        );
      } else {
        throw new Error('Either scores or scorePatches must be provided');
      }

      if (RUN_KUBERNETES_JOBS) {
        const evaluationJobResult = (await applyAndWatchJob(
          `graph-human-eval-${sessionId}-${Date.now()}`,
          'default',
          './src/jobs/HumanEvaluationJobRunner.ts',
          300000,
          'human-evaluation',
          String(sessionId),
          threadId,
          JSON.stringify(finalScores),
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
          finalScores,
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
