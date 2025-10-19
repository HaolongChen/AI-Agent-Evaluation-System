import { prisma } from '../config/prisma.ts';
import { SESSION_STATUS } from '../config/constants.ts';
import type { CopilotType } from '../generated/prisma/index.ts';
import { logger } from '../utils/logger.ts';

export class ExecutionService {
  async createEvaluationSession(
    projectExId: string,
    schemaExId: string,
    copilotType: CopilotType,
    modelName: string
  ) {
    try {
      return prisma.evaluationSession.create({
        data: {
          projectExId: projectExId,
          schemaExId: schemaExId,
          copilotType: copilotType,
          modelName: modelName,
          status: SESSION_STATUS.PENDING,
        },
      });
    } catch (error) {
      logger.error('Error creating evaluation session:', error);
      throw new Error('Failed to create evaluation session');
    }
  }

  async getSession(id: string) {
    try {
      return prisma.evaluationSession.findUnique({
        where: { id: parseInt(id) },
        include: {
          rubrics: true,
          result: true,
        },
      });
    } catch (error) {
      logger.error('Error fetching evaluation session:', error);
      throw new Error('Failed to fetch evaluation session');
    }
  }

  async getSessions(filters: {
    schemaExId?: string;
    copilotType?: CopilotType;
    modelName?: string;
  }) {
    try {
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
    } catch (error) {
      logger.error('Error fetching evaluation sessions:', error);
      throw new Error('Failed to fetch evaluation sessions');
    }
  }

  async updateSessionStatus(
    sessionId: string,
    status: (typeof SESSION_STATUS)[keyof typeof SESSION_STATUS],
    metrics?: {
      totalLatencyMs?: number;
      roundtripCount?: number;
      inputTokens?: number;
      outputTokens?: number;
      contextPercentage?: number;
      metadata?: object;
    }
  ) {
    try {
      return prisma.evaluationSession.update({
        where: { id: parseInt(sessionId) },
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
    } catch (error) {
      logger.error('Error updating evaluation session status:', error);
      throw new Error('Failed to update evaluation session status');
    }
  }
}

export const executionService = new ExecutionService();
