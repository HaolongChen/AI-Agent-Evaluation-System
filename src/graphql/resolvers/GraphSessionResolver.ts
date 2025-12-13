import { graphExecutionService } from '../../services/GraphExecutionService.ts';
import { logger } from '../../utils/logger.ts';
import type { CopilotType } from '../../generated/prisma/enums.ts';
import type { Rubric, RubricCriterion } from '../../langGraph/state/state.ts';

/**
 * Input types matching GraphQL schema
 */
export interface RubricCriterionInput {
  id: string;
  name: string;
  description: string;
  weight: number;
  scoringScale: {
    min: number;
    max: number;
    labels?: Record<string, string>;
  };
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
        scoringScale: {
          min: c.scoringScale.min,
          max: c.scoringScale.max,
          ...(c.scoringScale.labels && {
            labels: c.scoringScale.labels as Record<number, string>,
          }),
        },
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
 *
 * Alternatively:
 * - runAutomatedEvaluation - Runs the entire flow without human intervention
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
          rubricDraft: state.rubricDraft,
          rubricFinal: state.rubricFinal,
          agentEvaluation: state.agentEvaluation,
          humanEvaluation: state.humanEvaluation,
          finalReport: state.finalReport,
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
        projectExId: string;
        schemaExId: string;
        copilotType: CopilotType;
        modelName: string;
        skipHumanReview?: boolean;
        skipHumanEvaluation?: boolean;
      }
    ) => {
      try {
        logger.info('Starting graph session', {
          projectExId: args.projectExId,
          schemaExId: args.schemaExId,
          copilotType: args.copilotType,
          modelName: args.modelName,
        });

        const result = await graphExecutionService.startSession(
          args.projectExId,
          args.schemaExId,
          args.copilotType,
          args.modelName,
          args.skipHumanReview ?? false,
          args.skipHumanEvaluation ?? false
        );

        return {
          sessionId: result.sessionId,
          threadId: result.threadId,
          status: mapStatusToGraphQL(result.status),
          rubricDraft: result.rubricDraft,
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
        reviewerAccountId: string;
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
          args.reviewerAccountId
        );

        return {
          sessionId: result.sessionId,
          threadId: result.threadId,
          status: mapStatusToGraphQL(result.status),
          rubricFinal: result.rubricFinal,
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
        evaluatorAccountId: string;
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
          args.evaluatorAccountId
        );

        return {
          sessionId: result.sessionId,
          threadId: result.threadId,
          status: mapStatusToGraphQL(result.status),
          finalReport: result.finalReport,
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

    /**
     * Run a fully automated evaluation without human intervention.
     * Useful for batch processing or when HITL is not required.
     */
    runAutomatedEvaluation: async (
      _: unknown,
      args: {
        projectExId: string;
        schemaExId: string;
        copilotType: CopilotType;
        modelName: string;
      }
    ) => {
      try {
        logger.info('Running automated evaluation', {
          projectExId: args.projectExId,
          schemaExId: args.schemaExId,
        });

        const result = await graphExecutionService.runAutomatedEvaluation(
          args.projectExId,
          args.schemaExId,
          args.copilotType,
          args.modelName
        );

        return {
          sessionId: result.sessionId,
          threadId: result.threadId,
          status: 'COMPLETED',
          finalReport: result.finalReport,
          message: 'Automated evaluation completed successfully',
        };
      } catch (error) {
        logger.error('Error running automated evaluation:', error);
        throw new Error(
          `Failed to run automated evaluation: ${
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
