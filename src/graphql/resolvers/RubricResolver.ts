import { rubricService } from '../../services/RubricService.ts';
import { judgeService } from '../../services/JudgeService.ts';
import type { rubricContentType } from '../../utils/types.ts';
import type { REVIEW_STATUS } from '../../config/constants.ts';

export const rubricResolver = {
  Query: {
    getAdaptiveRubricsBySchemaExId: async (
      _: unknown,
      args: { schemaExId: string }
    ) => {
      return rubricService.getRubricsBySchemaExId(args.schemaExId);
    },

    getAdaptiveRubricsBySession: async (
      _: unknown,
      args: { sessionId: string }
    ) => {
      return rubricService.getRubricsBySession(args.sessionId);
    },

    getRubricsForReview: async (
      _: unknown,
      args: { reviewStatus: (typeof REVIEW_STATUS)[keyof typeof REVIEW_STATUS] }
    ) => {
      return rubricService.getRubricsForReview(args.reviewStatus);
    },
  },

  Mutation: {
    generateAdaptiveRubricsBySchemaExId: async (
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _: unknown,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _args: { schemaExId: string; sessionId: string }
    ) => {
      // TODO: Implement rubric generation logic
      return [];
    },

    reviewAdaptiveRubric: async (
      _: unknown,
      args: {
        rubricId: string;
        reviewStatus: (typeof REVIEW_STATUS)[keyof typeof REVIEW_STATUS];
        reviewerAccountId: string;
        modifiedRubricContent?: rubricContentType;
      }
    ) => {
      return rubricService.reviewRubric(
        args.rubricId,
        args.reviewStatus,
        args.reviewerAccountId,
        args.modifiedRubricContent
      );
    },

    judge: async (
      _: unknown,
      args: {
        adaptiveRubricId: string;
        accountId: string;
        result: boolean;
        confidenceScore: number[];
        notes?: string;
      }
    ) => {
      return judgeService.createJudgeRecord(
        args.adaptiveRubricId,
        args.accountId,
        args.result,
        args.confidenceScore,
        args.notes
      );
    },
  },
};
