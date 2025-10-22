import { prisma } from '../config/prisma.ts';
import { COPILOT_TYPES } from '../config/constants.ts';
import { logger } from '../utils/logger.ts';
import { executionService } from './ExecutionService.ts';
import { rubricService } from './RubricService.ts';

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
    ReturnType<typeof this.simplyUpdateGoldenSetProject> | { message: string }
  > {
    try {
      const evaluationSessions = await executionService.getSessions({
        schemaExId,
        copilotType: COPILOT_TYPES[copilotType],
      });
      if (!evaluationSessions || evaluationSessions.length === 0) {
        logger.info(
          `No evaluation sessions found for schemaExId: ${schemaExId} and copilotType: ${copilotType}`
        );
        const result = await this.simplyUpdateGoldenSetProject(
          projectExId,
          schemaExId,
          copilotType,
          description,
          promptTemplate,
          idealResponse
        );
        return result;
      }
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
