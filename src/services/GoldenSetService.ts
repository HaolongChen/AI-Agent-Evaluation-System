import { prisma } from '../config/prisma.ts';
import { COPILOT_TYPES } from '../config/constants.ts';
import { logger } from '../utils/logger.ts';
import type { Prisma, goldenSet, userInput, copilotOutput, evaluationSession } from '../../build/generated/prisma/client.ts';

export interface GoldenSetWithRelations extends goldenSet {
  userInput: userInput[];
  copilotOutput: copilotOutput[];
  evaluationSessions?: evaluationSession[];
}

export class GoldenSetService {
  async updateGoldenSetInput(
    projectExId: string,
    schemaExId: string,
    copilotType: keyof typeof COPILOT_TYPES,
    description: string,
    query: string
  ): Promise<GoldenSetWithRelations> {
    try {
      const copilotTypeValue = COPILOT_TYPES[copilotType];

      // Check if golden set exists and is active
      const existingGoldenSet = await prisma.goldenSet.findUnique({
        where: {
          projectExId_schemaExId_copilotType: {
            projectExId,
            schemaExId,
            copilotType: copilotTypeValue,
          },
        },
      });

      // If exists and is active, don't modify
      if (existingGoldenSet && existingGoldenSet.isActive) {
        logger.warn('Cannot update active golden set:', existingGoldenSet.id);
        throw new Error('Cannot modify an active golden set');
      }

      const goldenSet = await prisma.goldenSet.upsert({
        where: {
          projectExId_schemaExId_copilotType: {
            projectExId,
            schemaExId,
            copilotType: copilotTypeValue,
          },
        },
        create: {
          projectExId,
          schemaExId,
          copilotType: copilotTypeValue,
          userInput: {
            create: {
              description,
              content: query,
            },
          },
        },
        update: {
          userInput: {
            create: {
              description,
              content: query,
            },
          },
        },
        include: {
          userInput: true,
          copilotOutput: true,
          evaluationSessions: true,
        },
      });

      logger.debug('Upserted golden set project:', goldenSet);
      return goldenSet;
    } catch (error) {
      logger.error('Error updating golden set project:', error);
      throw new Error('Failed to update golden set project');
    }
  }

  async updateGoldenSetOutputAndInitSession(
    goldenSetId: number,
    output: string,
    modelName: string,
    status: 'pending' | 'running' | 'completed' | 'failed',
    metadata: Prisma.InputJsonValue
  ): Promise<GoldenSetWithRelations> {
    try {
      const goldenSet = await prisma.goldenSet.update({
        where: {
          id: goldenSetId,
        },
        data: {
          copilotOutput: {
            create: {
              content: output,
            },
          },
          evaluationSessions: {
            create: {
              modelName,
              status,
              metadata,
            },
          }
        },
        include: {
          userInput: true,
          copilotOutput: true,
          evaluationSessions: true,
        },
      });

      logger.debug('Upserted golden set project:', goldenSet);
      return goldenSet;
    } catch (error) {
      logger.error('Error updating golden set project:', error);
      throw new Error('Failed to update golden set project');
    }
  }

  async getGoldenSet(goldenSetId: number): Promise<GoldenSetWithRelations> {
    try {
      const goldenSet = await prisma.goldenSet.findUnique({
        where: {
          id: goldenSetId,
        },
        include: {
          userInput: true,
          copilotOutput: true,
        },
      });

      if (!goldenSet) {
        throw new Error('Golden set not found');
      }

      return goldenSet;
    } catch (error) {
      logger.error('Error fetching golden sets:', error);
      throw new Error('Failed to fetch golden sets');
    }
  }

  async getGoldenSets(filters?: {
    projectExId?: string;
    schemaExId?: string;
    copilotType?: keyof typeof COPILOT_TYPES;
    isActive?: boolean;
  }): Promise<GoldenSetWithRelations[]> {
    try {
      const goldenSets = await prisma.goldenSet.findMany({
        where: {
          ...(filters?.projectExId && { projectExId: filters.projectExId }),
          ...(filters?.schemaExId && { schemaExId: filters.schemaExId }),
          ...(filters?.copilotType && { copilotType: COPILOT_TYPES[filters.copilotType] }),
          ...(filters?.isActive !== undefined && { isActive: filters.isActive }),
        },
        include: {
          userInput: true,
          copilotOutput: true,
          evaluationSessions: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return goldenSets;
    } catch (error) {
      logger.error('Error fetching golden sets:', error);
      throw new Error('Failed to fetch golden sets');
    }
  }

  async createGoldenSet(
    projectExId: string,
    schemaExId: string,
    copilotType: keyof typeof COPILOT_TYPES,
    createdBy?: string
  ): Promise<GoldenSetWithRelations> {
    try {
      const copilotTypeValue = COPILOT_TYPES[copilotType];

      const goldenSet = await prisma.goldenSet.create({
        data: {
          projectExId,
          schemaExId,
          copilotType: copilotTypeValue,
          createdBy: createdBy ?? null,
        },
        include: {
          userInput: true,
          copilotOutput: true,
          evaluationSessions: true,
        },
      });

      logger.debug('Created golden set:', goldenSet.id);
      return goldenSet;
    } catch (error) {
      logger.error('Error creating golden set:', error);
      throw new Error('Failed to create golden set');
    }
  }

  async addUserInput(
    goldenSetId: number,
    content: string,
    description?: string,
    createdBy?: string
  ): Promise<userInput> {
    try {
      const goldenSet = await prisma.goldenSet.findUnique({
        where: { id: goldenSetId },
      });

      if (!goldenSet) {
        throw new Error('Golden set not found');
      }

      if (goldenSet.isActive) {
        throw new Error('Cannot add input to an active golden set');
      }

      const userInput = await prisma.userInput.create({
        data: {
          goldenSetId,
          content,
          description: description ?? null,
          createdBy: createdBy ?? null,
        },
      });

      logger.debug('Added user input to golden set:', goldenSetId);
      return userInput;
    } catch (error) {
      logger.error('Error adding user input:', error);
      throw new Error('Failed to add user input');
    }
  }
}

export const goldenSetService = new GoldenSetService();
