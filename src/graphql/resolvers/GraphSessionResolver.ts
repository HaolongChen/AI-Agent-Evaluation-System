import { graphExecutionService } from '../../services/GraphExecutionService.ts';
import { logger } from '../../utils/logger.ts';
import type {
  Rubric,
  RubricCriterion,
  Evaluation,
  FinalReport,
} from '../../langGraph/state/state.ts';

/**
 * Input types matching GraphQL schema
 */
export interface RubricCriterionInput {
  id: string;
  name: string;
  description: string;
  weight: number;
  scoringScale: { min: number; max: number; labels?: Record<number, string> };
  isHardConstraint: boolean;
}

export interface RubricInput {
  id: string;
  version: string;
  criteria: RubricCriterionInput[];
  totalWeight: number;
}

export interface EvaluationScoreInput {
  criterionId: string;
  score: number;
  reasoning: string;
  evidence?: string[];
}

/**
 * Transform RubricInput to Rubric (adds timestamps)
 */
function transformRubricInput(
  input: RubricInput | null | undefined
): Rubric | undefined {
  if (!input) return undefined;

  const now = new Date().toISOString();
  return {
    id: input.id,
    version: input.version,
    criteria: input.criteria.map(
      (c): RubricCriterion => ({
        id: c.id,
        name: c.name,
        description: c.description,
        weight: c.weight,
        scoringScale: c.scoringScale,
        isHardConstraint: c.isHardConstraint,
      })
    ),
    totalWeight: input.totalWeight,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * GraphSessionResolver
 *
 * Handles HITL (Human-in-the-Loop) graph execution mutations and queries.
 *
 * Flow:
 * 1. startGraphSession - Starts the evaluation, returns when paused at humanReviewer
 * 2. submitRubricReview - Provides rubric review, resumes until humanEvaluator
 * 3. submitHumanEvaluation - Provides evaluation, completes the flow
 */
export const graphSessionResolver = {
  Query: {
    /**
     * Get the current state of a graph session
     */
    getGraphSessionState: async (_: unknown, args: { sessionId: number }) => {
      try {
        const state = await graphExecutionService.getSessionState(
          args.sessionId
        );
        return {
          sessionId: state.sessionId,
          status: mapStatusToGraphQL(state.status),
          threadId: state.threadId,
          rubricDraft: state.rubricDraft
            ? transformRubricToOutput(state.rubricDraft)
            : null,
          rubricFinal: state.rubricFinal
            ? transformRubricToOutput(state.rubricFinal)
            : null,
          agentEvaluation: state.agentEvaluation
            ? transformEvaluationToOutput(state.agentEvaluation)
            : null,
          humanEvaluation: state.humanEvaluation
            ? transformEvaluationToOutput(state.humanEvaluation)
            : null,
          finalReport: state.finalReport
            ? transformFinalReportToOutput(state.finalReport)
            : null,
        };
      } catch (error) {
        logger.error('Error getting graph session state:', error);
        throw new Error('Failed to get graph session state');
      }
    },
  },

  Mutation: {
    /**
     * Start a new graph-based evaluation session.
     * Returns immediately after the graph pauses at the first interrupt point.
     */
    startGraphSession: async (
      _: unknown,
      args: {
        goldenSetId: number;
        modelName: string;
        skipHumanReview?: boolean;
        skipHumanEvaluation?: boolean;
      }
    ) => {
      try {
        logger.info('Starting graph session', {
          goldenSetId: args.goldenSetId,
          modelName: args.modelName,
        });

        const result = await graphExecutionService.startSession(
          args.goldenSetId,
          args.modelName,
          args.skipHumanReview ?? false,
          args.skipHumanEvaluation ?? false
        );

        return {
          sessionId: result.sessionId,
          threadId: result.threadId,
          status: mapStatusToGraphQL(result.status),
          rubricDraft: result.rubricDraft
            ? transformRubricToOutput(result.rubricDraft)
            : null,
          message: result.message,
        };
      } catch (error) {
        logger.error('Error starting graph session:', error);
        throw new Error(
          `Failed to start graph session: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }
    },

    /**
     * Submit rubric review and resume the graph.
     * Called after startGraphSession when status is AWAITING_RUBRIC_REVIEW.
     */
    submitRubricReview: async (
      _: unknown,
      args: {
        sessionId: number;
        threadId: string;
        approved: boolean;
        modifiedRubric?: RubricInput | null;
        feedback?: string | null;
        accountId: string;
      }
    ) => {
      try {
        logger.info('Submitting rubric review', {
          sessionId: args.sessionId,
          approved: args.approved,
        });

        const result = await graphExecutionService.submitRubricReview(
          args.sessionId,
          args.threadId,
          args.approved,
          transformRubricInput(args.modifiedRubric),
          args.feedback ?? undefined,
          args.accountId
        );

        return {
          sessionId: result.sessionId,
          threadId: result.threadId,
          status: mapStatusToGraphQL(result.status),
          rubricFinal: result.rubricFinal
            ? transformRubricToOutput(result.rubricFinal)
            : null,
          message: result.message,
        };
      } catch (error) {
        logger.error('Error submitting rubric review:', error);
        throw new Error(
          `Failed to submit rubric review: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }
    },

    /**
     * Submit human evaluation and complete the graph.
     * Called after submitRubricReview when status is AWAITING_HUMAN_EVALUATION.
     */
    submitHumanEvaluation: async (
      _: unknown,
      args: {
        sessionId: number;
        threadId: string;
        scores: EvaluationScoreInput[];
        overallAssessment: string;
        accountId: string;
      }
    ) => {
      try {
        logger.info('Submitting human evaluation', {
          sessionId: args.sessionId,
          scoresCount: args.scores.length,
        });

        const result = await graphExecutionService.submitHumanEvaluation(
          args.sessionId,
          args.threadId,
          args.scores,
          args.overallAssessment,
          args.accountId
        );

        return {
          sessionId: result.sessionId,
          threadId: result.threadId,
          status: mapStatusToGraphQL(result.status),
          finalReport: result.finalReport
            ? transformFinalReportToOutput(result.finalReport)
            : null,
          message: result.message,
        };
      } catch (error) {
        logger.error('Error submitting human evaluation:', error);
        throw new Error(
          `Failed to submit human evaluation: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }
    },
  },
};

/**
 * Map internal status to GraphQL enum
 */
function mapStatusToGraphQL(
  status:
    | 'pending'
    | 'awaiting_rubric_review'
    | 'awaiting_human_evaluation'
    | 'completed'
    | 'failed'
): string {
  const mapping: Record<string, string> = {
    pending: 'PENDING',
    awaiting_rubric_review: 'AWAITING_RUBRIC_REVIEW',
    awaiting_human_evaluation: 'AWAITING_HUMAN_EVALUATION',
    completed: 'COMPLETED',
    failed: 'FAILED',
  };
  return mapping[status] || 'PENDING';
}

/**
 * Transform Rubric to GraphQL RubricOutput
 */
function transformRubricToOutput(rubric: Rubric) {
  return {
    id: rubric.id,
    version: rubric.version,
    criteria: rubric.criteria,
    totalWeight: rubric.totalWeight,
    createdAt: rubric.createdAt,
    updatedAt: rubric.updatedAt,
  };
}

/**
 * Transform Evaluation to GraphQL EvaluationOutput
 */
function transformEvaluationToOutput(evaluation: Evaluation) {
  return {
    evaluatorType: evaluation.evaluatorType,
    scores: evaluation.scores,
    overallScore: evaluation.overallScore,
    summary: evaluation.summary,
    timestamp: evaluation.timestamp,
  };
}

/**
 * Transform FinalReport to GraphQL FinalReportOutput
 */
function transformFinalReportToOutput(report: FinalReport) {
  return {
    verdict: report.verdict,
    overallScore: report.overallScore,
    summary: report.summary,
    detailedAnalysis: report.detailedAnalysis,
    agentEvaluation: report.agentEvaluation
      ? transformEvaluationToOutput(report.agentEvaluation)
      : null,
    humanEvaluation: report.humanEvaluation
      ? transformEvaluationToOutput(report.humanEvaluation)
      : null,
    discrepancies: report.discrepancies,
    auditTrace: report.auditTrace,
    generatedAt: report.generatedAt,
  };
}
