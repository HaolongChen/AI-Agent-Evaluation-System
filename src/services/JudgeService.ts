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
        adaptive_rubric_id: BigInt(adaptiveRubricId),
        account_id: accountId,
        result,
        confidence_score: confidenceScore ?? null,
        notes: notes ?? null,
      },
    });
  }

  async getJudgeRecordsByRubric(rubricId: string) {
    return prisma.adaptive_rubric_judge_record.findMany({
      where: {
        adaptive_rubric_id: BigInt(rubricId),
      },
      orderBy: { judged_at: 'desc' },
    });
  }
}

export const judgeService = new JudgeService();
