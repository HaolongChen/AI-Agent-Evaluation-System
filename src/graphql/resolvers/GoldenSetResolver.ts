import { goldenSetService } from '../../services/GoldenSetService.ts';
import { executionService } from '../../services/ExecutionService.ts';
import { rubricService } from '../../services/RubricService.ts';
import { judgeService } from '../../services/JudgeService.ts';
import type { copilotType, rubricContentType } from '../../utils/types.ts';
import type { REVIEW_STATUS } from '../../config/constants.ts';

export const resolvers = {
  Query: {
    getGoldenSetSchemas: async (_: unknown, args: { copilotType?: copilotType }) => {
      return goldenSetService.getGoldenSetSchemas(args.copilotType);
    },

    getGoldenSet: async (
      _: unknown,
      args: { projectExId?: string; copilotType?: copilotType }
    ) => {
      return goldenSetService.getGoldenSet(args.projectExId, args.copilotType);
    },

    getSession: async (_: unknown, args: { id: string }) => {
      return executionService.getSession(args.id);
    },

    getSessions: async (
      _: unknown,
      args: { schemaExId?: string; copilotType?: copilotType; modelName?: string }
    ) => {
      return executionService.getSessions(args);
    },

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
      args: { reviewStatus: typeof REVIEW_STATUS[keyof typeof REVIEW_STATUS] }
    ) => {
      return rubricService.getRubricsForReview(args.reviewStatus);
    },

    getEvaluationResult: async (
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _: unknown,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _args: { sessionId: string }
    ) => {
      // TODO: Implement analytics service method
      return null;
    },

    compareModels: async (
      _: unknown,
      args: { schemaExId: string; modelNames: string[] }
    ) => {
      // TODO: Implement model comparison
      return { schemaExId: args.schemaExId, models: [] };
    },

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getDashboardMetrics: async (_: unknown, _args: Record<string, unknown>) => {
      // TODO: Implement dashboard metrics
      return {
        totalSessions: 0,
        avgOverallScore: 0,
        avgLatencyMs: 0,
        avgTokenUsage: 0,
        passRateByCategory: [],
        modelPerformanceTrend: [],
      };
    },
  },

  Mutation: {
    updateGoldenSetProject: async (
      _: unknown,
      args: {
        projectExId: string;
        schemaExId: string;
        copilotType: copilotType;
        description: string;
        promptTemplate: string;
        idealResponse: object;
      }
    ) => {
      return goldenSetService.updateGoldenSetProject(
        args.projectExId,
        args.schemaExId,
        args.copilotType,
        args.description,
        args.promptTemplate,
        args.idealResponse
      );
    },

    execAiCopilotByTypeAndModel: async (
      _: unknown,
      args: {
        projectExId: string;
        schemaExId: string;
        copilotType: copilotType;
        modelName: string;
      }
    ) => {
      return executionService.createEvaluationSession(
        args.projectExId,
        args.schemaExId,
        args.copilotType,
        args.modelName
      );
    },

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
        reviewStatus: typeof REVIEW_STATUS[keyof typeof REVIEW_STATUS];
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
