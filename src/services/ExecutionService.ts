import { prisma } from '../config/prisma.ts';
import { SESSION_STATUS } from '../config/constants.ts';

export class ExecutionService {
  async createEvaluationSession(
    schemaExId: string,
    copilotType: string,
    modelName: string
  ) {
    return prisma.evaluation_session.create({
      data: {
        schema_ex_id: schemaExId,
        copilot_type: copilotType,
        model_name: modelName,
        status: SESSION_STATUS.PENDING,
      },
    });
  }

  async getSession(id: string) {
    return prisma.evaluation_session.findUnique({
      where: { id: BigInt(id) },
      include: {
        rubrics: true,
        result: true,
      },
    });
  }

  async getSessions(filters: {
    schemaExId?: string;
    copilotType?: string;
    modelName?: string;
  }) {
    return prisma.evaluation_session.findMany({
      where: {
        ...(filters.schemaExId && { schema_ex_id: filters.schemaExId }),
        ...(filters.copilotType && { copilot_type: filters.copilotType }),
        ...(filters.modelName && { model_name: filters.modelName }),
      },
      include: {
        rubrics: true,
        result: true,
      },
      orderBy: { started_at: 'desc' },
    });
  }

  async updateSessionStatus(
    sessionId: string,
    status: string,
    metrics?: {
      totalLatencyMs?: number;
      roundtripCount?: number;
      inputTokens?: number;
      outputTokens?: number;
      contextPercentage?: number;
      metadata?: any;
    }
  ) {
    return prisma.evaluation_session.update({
      where: { id: BigInt(sessionId) },
      data: {
        status,
        ...(status === SESSION_STATUS.COMPLETED && {
          completed_at: new Date(),
        }),
        ...(metrics && {
          total_latency_ms: metrics.totalLatencyMs,
          roundtrip_count: metrics.roundtripCount,
          input_tokens: metrics.inputTokens,
          output_tokens: metrics.outputTokens,
          context_percentage: metrics.contextPercentage,
          metadata: metrics.metadata,
        }),
      },
    });
  }
}

export const executionService = new ExecutionService();
