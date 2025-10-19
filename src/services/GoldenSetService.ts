import { prisma } from '../config/prisma.ts';
import { COPILOT_TYPES } from '../config/constants.ts';
import { logger } from '../utils/logger.ts';

export class GoldenSetService {
  async updateGoldenSetProject(
    projectExId: string,
    schemaExId: string,
    copilotType: keyof typeof COPILOT_TYPES,
    description: string,
    promptTemplate: string,
    idealResponse: object
  ) {
    try {
      logger.debug(typeof idealResponse);
      return prisma.goldenSet.upsert({
        where: {
          projectExId_schemaExId_copilotType: {
            projectExId,
            schemaExId,
            copilotType: COPILOT_TYPES[copilotType],
          },
        },
        update: {
          description,
          promptTemplate,
          idealResponse,
          isActive: true,
        },
        create: {
          projectExId,
          schemaExId,
          copilotType: COPILOT_TYPES[copilotType],
          description,
          promptTemplate,
          idealResponse,
        },
      });
    } catch (error) {
      logger.error('Error updating golden set project:', error);
      throw new Error('Failed to update golden set project');
    }
  }

  async getGoldenSetSchemas(copilotType?: keyof typeof COPILOT_TYPES) {
    try {
      const results = await prisma.goldenSet.findMany({
        where: {
          isActive: true,
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
    copilotType?: keyof typeof COPILOT_TYPES
  ) {
    try {
      const results = await prisma.goldenSet.findMany({
        where: {
          isActive: true,
          ...(projectExId && { projectExId }),
          ...(copilotType && { copilotType: COPILOT_TYPES[copilotType] }),
        },
      });
      logger.debug('Fetched golden sets:', results);
      return results;
    } catch (error) {
      logger.error('Error fetching golden sets:', error);
      throw new Error('Failed to fetch golden sets');
    }
  }
}

export const goldenSetService = new GoldenSetService();
