import { executionService } from '../../services/ExecutionService.ts';
import { analyticsService } from '../../services/AnalyticsService.ts';
import { logger } from '../../utils/logger.ts';

const graphStatusMapping: Record<string, string> = {
  completed: 'COMPLETED',
  awaiting_rubric_review: 'AWAITING_RUBRIC_REVIEW',
  awaiting_human_evaluation: 'AWAITING_HUMAN_EVALUATION',
  pending: 'PENDING',
  failed: 'FAILED',
};

export const analyticResolver = {
  Query: {
    getEvaluationResult: async (_: unknown, args: { sessionId: number }) => {
      try {
        const result = await analyticsService.getEvaluationResult(
          String(args.sessionId)
        );
        return result;
      } catch (error) {
        logger.error('Error fetching evaluation result:', error);
        throw new Error('Failed to fetch evaluation result');
      }
    },

    compareModels: async (
      _: unknown,
      args: { schemaExId: string; modelNames: string[] }
    ) => {
      void args.modelNames;
      return { schemaExId: args.schemaExId, models: [] };
    },

    getDashboardMetrics: async (
      _: unknown,
      args: {
        copilotType?: string;
        modelName?: string;
        startDate?: string;
        endDate?: string;
      }
    ) => {
      void args;
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
    startEvaluationSession: async (
      _: unknown,
      args: {
        goldenSetId: number;
        modelName?: string;
        skipHumanReview?: boolean;
        skipHumanEvaluation?: boolean;
      }
    ) => {
      try {
        const options: { skipHumanReview?: boolean; skipHumanEvaluation?: boolean } = {};
        if (args.skipHumanReview !== undefined) {
          options.skipHumanReview = args.skipHumanReview;
        }
        if (args.skipHumanEvaluation !== undefined) {
          options.skipHumanEvaluation = args.skipHumanEvaluation;
        }

        const result = await executionService.startEvaluationSession(
          args.goldenSetId,
          args.modelName,
          Object.keys(options).length > 0 ? options : undefined
        );
        return {
          sessionId: result.sessionId,
          threadId: result.threadId,
          status: graphStatusMapping[result.status] ?? result.status,
          questionSetDraft: result.questionSetDraft,
          message: result.message,
        };
      } catch (error) {
        logger.error('Error starting evaluation session:', error);
        throw new Error('Failed to start evaluation session');
      }
    },

    execAiCopilot: async (
      _: unknown,
      args: {
        goldenSetId: number;
        skipHumanReview?: boolean;
        skipHumanEvaluation?: boolean;
      }
    ) => {
      try {
        const options: { skipHumanReview?: boolean; skipHumanEvaluation?: boolean } = {};
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
        logger.error('Error executing AI copilot:', error);
        throw new Error('Failed to execute AI copilot');
      }
    },
  },
};
