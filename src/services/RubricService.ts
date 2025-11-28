import type { Prisma } from "../generated/prisma/index.js";
import { prisma } from "../config/prisma.ts";
import { REVIEW_STATUS } from "../config/constants.ts";
import type { expectedAnswerType, rubricContentType } from "../utils/types.ts";
import { logger } from "../utils/logger.ts";

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
        data: rubrics.map((r) => ({
          projectExId: r.projectExId,
          schemaExId: r.schemaExId,
          sessionId: parseInt(r.sessionId),
          ...(r.content && { content: r.content }),
          ...(r.rubricType && { rubricType: r.rubricType }),
          ...(r.category && { category: r.category }),
          ...(r.expectedAnswer && { expectedAnswer: r.expectedAnswer }),
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
        })),
      });
    } catch (error) {
      logger.error("Error creating rubrics:", error);
      throw new Error("Failed to create rubrics");
    }
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
      logger.error("Error fetching rubrics by schemaExId:", error);
      throw new Error("Failed to fetch rubrics by schemaExId");
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
      logger.error("Error fetching rubric by id:", error);
      throw new Error("Failed to fetch rubric by id");
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
      logger.error("Error fetching rubrics by sessionId:", error);
      throw new Error("Failed to fetch rubrics by sessionId");
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
        orderBy: { generatedAt: "desc" },
      });
    } catch (error) {
      logger.error("Error fetching rubrics for review:", error);
      throw new Error("Failed to fetch rubrics for review");
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
          ...(modifiedRubricContent?.content && {
            content: modifiedRubricContent.content,
          }),
          ...(modifiedRubricContent?.rubricType && {
            rubricType: modifiedRubricContent.rubricType,
          }),
          ...(modifiedRubricContent?.category && {
            category: modifiedRubricContent.category,
          }),
          ...(modifiedRubricContent?.expectedAnswer && {
            expectedAnswer: modifiedRubricContent.expectedAnswer,
          }),
        },
      });
    } catch (error) {
      logger.error("Error reviewing rubric:", error);
      throw new Error("Failed to review rubric");
    }
  }
}

export const rubricService = new RubricService();
