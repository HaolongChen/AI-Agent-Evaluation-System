import { prisma } from '../config/prisma.ts';
import { REVIEW_STATUS } from '../config/constants.ts';
import { logger } from '../utils/logger.ts';

export class RubricService {
  /**
   * Create a rubric for a simulation
   * Uses the new single-value field structure matching Prisma schema
   */
  async createRubric(
    simulationId: number,
    rubricData: {
      version?: string;
      title: string;
      content: string;
      expectedAnswer: boolean;
      weight: number;
      totalWeight: number;
      modelProvider?: string;
    }
  ) {
    try {
      const result = await prisma.adaptiveRubric.create({
        data: {
          simulationId,
          version: rubricData.version ?? '1.0',
          title: rubricData.title,
          content: rubricData.content,
          expectedAnswer: rubricData.expectedAnswer,
          weight: rubricData.weight,
          totalWeight: rubricData.totalWeight,
          modelProvider: rubricData.modelProvider ?? null,
          reviewStatus: REVIEW_STATUS.PENDING,
        },
      });
      return result;
    } catch (error) {
      logger.error('Error creating rubric:', error);
      throw new Error('Failed to create rubric');
    }
  }

  async getRubricsBySimulationId(simulationId: number) {
    try {
      // Note: adaptiveRubric has a 1:1 relation with copilotSimulation via @unique
      const rubric = await prisma.adaptiveRubric.findUnique({
        where: { simulationId },
        include: {
          judgeRecord: true,
        },
      });
      return rubric ? [rubric] : [];
    } catch (error) {
      logger.error('Error fetching rubrics by simulationId:', error);
      throw new Error('Failed to fetch rubrics by simulationId');
    }
  }

  async getRubricById(rubricId: string) {
    try {
      const result = await prisma.adaptiveRubric.findUnique({
        where: {
          id: parseInt(rubricId),
        },
        include: {
          judgeRecord: true,
        },
      });
      return result;
    } catch (error) {
      logger.error('Error fetching rubric by id:', error);
      throw new Error('Failed to fetch rubric by id');
    }
  }

  async getRubricsForReview(
    rubricId?: number,
    reviewStatus?: (typeof REVIEW_STATUS)[keyof typeof REVIEW_STATUS]
  ) {
    try {
      const result = await prisma.adaptiveRubric.findMany({
        where: {
          isActive: true,
          ...(reviewStatus && { reviewStatus }),
          ...(rubricId && { id: rubricId }),
        },
        include: {
          judgeRecord: true,
          simulation: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      return result;
    } catch (error) {
      logger.error('Error fetching rubrics for review:', error);
      throw new Error('Failed to fetch rubrics for review');
    }
  }

  async reviewRubric(
    rubricId: string,
    reviewStatus: (typeof REVIEW_STATUS)[keyof typeof REVIEW_STATUS],
    reviewerAccountId: string,
    modifiedRubricContent?: {
      title?: string;
      content?: string;
      expectedAnswer?: boolean;
      weight?: number;
    }
  ) {
    try {
      const result = await prisma.adaptiveRubric.update({
        where: { id: parseInt(rubricId) },
        data: {
          reviewStatus: reviewStatus,
          reviewedAt: new Date(),
          reviewedBy: reviewerAccountId,
          ...(modifiedRubricContent && {
            ...(modifiedRubricContent.title && {
              title: modifiedRubricContent.title,
            }),
            ...(modifiedRubricContent.content && {
              content: modifiedRubricContent.content,
            }),
            ...(modifiedRubricContent.expectedAnswer !== undefined && {
              expectedAnswer: modifiedRubricContent.expectedAnswer,
            }),
            ...(modifiedRubricContent.weight && {
              weight: modifiedRubricContent.weight,
            }),
          }),
        },
      });
      return result;
    } catch (error) {
      logger.error('Error reviewing rubric:', error);
      throw new Error('Failed to review rubric');
    }
  }

  /**
   * Get rubric by session ID (for backward compatibility)
   * @deprecated Use getRubricsBySimulationId instead
   */
  async getRubricsBySession(sessionId: string) {
    const result = await this.getRubricsBySimulationId(parseInt(sessionId));
    return result;
  }
}

export const rubricService = new RubricService();
