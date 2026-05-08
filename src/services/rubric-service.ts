import { generateRubrics } from "../modules/rubrics/application/rubrics-generator.ts";
import type {
  agentFeedbacks,
  rubric,
} from "../prisma/build/generated/prisma/client.ts";
import { prisma } from "../config/prisma.ts";
import type { rubricCreateInput } from "../prisma/build/generated/prisma/models.ts";
export class RubricService {
  async getRubrics(
    goldenSetId: string,
    userInputId: string,
  ): Promise<rubric[]> {
    try {
      const rubrics = await prisma.rubric.findMany({
        where: {
          goldenSetId,
          userInputId,
        },
        include: {
          criterion: true,
        },
        orderBy: { createdAt: "asc" },
      });
      return rubrics;
    } catch (error) {
      console.error("Error fetching rubrics:", error);
      throw new Error("Failed to fetch rubrics");
    }
  }

  async getRubricById(id: string): Promise<rubric> {
    try {
      const rubricItem = await prisma.rubric.findUnique({
        where: { id },
        include: {
          criterion: true,
        },
      });
      if (!rubricItem) {
        throw new Error(`Rubric with ID ${id} not found`);
      }
      return rubricItem;
    } catch (error) {
      console.error("Error fetching rubric by id:", error);
      throw new Error("Failed to fetch rubric by id");
    }
  }

  async generateRubric(
    goldenSetId: string,
    userInputId: string,
  ): Promise<rubric> {
    try {
      const copilotInput = await prisma.goldenSet.findUnique({
        where: { id: goldenSetId },
        select: {
          schemaId: true,
          userInputs: {
            where: {
              id: userInputId,
            },
            select: {
              content: true,
            },
          },
        },
      });
      if (!copilotInput || !copilotInput.userInputs[0]?.content) {
        throw new Error(
          "No user input found for the given goldenSetId and userInputId",
        );
      }

      const { rubrics, feedbacks } = await generateRubrics(
        copilotInput.schemaId,
        copilotInput.userInputs[0].content,
      );
      const overallWeight = rubrics.rubrics.reduce(
        (sum, item) => sum + item.weight,
        0,
      );
      if (overallWeight === 0) {
        throw new Error("Total weight of rubrics cannot be zero");
      }

      const savedRubric = await this.saveRubric({
        goldenSetId,
        userInputId,
        ...rubrics,
      });

      await Promise.allSettled(feedbacks(savedRubric.id));
      return savedRubric;
    } catch (error) {
      console.error("Error generating rubric:", error);
      throw new Error("Failed to generate rubric");
    }
  }

  async saveRubric(rubricInput: rubricCreateInput): Promise<rubric> {
    try {
      return await prisma.rubric.create({
        data: {
          ...rubricInput,
        },
        include: {
          criterion: true,
        },
      });
    } catch (error) {
      console.error("Error saving rubric:", error);
      throw new Error("Failed to save rubric");
    }
  }

  async saveAgentFeedbacks(
    rubricId: string,
    agentName: string,
    feedbacks: string[],
  ): Promise<agentFeedbacks | undefined> {
    try {
      if (feedbacks.length === 0) {
        return undefined;
      }

      const rubricItem = await prisma.rubric.findUnique({
        where: { id: rubricId },
        select: { id: true },
      });
      if (!rubricItem) {
        throw new Error("Rubric not found for the given id");
      }
      return await prisma.agentFeedbacks.create({
        data: {
          rubricId,
          agentName,
          feedback: feedbacks,
        },
      });
    } catch (error) {
      console.error("Error saving agent feedbacks:", error);
      throw new Error("Failed to save agent feedbacks");
    }
  }
}

export const rubricService = new RubricService();
