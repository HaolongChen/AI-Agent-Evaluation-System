import { prisma } from "../../config/prisma.ts";
import type {
  goldenSet,
  userInput,
} from "../../prisma/build/generated/prisma/client.ts";
import type {
  goldenSetCreateInput,
  goldenSetFindManyArgs as goldenSetFindManyArguments,
} from "../../prisma/build/generated/prisma/models.ts";

export class GoldenSetService {
  async getGoldenSetById(id: string): Promise<goldenSet> {
    try {
      const goldenSet = await prisma.goldenSet.findUnique({
        where: { id },
      });
      if (!goldenSet) {
        throw new Error(`Golden set with ID ${id} not found`);
      }
      return goldenSet;
    } catch (error) {
      console.error("Error fetching golden set by ID:", error);
      throw new Error("Failed to fetch golden set by ID");
    }
  }

  async getGoldenSets(
    filters: goldenSetFindManyArguments["where"],
  ): Promise<Array<goldenSet>> {
    try {
      const goldenSets = await prisma.goldenSet.findMany({
        where: filters,
      });
      return goldenSets;
    } catch (error) {
      console.error("Error fetching golden sets:", error);
      throw new Error("Failed to fetch golden sets");
    }
  }

  async createUserInput(userInput: {
    description?: string;
    content: string;
    createdBy?: string;
  }): Promise<userInput> {
    try {
      const result = await prisma.userInput.create({
        data: userInput,
      });
      return result;
    } catch (error) {
      console.error("Error creating user input:", error);
      throw new Error("Failed to create user input");
    }
  }

  async createGoldenSet(
    goldenSetInput: goldenSetCreateInput,
  ): Promise<goldenSet> {
    try {
      const goldenSet = await prisma.goldenSet.create({
        data: goldenSetInput,
      });
      return goldenSet;
    } catch (error) {
      console.error("Error creating golden set:", error);
      throw new Error("Failed to create golden set");
    }
  }

  async linkGoldenSetToUserInput({
    goldenSetId,
    userInputId,
  }: {
    goldenSetId: string;
    userInputId: string;
  }) {
    try {
      const goldenSet = await prisma.goldenSet.update({
        where: { id: goldenSetId },
        data: {
          userInputs: {
            connect: { id: userInputId },
          },
        },
        include: {
          userInputs: true,
        },
      });
      return goldenSet;
    } catch (error) {
      console.error("Error linking golden set to user input:", error);
      throw new Error("Failed to link golden set to user input");
    }
  }
}

export const goldenSetService = new GoldenSetService();
