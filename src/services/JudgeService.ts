import { prisma } from '../config/prisma.ts';

export class JudgeService {
  async createJudgeRecord(
    adaptiveRubricId: string,
    accountId: string,
    result: boolean,
    confidenceScore: number[],
    notes?: string
  ) {
    return prisma.adaptiveRubricJudgeRecord.create({
      data: {
        adaptiveRubricId: BigInt(adaptiveRubricId),
        accountId: accountId,
        result,
        confidenceScore: confidenceScore ?? [],
        notes: notes ?? null,
      },
    });
  }

  async getJudgeRecordsByRubric(rubricId: string) {
    return prisma.adaptiveRubricJudgeRecord.findMany({
      where: {
        adaptiveRubricId: BigInt(rubricId),
      },
      orderBy: { judgedAt: 'desc' },
    });
  }
}

export const judgeService = new JudgeService();
