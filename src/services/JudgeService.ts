import { prisma } from '../config/prisma.ts';
import { logger } from '../utils/logger.ts';

export class JudgeService {
  async createJudgeRecord(
    adaptiveRubricId: string,
    accountId: string,
    result: boolean,
    confidenceScore: number[],
    notes?: string
  ) {
    try {
      return prisma.adaptiveRubricJudgeRecord.create({
        data: {
          adaptiveRubricId: BigInt(adaptiveRubricId),
          accountId: accountId,
          result,
          confidenceScore: confidenceScore ?? [],
          notes: notes ?? null,
        },
      });
    } catch (error) {
      logger.error('Error creating judge record:', error);
      throw new Error('Failed to create judge record');
    }
  }

  async getJudgeRecordsByRubric(rubricId: string) {
    try {
      return prisma.adaptiveRubricJudgeRecord.findMany({
        where: {
          adaptiveRubricId: BigInt(rubricId),
        },
        orderBy: { judgedAt: 'desc' },
      });
    } catch (error) {
      logger.error('Error fetching judge records by rubric:', error);
      throw new Error('Failed to fetch judge records by rubric');
    }
  }
}

export const judgeService = new JudgeService();
