import { prisma } from '../config/prisma.ts';

export class AnalyticsService {
  async getEvaluationResult(sessionId: string) {
    return prisma.evaluation_result.findUnique({
      where: { sessionId: BigInt(sessionId) },
      include: {
        session: true,
      },
    });
  }

  async createEvaluationResult(
    sessionId: string,
    schemaExId: string,
    metrics: object,
    overallScore: number
  ) {
    return prisma.evaluation_result.create({
      data: {
        sessionId: BigInt(sessionId),
        schemaExId: schemaExId,
        metrics,
        overallScore: overallScore,
      },
    });
  }

  async compareModels(schemaExId: string, modelNames: string[]) {
    const sessions = await prisma.evaluation_session.findMany({
      where: {
        schemaExId: schemaExId,
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
        metrics: modelSessions[0]?.result?.metrics || {},
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
  }

  async getDashboardMetrics(filters: {
    copilotType?: string;
    modelName?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const sessions = await prisma.evaluation_session.findMany({
      where: {
        status: 'completed',
        ...(filters.copilotType && { copilotType: filters.copilotType as 'dataModel' | 'uiBuilder' | 'actionflow' | 'logAnalyzer' | 'agentBuilder' }),
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
  }
}

export const analyticsService = new AnalyticsService();
