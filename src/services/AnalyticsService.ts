import { prisma } from '../config/prisma.ts';
import { logger } from '../utils/logger.ts';
import { COPILOT_TYPES } from '../config/constants.ts';
import type { Prisma } from '../../build/generated/prisma/client.ts';

export class AnalyticsService {
  async getEvaluationResult(sessionId: string) {
    try {
      return prisma.evaluationResult.findUnique({
        where: { sessionId: parseInt(sessionId) },
        include: {
          session: true,
        },
      });
    } catch (error) {
      logger.error('Error fetching evaluation result:', error);
      throw new Error('Failed to fetch evaluation result');
    }
  }

  async createEvaluationResult(
    sessionId: string,
    copilotType: (typeof COPILOT_TYPES)[keyof typeof COPILOT_TYPES],
    modelName: string,
    reportData: {
      verdict?: string;
      summary?: string;
      detailedAnalysis?: string;
      discrepancies?: string[];
      auditTrace?: string[];
    },
    overallScore: number
  ) {
    try {
      return prisma.evaluationResult.create({
        data: {
          sessionId: parseInt(sessionId),
          copilotType: copilotType,
          modelName: modelName,
          verdict: reportData.verdict ?? 'needs_review',
          overallScore: overallScore,
          summary: reportData.summary ?? '',
          detailedAnalysis: reportData.detailedAnalysis ?? '',
          discrepancies: reportData.discrepancies ?? [],
          auditTrace: reportData.auditTrace ?? [],
        },
      });
    } catch (error) {
      logger.error('Error creating evaluation result:', error);
      throw new Error('Failed to create evaluation result');
    }
  }

  async compareModels(schemaExId: string, modelNames: string[]) {
    try {
      const sessions = await prisma.evaluationSession.findMany({
        where: {
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
          detailedAnalysis: modelSessions[0]?.result?.detailedAnalysis || '',
          overallScore: avgScore,
          avgLatencyMs: Math.round(avgLatency),
          avgTokens: Math.round(avgTokens),
          passRate: avgScore / 100, // Assuming score is 0-100
        };
      });

      return {
        schemaExId,
        models: modelPerformance,
      };
    } catch (error) {
      logger.error('Error comparing models:', error);
      throw new Error('Failed to compare models');
    }
  }

  async getDashboardMetrics(filters: {
    copilotType?: (typeof COPILOT_TYPES)[keyof typeof COPILOT_TYPES];
    modelName?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    try {
      const sessions = await prisma.evaluationSession.findMany({
        where: {
          status: 'completed',
          ...(filters.copilotType && {
            copilotType: filters.copilotType as
              | 'dataModel'
              | 'uiBuilder'
              | 'actionflow'
              | 'logAnalyzer'
              | 'agentBuilder',
          }),
          ...(filters.modelName && { modelName: filters.modelName }),
          ...(filters.startDate && { startedAt: { gte: filters.startDate } }),
          ...(filters.endDate && { startedAt: { lte: filters.endDate } }),
        },
        include: {
          result: true,
        },
      });

      const totalSessions = sessions.length;
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

  async createEvaluationSession(
    goldenSetId: number,
    copilotType: (typeof COPILOT_TYPES)[keyof typeof COPILOT_TYPES],
    modelName: string,
    candidateOutput: string,
    status: 'pending' | 'running' | 'completed' | 'failed',
    metadata: Prisma.InputJsonValue
  ) {
    try {
      return prisma.evaluationSession.create({
        data: {
          goldenSetId,
          copilotType,
          modelName,
          editableText: candidateOutput,
          status,
          metadata,
        },
      });
    } catch (error) {
      logger.error('Error creating evaluation session:', error);
      throw new Error('Failed to create evaluation session');
    }
  }
}

export const analyticsService = new AnalyticsService();
