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
    copilotType: keyof typeof COPILOT_TYPES,
    description: string,
    query: string
  ): Promise<GoldenSetWithRelations> {
    try {
      const copilotTypeValue = COPILOT_TYPES[copilotType];
      const goldenSet = await prisma.goldenSet.upsert({
        where: {
          projectExId
        },
        update: {
          userInput: {
            create: {
              description,
              content: query,
            },
          },
        },
        create: {
          projectExId,
          copilotType: copilotTypeValue,
          userInput: {
            create: {
              description,
              content: query,
            },
          },
          isProjectExisting: projectExId !== 'N/A', // Mark as existing if projectExId is provided, otherwise it's a new golden set
        },
        include: {
          userInput: true,
          copilotOutput: true,
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
    copilotType?: keyof typeof COPILOT_TYPES;
    isActive?: boolean;
  }): Promise<GoldenSetWithRelations[]> {
    try {
      const goldenSets = await prisma.goldenSet.findMany({
        where: {
          ...(filters?.projectExId && { projectExId: filters.projectExId }),
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

      logger.debug('Fetched golden sets:', goldenSets);
      return goldenSets;
    } catch (error) {
      logger.error('Error fetching golden sets:', error);
      throw new Error('Failed to fetch golden sets');
    }
  }
}

export const goldenSetService = new GoldenSetService();
