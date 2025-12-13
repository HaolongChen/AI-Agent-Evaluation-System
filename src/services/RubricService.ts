import type { Prisma } from '../generated/prisma/client.ts';
import { prisma } from '../config/prisma.ts';
import { REVIEW_STATUS } from '../config/constants.ts';
import type { expectedAnswerType, rubricContentType } from '../utils/types.ts';
import { logger } from '../utils/logger.ts';

export class RubricService {
  async createRubrics(
    rubrics: Array<{
      projectExId: string;
      schemaExId: string;
      sessionId: string;
      content?: string[];
      rubricType?: string[];
      category?: string[];
      expectedAnswer?: expectedAnswerType[];
      newGoldenSetId?: number;
      copilotInput?: string;
      copilotOutput?: string;
      modelProvider?: string;
      modelName?: string;
      generatorMetadata?: Record<string, unknown>;
      fallbackReason?: string;
    }>
  ) {
    try {
      return prisma.adaptiveRubric.createMany({
        data: rubrics.map((r) => {
          // Transform flat array structure to LangGraph-compatible structured format
          const criteria = this.transformToCriteria(
            r.content || [],
            r.rubricType || [],
            r.category || [],
            r.expectedAnswer || []
          );
          const totalWeight = criteria.reduce(
            (sum: number, c: { weight?: number }) => sum + (c.weight || 1),
            0
          );

          return {
            projectExId: r.projectExId,
            schemaExId: r.schemaExId,
            sessionId: parseInt(r.sessionId),
            rubricId: `rubric-${r.schemaExId}-${Date.now()}`,
            version: '1.0',
            criteria: criteria as Prisma.InputJsonValue,
            totalWeight: totalWeight,
            ...(r.copilotInput && { copilotInput: r.copilotInput }),
            ...(r.copilotOutput && { copilotOutput: r.copilotOutput }),
            ...(r.modelProvider !== undefined && {
              modelProvider: r.modelProvider ?? null,
            }),
            ...(r.modelName !== undefined && {
              modelName: r.modelName ?? null,
            }),
            ...(r.generatorMetadata && {
              generatorMetadata: r.generatorMetadata as Prisma.InputJsonValue,
            }),
            ...(r.fallbackReason !== undefined && {
              fallbackReason: r.fallbackReason ?? null,
            }),
            reviewStatus: REVIEW_STATUS.PENDING,
            ...(r.newGoldenSetId && { newGoldenSetId: r.newGoldenSetId }),
          };
        }),
      });
    } catch (error) {
      logger.error('Error creating rubrics:', error);
      throw new Error('Failed to create rubrics');
    }
  }

  private transformToCriteria(
    content: string[],
    rubricType: string[],
    category: string[],
    expectedAnswer: expectedAnswerType[]
  ): Array<{
    id: string;
    description: string;
    type: string;
    category: string;
    weight: number;
    scale: {
      minValue: number;
      maxValue: number;
      labels: string[];
    };
    expectedAnswer: string;
  }> {
    // Transform old flat arrays to LangGraph RubricCriterion[] structure
    const criteria = [];
    for (let i = 0; i < content.length; i++) {
      criteria.push({
        id: `criterion-${i + 1}`,
        description: content[i] || '',
        type: rubricType[i] || 'text',
        category: category[i] || 'general',
        weight: 1,
        scale: {
          minValue: 0,
          maxValue: 10,
          labels: ['Poor', 'Fair', 'Good', 'Excellent'],
        },
        expectedAnswer: expectedAnswer[i] || '',
      });
    }
    return criteria;
  }

  async getRubricsBySchemaExId(schemaExId: string) {
    try {
      return prisma.adaptiveRubric.findMany({
        where: {
          schemaExId: schemaExId,
          isActive: true,
        },
        include: {
          judgeRecords: true,
        },
      });
    } catch (error) {
      logger.error('Error fetching rubrics by schemaExId:', error);
      throw new Error('Failed to fetch rubrics by schemaExId');
    }
  }

  async getRubricById(rubricId: string) {
    try {
      return prisma.adaptiveRubric.findUnique({
        where: {
          id: parseInt(rubricId),
        },
      });
    } catch (error) {
      logger.error('Error fetching rubric by id:', error);
      throw new Error('Failed to fetch rubric by id');
    }
  }

  async getRubricsBySession(sessionId: string) {
    try {
      return prisma.adaptiveRubric.findMany({
        where: {
          sessionId: parseInt(sessionId),
          isActive: true,
        },
        include: {
          judgeRecords: true,
        },
      });
    } catch (error) {
      logger.error('Error fetching rubrics by sessionId:', error);
      throw new Error('Failed to fetch rubrics by sessionId');
    }
  }

  async getRubricsForReview(
    sessionId?: number,
    projectExId?: string,
    schemaExId?: string,
    reviewStatus?: (typeof REVIEW_STATUS)[keyof typeof REVIEW_STATUS]
  ) {
    try {
      return prisma.adaptiveRubric.findMany({
        where: {
          isActive: true,
          ...(reviewStatus && { reviewStatus }),
          ...(sessionId && { sessionId }),
          ...(projectExId && { projectExId }),
          ...(schemaExId && { schemaExId }),
        },
        include: {
          judgeRecords: true,
          session: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      logger.error('Error fetching rubrics for review:', error);
      throw new Error('Failed to fetch rubrics for review');
    }
  }

  async reviewRubric(
    rubricId: string,
    reviewStatus: (typeof REVIEW_STATUS)[keyof typeof REVIEW_STATUS],
    reviewerAccountId: string,
    modifiedRubricContent?: rubricContentType
  ) {
    try {
      return prisma.adaptiveRubric.update({
        where: { id: parseInt(rubricId) },
        data: {
          reviewStatus: reviewStatus,
          reviewedAt: new Date(),
          reviewedBy: reviewerAccountId,
          ...(modifiedRubricContent && {
            criteria: this.transformToCriteria(
              modifiedRubricContent.content || [],
              modifiedRubricContent.rubricType || [],
              modifiedRubricContent.category || [],
              modifiedRubricContent.expectedAnswer || []
            ) as Prisma.InputJsonValue,
            totalWeight: (modifiedRubricContent.content || []).length,
          }),
        },
      });
    } catch (error) {
      logger.error('Error reviewing rubric:', error);
      throw new Error('Failed to review rubric');
    }
  }
}

export const rubricService = new RubricService();
