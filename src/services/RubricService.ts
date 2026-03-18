import { prisma } from '../config/prisma.ts';
import { REVIEW_STATUS } from '../config/constants.ts';
import { logger } from '../utils/logger.ts';
import type { question } from '../../build/generated/prisma/client.ts';

export class RubricService {


  async initializeQuestionSetWithRubrics(
    goldenSetId: number,
    userInputId: number,
    rubrics: Array<question>
  ) {
    try {
      const questionSet = await prisma.$transaction(async (tx) => {
        const newQuestionSet = await tx.questionSet.create({
          data: {
            goldenSetId,
            userInputId,
          },
        });

        const rubricData = rubrics.map((rubric) => ({
          ...rubric,
          questionSetId: newQuestionSet.id,
        }));

        await tx.question.createMany({
          data: rubricData,
        });
      });
      return questionSet;
    } catch (error) {
      logger.error('Error initializing question set:', error);
      throw new Error('Failed to initialize question set');
    }
  }



  async getQuestionsBySessionX(sessionId: number) {
    try {
      return prisma.adaptiveRubric.findMany({
        where: {
          sessionId,
          isActive: true,
        },
        include: {
          judgeRecord: true,
        },
        orderBy: { id: 'asc' },
      });
    } catch (error) {
      logger.error('Error fetching questions by sessionId:', error);
      throw new Error('Failed to fetch questions by sessionId');
    }
  }

  async getQuestionsForReviewX(
    sessionId?: number,
    reviewStatus?: (typeof REVIEW_STATUS)[keyof typeof REVIEW_STATUS]
  ) {
    try {
      return prisma.adaptiveRubric.findMany({
        where: {
          isActive: true,
          ...(reviewStatus && { reviewStatus }),
          ...(sessionId && { sessionId }),
        },
        include: {
          judgeRecord: true,
          session: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      logger.error('Error fetching questions for review:', error);
      throw new Error('Failed to fetch questions for review');
    }
  }

  async getQuestionsTotalWeight(sessionId: number) {
    try {
      const questions = await prisma.adaptiveRubric.findMany({
        where: { sessionId, isActive: true },
        select: { id: true, weight: true },
      });

      return {
        totalWeight: questions.reduce((sum, q) => sum + Number(q.weight), 0),
      };
    } catch (error) {
      logger.error('Error getting total weight:', error);
      throw new Error('Failed to get total weight');
    }
  }

  async updateRubricsReviewStatusX(
    sessionId: number,
    reviewStatus: (typeof REVIEW_STATUS)[keyof typeof REVIEW_STATUS],
    reviewedBy: string
  ) {
    try {
      return prisma.adaptiveRubric.updateMany({
        where: { sessionId },
        data: {
          reviewStatus,
          reviewedAt: new Date(),
          reviewedBy,
        },
      });
    } catch (error) {
      logger.error('Error updating rubrics review status:', error);
      throw new Error('Failed to update rubrics review status');
    }
  }
}

export const rubricService = new RubricService();
