import { executionService } from '../../services/ExecutionService.ts';
import { analyticsService } from '../../services/AnalyticsService.ts';
import { logger } from '../../utils/logger.ts';
import { transformEvaluationResult } from './SessionResolver.ts';

// const graphStatusMapping: Record<string, string> = {
//   completed: 'COMPLETED',
//   awaiting_rubric_review: 'AWAITING_RUBRIC_REVIEW',
//   awaiting_human_evaluation: 'AWAITING_HUMAN_EVALUATION',
//   pending: 'PENDING',
//   failed: 'FAILED',
// };

export const analyticResolver = {
  Query: {
    getEvaluationResult: async (_: unknown, args: { sessionId: number }) => {
      try {
        const result = await analyticsService.getEvaluationResult(
          String(args.sessionId)
        );
        return transformEvaluationResult(
          result as Record<string, unknown> | null | undefined
        );
      } catch (error) {
        logger.error('Error fetching evaluation result:', error);
        throw new Error('Failed to fetch evaluation result');
      }
    },
  },

  Mutation: {
    runEvaluation: async (
      _: unknown,
      args: {
        goldenSetId: number;
        skipHumanReview?: boolean;
        skipHumanEvaluation?: boolean;
      }
    ) => {
      try {
        const options: {
          skipHumanReview?: boolean;
          skipHumanEvaluation?: boolean;
        } = {};
        if (args.skipHumanReview !== undefined) {
          options.skipHumanReview = args.skipHumanReview;
        }
        if (args.skipHumanEvaluation !== undefined) {
          options.skipHumanEvaluation = args.skipHumanEvaluation;
        }

        await executionService.createEvaluationSessions(
          args.goldenSetId,
          Object.keys(options).length > 0 ? options : undefined
        );
        return true;
      } catch (error) {
        logger.error('Error running evaluation:', error);
        throw new Error('Failed to run evaluation');
      }
    },
  },
};
