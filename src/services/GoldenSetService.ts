import { prisma } from '../config/prisma.ts';
import { COPILOT_TYPES } from '../config/constants.ts';
import { logger } from '../utils/logger.ts';

export class GoldenSetService {
  async simplyUpdateGoldenSetProject(
    projectExId: string,
    schemaExId: string,
    copilotType: keyof typeof COPILOT_TYPES,
    description: string,
    promptTemplate: string,
    idealResponse: object
  ) {
    try {
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

  async updateGoldenSetProject(
    projectExId: string,
    schemaExId: string,
    copilotType: keyof typeof COPILOT_TYPES,
    description: string,
    promptTemplate: string,
    idealResponse: object
  ): Promise<
    Awaited<ReturnType<typeof this.simplyUpdateGoldenSetProject>> | { message: string }
  > {
    try {
      const originalGoldenSets = await this.getGoldenSets(
        projectExId,
        schemaExId,
        copilotType
      );
      if (originalGoldenSets.length !== 1 || !originalGoldenSets[0]) {
        logger.error('Golden set not found or ambiguous for update');
        return { message: 'Golden set not found or ambiguous' };
      }
      const originalGoldenSet = originalGoldenSets[0];
      if (originalGoldenSet?.nextGoldenSetId) {
        logger.info('A next golden set is already pending for this golden set');
        return {
          message: 'A next golden set is already pending for this golden set',
        };
      }
      const nextGoldenSet = await this.createNextGoldenSet(
        description,
        promptTemplate,
        idealResponse
      );
      return prisma.goldenSet.update({
        where: {
          id: originalGoldenSet.id,
        },
        data: {
          nextGoldenSetId: nextGoldenSet.id,
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
    schemaExId?: string,
    copilotType?: keyof typeof COPILOT_TYPES
  ) {
    try {
      const results = await prisma.goldenSet.findMany({
        where: {
          isActive: true,
          ...(projectExId && { projectExId }),
          ...(schemaExId && { schemaExId }),
          ...(copilotType && { copilotType: COPILOT_TYPES[copilotType] }),
        },
        include: {
          nextGoldenSet: true,
        },
      });
      logger.debug('Fetched golden sets:', results);
      return results;
    } catch (error) {
      logger.error('Error fetching golden sets:', error);
      throw new Error('Failed to fetch golden sets');
    }
  }

  async createNextGoldenSet(
    description: string,
    promptTemplate: string,
    idealResponse: object
  ) {
    try {
      return prisma.nextGoldenSet.create({
        data: {
          description,
          promptTemplate,
          idealResponse,
        },
      });
    } catch (error) {
      logger.error('Error creating next golden set:', error);
      throw new Error('Failed to create next golden set');
    }
  }
}

export const goldenSetService = new GoldenSetService();
