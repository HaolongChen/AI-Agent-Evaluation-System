import { prisma } from '../config/prisma.ts';
import { logger } from '../utils/logger.ts';
import { rubricService } from './RubricService.ts';

export class JudgeService {
  /**
   * Create a judge record for a rubric
   * Uses the new field names: answer (string), comment (string)
   */
  async createJudgeRecord(
    adaptiveRubricId: string,
    evaluatorType: string,
    accountId: string | null,
    answer: string,
    overallScore: number,
    comment?: string
  ) {
    try {
      // Create the judge record
      const finalRecord = await prisma.adaptiveRubricJudgeRecord.create({
        data: {
          adaptiveRubricId: parseInt(adaptiveRubricId),
          evaluatorType,
          accountId: accountId ?? null,
          answer,
          comment: comment ?? null,
          overallScore,
        },
      });

      // Get the rubric to find the simulation
      const rubric = await rubricService.getRubricById(adaptiveRubricId);
      if (!rubric) {
        throw new Error('Rubric not found for creating evaluation result');
      }

      // Create or update evaluation result
      const existingResult = await prisma.evaluationResult.findUnique({
        where: { simulationId: rubric.simulationId },
      });

      let finalResult;
      if (existingResult) {
        finalResult = await prisma.evaluationResult.update({
          where: { id: existingResult.id },
          data: {
            evaluationStatus: 'completed',
            overallScore,
            summary: comment ?? '',
            verdict:
              overallScore >= 70
                ? 'pass'
                : overallScore >= 50
                ? 'needs_review'
                : 'fail',
          },
        });
      } else {
        finalResult = await prisma.evaluationResult.create({
          data: {
            simulationId: rubric.simulationId,
            evaluationStatus: 'completed',
            overallScore,
            summary: comment ?? '',
            verdict:
              overallScore >= 70
                ? 'pass'
                : overallScore >= 50
                ? 'needs_review'
                : 'fail',
            discrepancies: [],
          },
        });
      }

      return { finalRecord, finalResult };
    } catch (error) {
      logger.error('Error creating judge record:', error);
      throw new Error('Failed to create judge record');
    }
  }

  async getJudgeRecordsByRubric(rubricId: string) {
    try {
      // Note: judgeRecord is 1:1 with adaptiveRubric via @unique
      const record = await prisma.adaptiveRubricJudgeRecord.findUnique({
        where: {
          adaptiveRubricId: parseInt(rubricId),
        },
      });
      return record ? [record] : [];
    } catch (error) {
      logger.error('Error fetching judge records by rubric:', error);
      throw new Error('Failed to fetch judge records by rubric');
    }
  }
}

export const judgeService = new JudgeService();
