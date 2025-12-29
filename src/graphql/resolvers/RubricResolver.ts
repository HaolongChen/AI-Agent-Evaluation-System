import { rubricService } from '../../services/RubricService.ts';
import type { REVIEW_STATUS } from '../../config/constants.ts';
import { REVERSE_REVIEW_STATUS } from '../../config/constants.ts';
import { logger } from '../../utils/logger.ts';

interface RubricRecord {
  reviewStatus: string;
  [key: string]: unknown;
}

function transformRubric(rubric: RubricRecord) {
  return {
    ...rubric,
    reviewStatus:
      REVERSE_REVIEW_STATUS[rubric.reviewStatus] || rubric.reviewStatus,
  };
}

export const rubricResolver = {
  Query: {
    getAdaptiveRubricsBySessionId: async (
      _: unknown,
      args: { sessionId: string }
    ) => {
      try {
        const rubrics = await rubricService.getQuestionsBySession(
          parseInt(args.sessionId)
        );
        return rubrics.map((r) => transformRubric(r as RubricRecord));
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
        const rubrics = await rubricService.getQuestionsBySession(
          parseInt(args.sessionId)
        );
        return rubrics.map((r) => transformRubric(r as RubricRecord));
      } catch (error) {
        logger.error('Error fetching adaptive rubrics by sessionId:', error);
        throw new Error('Failed to fetch adaptive rubrics by sessionId');
      }
    },

    getRubricsForReview: async (
      _: unknown,
      args: {
        sessionId?: number;
        reviewStatus?: (typeof REVIEW_STATUS)[keyof typeof REVIEW_STATUS];
      }
    ) => {
      try {
        const rubrics = await rubricService.getQuestionsForReview(
          args.sessionId,
          args.reviewStatus ?? 'pending'
        );
        return rubrics.map((r) => transformRubric(r as RubricRecord));
      } catch (error) {
        logger.error('Error fetching rubrics for review:', error);
        throw new Error('Failed to fetch rubrics for review');
      }
    },
  },

  Mutation: {},
};
