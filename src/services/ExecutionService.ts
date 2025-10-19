import { prisma } from '../config/prisma.ts';
import { SESSION_STATUS } from '../config/constants.ts';
import type { CopilotType } from '../generated/prisma/index.ts';

export class ExecutionService {
  async createEvaluationSession(
    projectExId: string,
    schemaExId: string,
    copilotType: CopilotType,
    modelName: string
  ) {
    return prisma.evaluationSession.create({
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
    return prisma.evaluationSession.findUnique({
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
    return prisma.evaluationSession.findMany({
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
    status: typeof SESSION_STATUS[keyof typeof SESSION_STATUS],
    metrics?: {
      totalLatencyMs?: number;
      roundtripCount?: number;
      inputTokens?: number;
      outputTokens?: number;
      contextPercentage?: number;
      metadata?: object;
    }
  ) {
    return prisma.evaluationSession.update({
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
