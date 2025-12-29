import { prisma } from '../config/prisma.ts';
import { REVIEW_STATUS } from '../config/constants.ts';
import { logger } from '../utils/logger.ts';

export class RubricService {
  async createQuestions(
    sessionId: number,
    questions: Array<{
      title: string;
      content: string;
      expectedAnswer: boolean;
      weight: number;
    }>,
    options?: {
      modelProvider?: string;
      version?: string;
    }
  ) {
    try {
      const created = await Promise.all(
        questions.map((q) =>
          prisma.adaptiveRubric.create({
            data: {
              sessionId,
              version: options?.version ?? '1.0',
              title: q.title,
              content: q.content,
              expectedAnswer: q.expectedAnswer,
              weight: q.weight,
              reviewStatus: REVIEW_STATUS.PENDING,
            },
          })
        )
      );

      return { count: created.length, ids: created.map((c) => c.id) };
    } catch (error) {
      logger.error('Error creating questions:', error);
      throw new Error('Failed to create questions');
    }
  }

  async getQuestionById(questionId: number) {
    try {
      return prisma.adaptiveRubric.findUnique({
        where: { id: questionId },
        include: { judgeRecord: true },
      });
    } catch (error) {
      logger.error('Error fetching question by id:', error);
      throw new Error('Failed to fetch question by id');
    }
  }

  async getQuestionsBySession(sessionId: number) {
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

  async getQuestionsForReview(
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

  async reviewQuestion(
    questionId: number,
    reviewStatus: (typeof REVIEW_STATUS)[keyof typeof REVIEW_STATUS],
    reviewerAccountId: string,
    modifiedQuestion?: {
      title?: string;
      content?: string;
      expectedAnswer?: boolean;
      weight?: number;
    }
  ) {
    try {
      return prisma.adaptiveRubric.update({
        where: { id: questionId },
        data: {
          reviewStatus,
          reviewedAt: new Date(),
          reviewedBy: reviewerAccountId,
          ...(modifiedQuestion?.title && { title: modifiedQuestion.title }),
          ...(modifiedQuestion?.content && { content: modifiedQuestion.content }),
          ...(modifiedQuestion?.expectedAnswer !== undefined && {
            expectedAnswer: modifiedQuestion.expectedAnswer,
          }),
          ...(modifiedQuestion?.weight !== undefined && {
            weight: modifiedQuestion.weight,
          }),
        },
      });
    } catch (error) {
      logger.error('Error reviewing question:', error);
      throw new Error('Failed to review question');
    }
  }

  async updateQuestionsTotalWeight(sessionId: number) {
    try {
      const questions = await prisma.adaptiveRubric.findMany({
        where: { sessionId, isActive: true },
        select: { id: true, weight: true },
      });

      return {
        totalWeight: questions.reduce((sum, q) => sum + Number(q.weight), 0),
      };
    } catch (error) {
      logger.error('Error updating total weight:', error);
      throw new Error('Failed to update total weight');
    }
  }
}

export const rubricService = new RubricService();
