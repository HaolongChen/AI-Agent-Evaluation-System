import { prisma } from '../config/prisma.ts';
import type { copilotType } from '../utils/types.ts';

export class GoldenSetService {
  async updateGoldenSetProject(
    projectExId: string,
    schemaExId: string,
    copilotType: copilotType,
    description: string,
    promptTemplate: string,
    idealResponse: object
  ) {
    return prisma.golden_set.upsert({
      where: {
        projectExId_schemaExId_copilotType: {
          projectExId,
          schemaExId,
          copilotType,
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
        copilotType,
        description,
        promptTemplate,
        idealResponse,
      },
    });
  }

  async getGoldenSetSchemas(copilotType?: copilotType) {
    const results = await prisma.golden_set.findMany({
      where: {
        isActive: true,
        ...(copilotType && { copilotType }),
      },
      select: {
        schemaExId: true,
      },
      distinct: ['schemaExId'],
    });

    return results.map((r) => r.schemaExId);
  }

  async getGoldenSet(projectExId?: string, copilotType?: copilotType) {
    return prisma.golden_set.findMany({
      where: {
        isActive: true,
        ...(projectExId && { projectExId }),
        ...(copilotType && { copilotType }),
      },
    });
  }
}

export const goldenSetService = new GoldenSetService();
