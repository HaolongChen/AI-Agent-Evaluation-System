import { prisma } from '../config/prisma.ts';
import { SESSION_STATUS } from '../config/constants.ts';
import type { CopilotType } from '../../generated/prisma/index.js';

export class ExecutionService {
  async createEvaluationSession(
    projectExId: string,
    schemaExId: string,
    copilotType: CopilotType,
    modelName: string
  ) {
    return prisma.evaluation_session.create({
      data: {
        projectExId: projectExId,
        schemaExId: schemaExId,
        copilotType: copilotType,
        modelName: modelName,
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
    copilotType?: CopilotType;
    modelName?: string;
  }) {
    return prisma.evaluation_session.findMany({
      where: {
        ...(filters.schemaExId && { schemaExId: filters.schemaExId }),
        ...(filters.copilotType && { copilotType: filters.copilotType }),
        ...(filters.modelName && { modelName: filters.modelName }),
      },
      include: {
        rubrics: true,
        result: true,
      },
      orderBy: { startedAt: 'desc' },
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
      metadata?: object;
    }
  ) {
    return prisma.evaluation_session.update({
      where: { id: BigInt(sessionId) },
      data: {
        status,
        ...(status === SESSION_STATUS.COMPLETED && {
          completedAt: new Date(),
        }),
        ...(metrics && {
          totalLatencyMs: metrics.totalLatencyMs,
          roundtripCount: metrics.roundtripCount,
          inputTokens: metrics.inputTokens,
          outputTokens: metrics.outputTokens,
          contextPercentage: metrics.contextPercentage,
          metadata: metrics.metadata,
        }),
      },
    });
  }
}

export const executionService = new ExecutionService();
