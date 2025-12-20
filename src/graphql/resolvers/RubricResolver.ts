import { rubricService } from '../../services/RubricService.ts';
import { judgeService } from '../../services/JudgeService.ts';
import type { REVIEW_STATUS } from '../../config/constants.ts';
import { logger } from '../../utils/logger.ts';

export const rubricResolver = {
  Query: {
    getAdaptiveRubricBySession: async (
      _: unknown,
      args: { sessionId: number }
    ) => {
      try {
        const rubrics = await rubricService.getRubricsBySimulationId(
          args.sessionId
        );
        return rubrics;
      } catch (error) {
        logger.error('Error fetching adaptive rubrics by sessionId:', error);
        throw new Error('Failed to fetch adaptive rubrics by sessionId');
      }
    },

    getRubricsForReview: async (
      _: unknown,
      args: {
        rubricId?: number;
        reviewStatus?: (typeof REVIEW_STATUS)[keyof typeof REVIEW_STATUS];
      }
    ) => {
      try {
        const rubrics = await rubricService.getRubricsForReview(
          args.rubricId,
          args.reviewStatus ?? 'pending'
        );
        return rubrics;
      } catch (error) {
        logger.error('Error fetching rubrics for review:', error);
        throw new Error('Failed to fetch rubrics for review');
      }
    },
  },

  Mutation: {
    judge: async (
      _: unknown,
      args: {
        adaptiveRubricId: number;
        evaluatorType: string;
        accountId: string | null;
        answer: string;
        comment?: string;
        overallScore: number;
      }
    ) => {
      try {
        const result = await judgeService.createJudgeRecord(
          String(args.adaptiveRubricId),
          args.evaluatorType,
          args.accountId,
          args.answer,
          args.overallScore,
          args.comment
        );
        return result;
      } catch (error) {
        logger.error('Error creating judge record:', error);
        throw new Error('Failed to create judge record');
      }
    },
  },
};
