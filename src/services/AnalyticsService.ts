import { prisma } from '../config/prisma.ts';

export class AnalyticsService {
  async getEvaluationResult(sessionId: string) {
    return prisma.evaluation_result.findUnique({
      where: { session_id: BigInt(sessionId) },
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
        session_id: BigInt(sessionId),
        schema_ex_id: schemaExId,
        metrics,
        overall_score: overallScore,
      },
    });
  }

  async compareModels(schemaExId: string, modelNames: string[]) {
    const sessions = await prisma.evaluation_session.findMany({
      where: {
        schema_ex_id: schemaExId,
        model_name: { in: modelNames },
        status: 'completed',
      },
      include: {
        result: true,
      },
    });

    // Group by model and calculate aggregated metrics
    const modelPerformance = modelNames.map((modelName) => {
      const modelSessions = sessions.filter((s) => s.model_name === modelName);

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
        modelSessions.reduce((sum, s) => sum + (s.total_latency_ms || 0), 0) /
        modelSessions.length;
      const avgTokens =
        modelSessions.reduce(
          (sum, s) => sum + (s.input_tokens || 0) + (s.output_tokens || 0),
          0
        ) / modelSessions.length;
      const avgScore =
        modelSessions.reduce(
          (sum, s) => sum + (s.result ? Number(s.result.overall_score) : 0),
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
        ...(filters.copilotType && { copilot_type: filters.copilotType }),
        ...(filters.modelName && { model_name: filters.modelName }),
        ...(filters.startDate && { started_at: { gte: filters.startDate } }),
        ...(filters.endDate && { started_at: { lte: filters.endDate } }),
      },
      include: {
        result: true,
      },
    });

    const totalSessions = sessions.length;
    const avgOverallScore =
      sessions.reduce(
        (sum, s) => sum + (s.result ? Number(s.result.overall_score) : 0),
        0
      ) / totalSessions;
    const avgLatencyMs =
      sessions.reduce((sum, s) => sum + (s.total_latency_ms || 0), 0) /
      totalSessions;
    const avgTokenUsage =
      sessions.reduce(
        (sum, s) => sum + (s.input_tokens || 0) + (s.output_tokens || 0),
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
