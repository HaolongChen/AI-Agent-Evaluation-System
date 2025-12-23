import { prisma } from '../config/prisma.ts';
import { COPILOT_TYPES } from '../config/constants.ts';
import { logger } from '../utils/logger.ts';
import type { Prisma } from '../../build/generated/prisma/client.ts';

export class GoldenSetService {
  async updateGoldenSetInput(
    projectExId: string,
    schemaExId: string,
    copilotType: keyof typeof COPILOT_TYPES,
    description: string,
    query: string
  ) {
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
  ) {
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

  async getGoldenSet(goldenSetId: number) {
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
}

export const goldenSetService = new GoldenSetService();
