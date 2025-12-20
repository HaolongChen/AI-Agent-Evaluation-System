import { prisma } from '../config/prisma.ts';
import { SESSION_STATUS } from '../config/constants.ts';
import { logger } from '../utils/logger.ts';
import { goldenSetService } from './GoldenSetService.ts';
import {
  AZURE_OPENAI_DEPLOYMENT,
  GEMINI_API_KEY,
  GEMINI_MODEL,
  OPENAI_MODEL,
  USES_AZURE_OPENAI,
} from '../config/env.ts';

const resolveDefaultModelName = (): string => {
  // Prefer Azure deployment when Azure is configured; otherwise fall back to Gemini if available.
  if (USES_AZURE_OPENAI) return AZURE_OPENAI_DEPLOYMENT || OPENAI_MODEL;
  if (GEMINI_API_KEY) return GEMINI_MODEL;
  // Last resort: still prefer OpenAI model string (will require Azure env in LangGraph).
  return AZURE_OPENAI_DEPLOYMENT || OPENAI_MODEL;
};

const normalizeRequestedModelName = (modelName: string | undefined): string => {
  if (!modelName) return resolveDefaultModelName();
  // Historical alias used in some call sites; not a real Azure deployment name.
  if (modelName === 'copilot-latest') return resolveDefaultModelName();
  return modelName;
};

export class ExecutionService {
  /**
   * Create a copilot simulation session for a golden set
   */
  async createSimulationSession(
    goldenSetId: number,
    modelName: string,
    options?: {
      skipHumanReview?: boolean;
      skipHumanEvaluation?: boolean;
    }
  ) {
    try {
      const resolvedModelName = normalizeRequestedModelName(modelName);
      const skipHumanReview = options?.skipHumanReview ?? true;
      const skipHumanEvaluation = options?.skipHumanEvaluation ?? true;

      // Verify golden set exists
      const goldenSet = await goldenSetService.getGoldenSetById(goldenSetId);
      if (!goldenSet) {
        throw new Error('Golden set not found');
      }

      // Create copilot simulation session
      const session = await prisma.copilotSimulation.create({
        data: {
          goldenSetId,
          modelName: resolvedModelName,
          status: SESSION_STATUS.PENDING,
          metadata: {
            skipHumanReview,
            skipHumanEvaluation,
          },
        },
      });

      return session;
    } catch (error) {
      logger.error('Error creating simulation session:', error);
      throw new Error('Failed to create simulation session');
    }
  }

  async getSession(id: string) {
    try {
      return prisma.copilotSimulation.findUnique({
        where: { id: parseInt(id) },
        include: {
          rubric: {
            include: {
              judgeRecord: true,
            },
          },
          result: true,
        },
      });
    } catch (error) {
      logger.error('Error fetching simulation session:', error);
      throw new Error('Failed to fetch simulation session');
    }
  }

  async getSessions(filters: {
    goldenSetId?: number;
    modelName?: string;
    status?: (typeof SESSION_STATUS)[keyof typeof SESSION_STATUS];
  }) {
    try {
      return prisma.copilotSimulation.findMany({
        where: {
          ...(filters.goldenSetId && { goldenSetId: filters.goldenSetId }),
          ...(filters.modelName && { modelName: filters.modelName }),
          ...(filters.status && { status: filters.status }),
        },
        include: {
          rubric: {
            include: {
              judgeRecord: true,
            },
          },
          result: true,
        },
        orderBy: { startedAt: 'desc' },
      });
    } catch (error) {
      logger.error('Error fetching simulation sessions:', error);
      throw new Error('Failed to fetch simulation sessions');
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
      totalTokens?: number;
      contextPercentage?: number;
      metadata?: object;
    }
  ) {
    try {
      return prisma.copilotSimulation.update({
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
            totalTokens: metrics.totalTokens,
            contextPercentage: metrics.contextPercentage,
            metadata: metrics.metadata,
          }),
        },
      });
    } catch (error) {
      logger.error('Error updating simulation session status:', error);
      throw new Error('Failed to update simulation session status');
    }
  }
}

export const executionService = new ExecutionService();
