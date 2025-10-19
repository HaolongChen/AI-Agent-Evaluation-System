import { prisma } from '../config/prisma.ts';

export class JudgeService {
  async createJudgeRecord(
    adaptiveRubricId: string,
    accountId: string,
    result: boolean,
    confidenceScore?: number,
    notes?: string
  ) {
    return prisma.adaptive_rubric_judge_record.create({
      data: {
        adaptiveRubricId: BigInt(adaptiveRubricId),
        accountId: accountId,
        result,
        confidenceScore: confidenceScore ?? null,
        notes: notes ?? null,
      },
    });
  }

  async getJudgeRecordsByRubric(rubricId: string) {
    return prisma.adaptive_rubric_judge_record.findMany({
      where: {
        adaptiveRubricId: BigInt(rubricId),
      },
      orderBy: { judgedAt: 'desc' },
    });
  }
}

export const judgeService = new JudgeService();
