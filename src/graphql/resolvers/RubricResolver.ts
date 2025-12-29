import { rubricService } from '../../services/RubricService.ts';
import { REVERSE_REVIEW_STATUS, REVIEW_STATUS } from '../../config/constants.ts';
import { logger } from '../../utils/logger.ts';

interface RubricRecord {
  reviewStatus: string;
  [key: string]: unknown;
}

const graphqlToDbReviewStatus: Record<string, (typeof REVIEW_STATUS)[keyof typeof REVIEW_STATUS]> = {
  PENDING: REVIEW_STATUS.PENDING,
  APPROVED: REVIEW_STATUS.APPROVED,
  REJECTED: REVIEW_STATUS.REJECTED,
  MODIFIED: REVIEW_STATUS.MODIFIED,
};

function transformRubric(rubric: RubricRecord) {
  return {
    ...rubric,
    reviewStatus:
      REVERSE_REVIEW_STATUS[rubric.reviewStatus] ?? rubric.reviewStatus,
  };
}

export const rubricResolver = {
  Query: {
    getRubricsBySessionId: async (
      _: unknown,
      args: { sessionId: number }
    ) => {
      try {
        const rubrics = await rubricService.getQuestionsBySession(args.sessionId);
        return rubrics.map((r) => transformRubric(r as RubricRecord));
      } catch (error) {
        logger.error('Error fetching rubrics by sessionId:', error);
        throw new Error('Failed to fetch rubrics by sessionId');
      }
    },

    getRubricsForReview: async (
      _: unknown,
      args: {
        sessionId?: number;
        reviewStatus?: string;
      }
    ) => {
      try {
        const dbStatus = args.reviewStatus
          ? graphqlToDbReviewStatus[args.reviewStatus]
          : undefined;

        const rubrics = await rubricService.getQuestionsForReview(
          args.sessionId,
          dbStatus ?? REVIEW_STATUS.PENDING
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
