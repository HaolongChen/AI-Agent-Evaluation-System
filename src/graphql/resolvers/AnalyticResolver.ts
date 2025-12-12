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
          args.modelName
        );
        // TODO: implement actual execution logic
        return result ? true : false;
      } catch (error) {
        logger.error('Error executing AI copilot:', error);
        throw new Error('Failed to execute AI copilot');
      }
    },
    execAiCopilot: async () => {
      try {
        const result = await executionService.createEvaluationSessions();
        return result ? true : false;
      } catch (error) {
        logger.error('Error executing AI copilot:', error);
        throw new Error('Failed to execute AI copilot');
      }
    },

    execAiCopilotWithHITL: async (
      _: unknown,
      args: {
        projectExId: string;
        schemaExId: string;
        copilotType: copilotType;
        modelName: string;
        skipHumanReview?: boolean;
        skipHumanEvaluation?: boolean;
      }
    ) => {
      try {
        const result = await executionService.createEvaluationSessionWithHITL(
          args.projectExId,
          args.schemaExId,
          args.copilotType,
          args.modelName,
          {
            skipHumanReview: args.skipHumanReview,
            skipHumanEvaluation: args.skipHumanEvaluation,
          }
        );
        return result;
      } catch (error) {
        logger.error('Error executing AI copilot with HITL:', error);
        throw new Error('Failed to execute AI copilot with HITL');
      }
    },

    resumeRubricReview: async (
      _: unknown,
      args: {
        sessionId: number;
        approved: boolean;
        modifiedRubric?: unknown;
        feedback?: string;
      }
    ) => {
      try {
        const result = await executionService.resumeRubricReview(
          args.sessionId.toString(),
          {
            approved: args.approved,
            modifiedRubric: args.modifiedRubric as any,
            feedback: args.feedback,
          }
        );
        return result;
      } catch (error) {
        logger.error('Error resuming rubric review:', error);
        throw new Error('Failed to resume rubric review');
      }
    },

    resumeHumanEvaluation: async (
      _: unknown,
      args: {
        sessionId: number;
        scores: Array<{
          criterionId: string;
          score: number;
          reasoning: string;
        }>;
        overallAssessment: string;
      }
    ) => {
      try {
        const result = await executionService.resumeHumanEvaluation(
          args.sessionId.toString(),
          {
            scores: args.scores,
            overallAssessment: args.overallAssessment,
          }
        );
        return result;
      } catch (error) {
        logger.error('Error resuming human evaluation:', error);
        throw new Error('Failed to resume human evaluation');
      }
    },
  },
};
