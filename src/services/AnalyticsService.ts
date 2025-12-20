import { prisma } from '../config/prisma.ts';
import { logger } from '../utils/logger.ts';

export class AnalyticsService {
  async getEvaluationResult(simulationId: string) {
    try {
      const result = await prisma.evaluationResult.findUnique({
        where: { simulationId: parseInt(simulationId) },
        include: {
          simulation: true,
        },
      });
      return result;
    } catch (error) {
      logger.error('Error fetching evaluation result:', error);
      throw new Error('Failed to fetch evaluation result');
    }
  }

  async getEvaluationResultsByGoldenSet(goldenSetId: number) {
    try {
      // Get all simulations for this golden set and their results
      const simulations = await prisma.copilotSimulation.findMany({
        where: { goldenSetId },
        include: {
          result: true,
        },
      });
      return simulations.filter((s) => s.result !== null).map((s) => s.result);
    } catch (error) {
      logger.error('Error fetching evaluation results by golden set:', error);
      throw new Error('Failed to fetch evaluation results');
    }
  }

  async createEvaluationResult(
    simulationId: number,
    reportData: {
      verdict?: string;
      summary?: string;
      discrepancies?: string[];
    },
    overallScore: number
  ) {
    try {
      const result = await prisma.evaluationResult.create({
        data: {
          simulationId,
          evaluationStatus: 'completed',
          verdict: reportData.verdict ?? 'needs_review',
          overallScore: overallScore,
          summary: reportData.summary ?? '',
          discrepancies: reportData.discrepancies ?? [],
        },
      });
      return result;
    } catch (error) {
      logger.error('Error creating evaluation result:', error);
      throw new Error('Failed to create evaluation result');
    }
  }

  async compareModels(goldenSetId: number, modelNames: string[]) {
    try {
      const sessions = await prisma.copilotSimulation.findMany({
        where: {
          goldenSetId,
          modelName: { in: modelNames },
          status: 'completed',
        },
        include: {
          result: true,
        },
      });

      // Group by model and calculate aggregated metrics
      const modelPerformance = modelNames.map((modelName) => {
        const modelSessions = sessions.filter((s) => s.modelName === modelName);

        if (modelSessions.length === 0) {
          return {
            modelName,
            metrics: {},
            overallScore: 0,
            avgLatencyMs: 0,
            avgTokens: 0,
            passRate: 0,
          };
        }

        const avgLatency =
          modelSessions.reduce((sum, s) => sum + (s.totalLatencyMs || 0), 0) /
          modelSessions.length;
        const avgTokens =
          modelSessions.reduce(
            (sum, s) => sum + (s.inputTokens || 0) + (s.outputTokens || 0),
            0
          ) / modelSessions.length;
        const avgScore =
          modelSessions.reduce(
            (sum, s) => sum + (s.result ? Number(s.result.overallScore) : 0),
            0
          ) / modelSessions.length;

        return {
          modelName,
          summary: modelSessions[0]?.result?.summary || '',
          overallScore: avgScore,
          avgLatencyMs: Math.round(avgLatency),
          avgTokens: Math.round(avgTokens),
          passRate: avgScore / 100, // Assuming score is 0-100
        };
      });

      return {
        goldenSetId,
        models: modelPerformance,
      };
    } catch (error) {
      logger.error('Error comparing models:', error);
      throw new Error('Failed to compare models');
    }
  }

  async getDashboardMetrics(filters: {
    modelName?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    try {
      const sessions = await prisma.copilotSimulation.findMany({
        where: {
          status: 'completed',
          ...(filters.modelName && { modelName: filters.modelName }),
          ...(filters.startDate && { startedAt: { gte: filters.startDate } }),
          ...(filters.endDate && { startedAt: { lte: filters.endDate } }),
        },
        include: {
          result: true,
        },
      });

      const totalSessions = sessions.length;
      if (totalSessions === 0) {
        return {
          totalSessions: 0,
          avgOverallScore: 0,
          avgLatencyMs: 0,
          avgTokenUsage: 0,
          passRateByCategory: [],
          modelPerformanceTrend: [],
        };
      }

      const avgOverallScore =
        sessions.reduce(
          (sum, s) => sum + (s.result ? Number(s.result.overallScore) : 0),
          0
        ) / totalSessions;
      const avgLatencyMs =
        sessions.reduce((sum, s) => sum + (s.totalLatencyMs || 0), 0) /
        totalSessions;
      const avgTokenUsage =
        sessions.reduce(
          (sum, s) => sum + (s.inputTokens || 0) + (s.outputTokens || 0),
          0
        ) / totalSessions;

      return {
        totalSessions,
        avgOverallScore: Math.round(avgOverallScore * 100) / 100,
        avgLatencyMs: Math.round(avgLatencyMs),
        avgTokenUsage: Math.round(avgTokenUsage),
        passRateByCategory: [], // TODO: Implement category-based analysis
        modelPerformanceTrend: [], // TODO: Implement trend analysis
      };
    } catch (error) {
      logger.error('Error fetching dashboard metrics:', error);
      throw new Error('Failed to fetch dashboard metrics');
    }
  }
}

export const analyticsService = new AnalyticsService();
