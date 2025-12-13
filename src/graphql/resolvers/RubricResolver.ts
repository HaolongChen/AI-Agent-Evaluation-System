import { rubricService } from '../../services/RubricService.ts';
import { judgeService } from '../../services/JudgeService.ts';
import type { REVIEW_STATUS } from '../../config/constants.ts';
import { logger } from '../../utils/logger.ts';

export const rubricResolver = {
  Query: {
    getAdaptiveRubricsBySchemaExId: async (
      _: unknown,
      args: { schemaExId: string }
    ) => {
      try {
        const rubrics = await rubricService.getRubricsBySchemaExId(
          args.schemaExId
        );
        return rubrics;
      } catch (error) {
        logger.error('Error fetching adaptive rubrics by schemaExId:', error);
        throw new Error('Failed to fetch adaptive rubrics by schemaExId');
      }
    },

    getAdaptiveRubricsBySession: async (
      _: unknown,
      args: { sessionId: string }
    ) => {
      try {
        const rubrics = await rubricService.getRubricsBySession(args.sessionId);
        return rubrics;
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
        adaptiveRubricId: string;
        evaluatorType: string;
        accountId: string | null;
        result: boolean[];
        confidenceScore: number[];
        notes?: string;
      }
    ) => {
      try {
        const result = await judgeService.createJudgeRecord(
          args.adaptiveRubricId,
          args.evaluatorType,
          args.accountId,
          args.result,
          args.confidenceScore,
          args.notes
        );
        return result;
      } catch (error) {
        logger.error('Error creating judge record:', error);
        throw new Error('Failed to create judge record');
      }
    },
  },
};
