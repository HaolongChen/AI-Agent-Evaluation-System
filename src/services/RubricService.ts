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
        project_ex_id: r.projectExId,
        schema_ex_id: r.schemaExId,
        session_id: BigInt(r.sessionId),
        content: r.content,
        rubric_type: r.rubricType,
        category: r.category,
        expected_answer: r.expectedAnswer,
        review_status: REVIEW_STATUS.PENDING,
      })),
    });
  }

  async getRubricsBySchemaExId(schemaExId: string) {
    return prisma.adaptive_rubric.findMany({
      where: {
        schema_ex_id: schemaExId,
        is_active: true,
      },
      include: {
        judge_records: true,
      },
    });
  }

  async getRubricsBySession(sessionId: string) {
    return prisma.adaptive_rubric.findMany({
      where: {
        session_id: BigInt(sessionId),
        is_active: true,
      },
      include: {
        judge_records: true,
      },
    });
  }

  async getRubricsForReview(reviewStatus?: string) {
    return prisma.adaptive_rubric.findMany({
      where: {
        is_active: true,
        ...(reviewStatus && { review_status: reviewStatus }),
      },
      include: {
        judge_records: true,
      },
      orderBy: { generated_at: 'desc' },
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
        review_status: reviewStatus,
        reviewed_at: new Date(),
        reviewed_by: reviewerAccountId,
        ...(modifiedContent && { content: modifiedContent }),
      },
    });
  }
}

export const rubricService = new RubricService();
