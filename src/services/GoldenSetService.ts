import { prisma } from '../config/prisma.ts';
import { COPILOT_TYPES } from '../config/constants.ts';
import { logger } from '../utils/logger.ts';
import type { CopilotType } from '../../build/generated/prisma/enums.ts';

export class GoldenSetService {
  /**
   * Create a new golden set with user inputs and copilot outputs
   */
  async createGoldenSet(
    projectExId: string,
    schemaExId: string,
    copilotType: keyof typeof COPILOT_TYPES,
    userInputs: Array<{ description?: string; content: object }>,
    copilotOutputs: Array<{ editableText: string }>,
    createdBy?: string
  ) {
    try {
      // Create the golden set first
      const goldenSet = await prisma.goldenSet.create({
        data: {
          projectExId,
          schemaExId,
          copilotType: COPILOT_TYPES[copilotType],
          createdBy: createdBy ?? null,
          isActive: userInputs.map(() => false), // Initialize all as inactive
        },
      });

      // Create related userInput records
      if (userInputs.length > 0) {
        await prisma.userInput.createMany({
          data: userInputs.map((input, index) => ({
            id: goldenSet.id + index, // Use sequential IDs based on goldenSet
            description: input.description ?? null,
            content: JSON.stringify(input.content),
            createdBy: createdBy ?? null,
          })),
        });
      }

      // Create related copilotOutput records
      if (copilotOutputs.length > 0) {
        await prisma.copilotOutput.createMany({
          data: copilotOutputs.map((output, index) => ({
            id: goldenSet.id + index, // Use sequential IDs based on goldenSet
            editableText: output.editableText,
            createdBy: createdBy ?? null,
          })),
        });
      }

      // Return with relations
      const result = await prisma.goldenSet.findUnique({
        where: { id: goldenSet.id },
        include: {
          userInput: true,
          copilotOutput: true,
        },
      });
      return result;
    } catch (error) {
      logger.error('Error creating golden set:', error);
      throw new Error('Failed to create golden set');
    }
  }

  /**
   * Update golden set's isActive status
   */
  async updateGoldenSetIsActive(id: number, isActive: boolean[]) {
    try {
      const result = await prisma.goldenSet.update({
        where: { id },
        data: { isActive },
        include: {
          userInput: true,
          copilotOutput: true,
        },
      });
      return result;
    } catch (error) {
      logger.error('Error updating golden set isActive:', error);
      throw new Error('Failed to update golden set isActive');
    }
  }

  async getGoldenSetSchemas(copilotType?: keyof typeof COPILOT_TYPES) {
    try {
      const results = await prisma.goldenSet.findMany({
        where: {
          ...(copilotType && { copilotType: COPILOT_TYPES[copilotType] }),
        },
        select: {
          schemaExId: true,
        },
        distinct: ['schemaExId'],
      });

      return results.map((r) => r.schemaExId);
    } catch (error) {
      logger.error('Error fetching golden set schemas:', error);
      throw new Error('Failed to fetch golden set schemas');
    }
  }

  async getGoldenSets(
    projectExId?: string,
    schemaExId?: string,
    copilotType?: CopilotType
  ) {
    try {
      const results = await prisma.goldenSet.findMany({
        where: {
          ...(projectExId && { projectExId }),
          ...(schemaExId && { schemaExId }),
          ...(copilotType && { copilotType }),
        },
        include: {
          userInput: true,
          copilotOutput: true,
        },
      });
      logger.debug('Fetched golden sets:', results);
      return results;
    } catch (error) {
      logger.error('Error fetching golden sets:', error);
      throw new Error('Failed to fetch golden sets');
    }
  }

  async getGoldenSetById(id: number) {
    try {
      const result = await prisma.goldenSet.findUnique({
        where: { id },
        include: {
          userInput: true,
          copilotOutput: true,
        },
      });
      return result;
    } catch (error) {
      logger.error('Error fetching golden set by id:', error);
      throw new Error('Failed to fetch golden set by id');
    }
  }

  /**
   * Get a golden set by project, schema, and copilot type (unique constraint)
   */
  async getGoldenSetByUnique(
    projectExId: string,
    schemaExId: string,
    copilotType: keyof typeof COPILOT_TYPES
  ) {
    try {
      const result = await prisma.goldenSet.findUnique({
        where: {
          projectExId_schemaExId_copilotType: {
            projectExId,
            schemaExId,
            copilotType: COPILOT_TYPES[copilotType],
          },
        },
        include: {
          userInput: true,
          copilotOutput: true,
        },
      });
      return result;
    } catch (error) {
      logger.error('Error fetching golden set by unique constraint:', error);
      throw new Error('Failed to fetch golden set');
    }
  }

  /**
   * Append a copilotOutput to an existing golden set.
   * The copilotOutput ID should match the corresponding userInput ID.
   * @param goldenSetId - The golden set ID
   * @param editableText - The copilot's output text
   * @param index - The index of this output (matches userInput index)
   * @param createdBy - Optional account ID of the creator
   */
  async appendCopilotOutput(
    goldenSetId: number,
    editableText: string,
    index: number,
    createdBy?: string
  ) {
    try {
      // The copilotOutput ID is based on goldenSetId + index
      const outputId = goldenSetId + index;

      // Check if this copilotOutput already exists
      const existing = await prisma.copilotOutput.findUnique({
        where: { id: outputId },
      });

      if (existing) {
        // Update existing
        const result = await prisma.copilotOutput.update({
          where: { id: outputId },
          data: { editableText },
        });
        return result;
      }

      // Create new copilotOutput
      const result = await prisma.copilotOutput.create({
        data: {
          id: outputId,
          editableText,
          createdBy: createdBy ?? null,
        },
      });
      return result;
    } catch (error) {
      logger.error('Error appending copilot output:', error);
      throw new Error('Failed to append copilot output');
    }
  }

  /**
   * Get pending userInputs that don't have corresponding copilotOutputs.
   * Returns userInputs from index l to r-1 where:
   * - l = number of existing copilotOutputs
   * - r = number of userInputs
   * @param goldenSetId - The golden set ID
   */
  async getPendingUserInputs(goldenSetId: number) {
    try {
      const goldenSet = await this.getGoldenSetById(goldenSetId);
      if (!goldenSet) {
        throw new Error('Golden set not found');
      }

      const userInputCount = goldenSet.userInput.length;
      const copilotOutputCount = goldenSet.copilotOutput.length;

      // Get userInputs that don't have corresponding copilotOutputs
      // These are at indices from copilotOutputCount to userInputCount - 1
      const pendingInputs = goldenSet.userInput.slice(copilotOutputCount);

      return {
        goldenSet,
        pendingInputs,
        startIndex: copilotOutputCount,
        totalUserInputs: userInputCount,
        totalCopilotOutputs: copilotOutputCount,
      };
    } catch (error) {
      logger.error('Error getting pending user inputs:', error);
      throw new Error('Failed to get pending user inputs');
    }
  }

  /**
   * Set isActive flag for a specific index range.
   * @param goldenSetId - The golden set ID
   * @param fromIndex - Start index (inclusive)
   * @param toIndex - End index (exclusive)
   * @param value - The value to set (true/false)
   */
  async setIsActiveRange(
    goldenSetId: number,
    fromIndex: number,
    toIndex: number,
    value: boolean
  ) {
    try {
      const goldenSet = await this.getGoldenSetById(goldenSetId);
      if (!goldenSet) {
        throw new Error('Golden set not found');
      }

      // Copy current isActive array and extend if needed
      const isActive = [...goldenSet.isActive];
      const maxIndex = Math.max(toIndex, isActive.length);

      // Extend array with false values if needed
      while (isActive.length < maxIndex) {
        isActive.push(false);
      }

      // Set values in range
      for (let i = fromIndex; i < toIndex && i < isActive.length; i++) {
        isActive[i] = value;
      }

      const result = await prisma.goldenSet.update({
        where: { id: goldenSetId },
        data: { isActive },
        include: {
          userInput: true,
          copilotOutput: true,
        },
      });
      return result;
    } catch (error) {
      logger.error('Error setting isActive range:', error);
      throw new Error('Failed to set isActive range');
    }
  }

  /**
   * Set isActive flag for a single index.
   * @param goldenSetId - The golden set ID
   * @param index - The index to update
   * @param value - The value to set (true/false)
   */
  async setIsActiveAtIndex(goldenSetId: number, index: number, value: boolean) {
    try {
      const goldenSet = await this.getGoldenSetById(goldenSetId);
      if (!goldenSet) {
        throw new Error('Golden set not found');
      }

      // Copy current isActive array
      const isActive = [...goldenSet.isActive];

      // Extend array with false values if needed
      while (isActive.length <= index) {
        isActive.push(false);
      }

      isActive[index] = value;

      const result = await prisma.goldenSet.update({
        where: { id: goldenSetId },
        data: { isActive },
        include: {
          userInput: true,
          copilotOutput: true,
        },
      });
      return result;
    } catch (error) {
      logger.error('Error setting isActive at index:', error);
      throw new Error('Failed to set isActive at index');
    }
  }
}

export const goldenSetService = new GoldenSetService();
