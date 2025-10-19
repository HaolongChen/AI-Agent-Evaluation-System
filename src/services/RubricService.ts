import { prisma } from '../config/prisma.ts';
import { REVIEW_STATUS } from '../config/constants.ts';
import type { expectedAnswerType, rubricContentType } from '../utils/types.ts';

export class RubricService {
  async createRubrics(
    rubrics: Array<{
      projectExId: string;
      schemaExId: string;
      sessionId: string;
      content: string[];
      rubricType: string[];
      category: string[];
      expectedAnswer: expectedAnswerType[];
    }>
  ) {
    return prisma.adaptiveRubric.createMany({
      data: rubrics.map((r) => ({
        projectExId: r.projectExId,
        schemaExId: r.schemaExId,
        sessionId: BigInt(r.sessionId),
        content: r.content,
        rubricType: r.rubricType,
        category: r.category,
        expectedAnswer: r.expectedAnswer,
        reviewStatus: REVIEW_STATUS.PENDING,
      })),
    });
  }

  async getRubricsBySchemaExId(schemaExId: string) {
    return prisma.adaptiveRubric.findMany({
      where: {
        schemaExId: schemaExId,
        isActive: true,
      },
      include: {
        judgeRecords: true,
      },
    });
  }

  async getRubricsBySession(sessionId: string) {
    return prisma.adaptiveRubric.findMany({
      where: {
        sessionId: BigInt(sessionId),
        isActive: true,
      },
      include: {
        judgeRecords: true,
      },
    });
  }

  async getRubricsForReview(reviewStatus: typeof REVIEW_STATUS[keyof typeof REVIEW_STATUS]) {
    return prisma.adaptiveRubric.findMany({
      where: {
        isActive: true,
        reviewStatus
      },
      include: {
        judgeRecords: true,
      },
      orderBy: { generatedAt: 'desc' },
    });
  }

  async reviewRubric(
    rubricId: string,
    reviewStatus: typeof REVIEW_STATUS[keyof typeof REVIEW_STATUS],
    reviewerAccountId: string,
    modifiedRubricContent?: rubricContentType
  ) {
    return prisma.adaptiveRubric.update({
      where: { id: BigInt(rubricId) },
      data: {
        reviewStatus: reviewStatus,
        reviewedAt: new Date(),
        reviewedBy: reviewerAccountId,
        ...(modifiedRubricContent?.content && { content: modifiedRubricContent.content }),
        ...(modifiedRubricContent?.rubricType && { rubricType: modifiedRubricContent.rubricType }),
        ...(modifiedRubricContent?.category && { category: modifiedRubricContent.category }),
        ...(modifiedRubricContent?.expectedAnswer && { expectedAnswer: modifiedRubricContent.expectedAnswer }),
      },
    });
  }
}

export const rubricService = new RubricService();
