import { prisma } from '../config/prisma.ts';
import { logger } from '../utils/logger.ts';
import { COPILOT_TYPES } from '../config/constants.ts';
import type { Prisma } from '../../build/generated/prisma/client.ts';
import { goldenSetService } from './GoldenSetService.ts';

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


  async createEvaluationSession(
    goldenSetId: number,
    modelName: string,
    candidateOutput: string,
    status: 'pending' | 'running' | 'completed' | 'failed',
    metadata: Prisma.InputJsonValue
  ) {
    try {
      const goldenSet = await goldenSetService.updateGoldenSetOutputAndInitSession(
        goldenSetId,
        candidateOutput,
        modelName,
        status,
        metadata
      );
      const session = goldenSet.evaluationSessions.at(-1);
      if (!session) {
        throw new Error('Failed to create evaluation session');
      }
      return session;
    } catch (error) {
      logger.error('Error creating evaluation session:', error);
      throw new Error('Failed to create evaluation session');
    }
  }
}

export const analyticsService = new AnalyticsService();
