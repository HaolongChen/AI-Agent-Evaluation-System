import { rubricService } from '../../services/RubricService.ts';
import type { REVIEW_STATUS } from '../../config/constants.ts';
import { REVERSE_REVIEW_STATUS } from '../../config/constants.ts';
import { logger } from '../../utils/logger.ts';

/**
 * Transform rubric data from Prisma to GraphQL format
 * Converts lowercase enum values to uppercase GraphQL enum values
 */
function transformRubric(rubric: Record<string, unknown>) {
  return {
    ...rubric,
    reviewStatus:
      REVERSE_REVIEW_STATUS[rubric['reviewStatus'] as string] ||
      rubric['reviewStatus'],
  };
}

export const rubricResolver = {
  Query: {
    getAdaptiveRubricsBySessionId: async (
      _: unknown,
      args: { sessionId: string }
    ) => {
      try {
        const rubrics = await rubricService.getRubricsBySession(
          args.sessionId
        );
        return rubrics.map((r) =>
          transformRubric(r as unknown as Record<string, unknown>)
        );
      } catch (error) {
        logger.error('Error fetching adaptive rubrics by sessionId:', error);
        throw new Error('Failed to fetch adaptive rubrics by sessionId');
      }
    },

    getAdaptiveRubricsBySession: async (
      _: unknown,
      args: { sessionId: string }
    ) => {
      try {
        const rubrics = await rubricService.getRubricsBySession(args.sessionId);
        return rubrics.map((r) =>
          transformRubric(r as unknown as Record<string, unknown>)
        );
      } catch (error) {
        logger.error('Error fetching adaptive rubrics by sessionId:', error);
        throw new Error('Failed to fetch adaptive rubrics by sessionId');
      }
    },

    getRubricsForReview: async (
      _: unknown,
      args: {
        sessionId?: number;
        projectExId?: string;
        schemaExId?: string;
        reviewStatus?: (typeof REVIEW_STATUS)[keyof typeof REVIEW_STATUS];
      }
    ) => {
      try {
        const rubrics = await rubricService.getRubricsForReview(
          args.sessionId,
          args.projectExId,
          args.schemaExId,
          args.reviewStatus ?? 'pending'
        );
        return rubrics.map((r) =>
          transformRubric(r as unknown as Record<string, unknown>)
        );
      } catch (error) {
        logger.error('Error fetching rubrics for review:', error);
        throw new Error('Failed to fetch rubrics for review');
      }
    },
  },

  Mutation: {
  },
};
