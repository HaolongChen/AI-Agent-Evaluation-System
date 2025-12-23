import { executionService } from '../../services/ExecutionService.ts';
import { logger } from '../../utils/logger.ts';

export const analyticResolver = {
  Query: {
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
    // execAiCopilotByTypeAndModel: async (
    //   _: unknown,
    //   args: {
    //     goldenSetId: number;
    //     skipHumanReview?: boolean;
    //     skipHumanEvaluation?: boolean;
    //   }
    // ) => {
    //   try {
    //     const result = await executionService.createEvaluationSessions(
    //       args.goldenSetId,
    //       {
    //         ...(args.skipHumanReview !== undefined && {
    //           skipHumanReview: args.skipHumanReview,
    //         }),
    //         ...(args.skipHumanEvaluation !== undefined && {
    //           skipHumanEvaluation: args.skipHumanEvaluation,
    //         }),
    //       }
    //     );
    //     // TODO: implement actual execution logic
    //     return result;
    //   } catch (error) {
    //     logger.error('Error executing AI copilot:', error);
    //     throw new Error('Failed to execute AI copilot');
    //   }
    // },
    execAiCopilot: async (
      _: unknown,
      args: { goldenSetId: number; skipHumanReview?: boolean; skipHumanEvaluation?: boolean }
    ) => {
      try {
        // Bulk execution currently defaults to automated; keep signature for forward compatibility
        await executionService.createEvaluationSessions(args.goldenSetId, {
          ...(args.skipHumanReview !== undefined && {
            skipHumanReview: args.skipHumanReview,
          }),
          ...(args.skipHumanEvaluation !== undefined && {
            skipHumanEvaluation: args.skipHumanEvaluation,
          }),
        });
        return true;
      } catch (error) {
        logger.error('Error executing AI copilot:', error);
        throw new Error('Failed to execute AI copilot');
      }
    },
  },
};
