import { prisma } from '../config/prisma.ts';
import { REVIEW_STATUS } from '../config/constants.ts';

export class RubricService {
  async createRubrics(
    rubrics: Array<{
      projectExId: string;
      schemaExId: string;
      sessionId: string;
      content: string;
      rubricType?: string;
      category?: string;
      expectedAnswer?: string;
    }>
  ) {
    return prisma.adaptive_rubric.createMany({
      data: rubrics.map((r) => ({
        projectExId: r.projectExId,
        schemaExId: r.schemaExId,
        sessionId: BigInt(r.sessionId),
        content: r.content,
        rubricType: r.rubricType ?? null,
        category: r.category ?? null,
        expectedAnswer: r.expectedAnswer ?? null,
        reviewStatus: REVIEW_STATUS.PENDING,
      })),
    });
  }

  async getRubricsBySchemaExId(schemaExId: string) {
    return prisma.adaptive_rubric.findMany({
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
    return prisma.adaptive_rubric.findMany({
      where: {
        sessionId: BigInt(sessionId),
        isActive: true,
      },
      include: {
        judgeRecords: true,
      },
    });
  }

  async getRubricsForReview(reviewStatus?: string) {
    return prisma.adaptive_rubric.findMany({
      where: {
        isActive: true,
        ...(reviewStatus && { reviewStatus: reviewStatus }),
      },
      include: {
        judgeRecords: true,
      },
      orderBy: { generatedAt: 'desc' },
    });
  }

  async reviewRubric(
    rubricId: string,
    reviewStatus: string,
    reviewerAccountId: string,
    modifiedContent?: string
  ) {
    return prisma.adaptive_rubric.update({
      where: { id: BigInt(rubricId) },
      data: {
        reviewStatus: reviewStatus,
        reviewedAt: new Date(),
        reviewedBy: reviewerAccountId,
        ...(modifiedContent && { content: modifiedContent }),
      },
    });
  }
}

export const rubricService = new RubricService();
