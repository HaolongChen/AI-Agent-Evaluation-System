import { executionService } from '../../services/ExecutionService.ts';
import { logger } from '../../utils/logger.ts';
import type { copilotType } from '../../utils/types.ts';

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
    execAiCopilotByTypeAndModel: async (
      _: unknown,
      args: {
        projectExId: string;
        schemaExId: string;
        copilotType: copilotType;
        modelName: string;
      }
    ) => {
      try {
        const result = await executionService.createEvaluationSession(
          args.projectExId,
          args.schemaExId,
          args.copilotType,
          // args.modelName
        );
        // TODO: implement actual execution logic
        return result ? true : false;
      } catch (error) {
        logger.error('Error executing AI copilot:', error);
        throw new Error('Failed to execute AI copilot');
      }
    },
  },
};
