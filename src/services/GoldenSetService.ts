import { prisma } from '../config/prisma.ts';

export class GoldenSetService {
  async updateGoldenSetProject(
    projectExId: string,
    schemaExId: string,
    copilotType: string,
    description?: string
  ) {
    return prisma.golden_set.upsert({
      where: {
        project_ex_id_schema_ex_id_copilot_type: {
          project_ex_id: projectExId,
          schema_ex_id: schemaExId,
          copilot_type: copilotType,
        },
      },
      update: {
        description,
        is_active: true,
      },
      create: {
        project_ex_id: projectExId,
        schema_ex_id: schemaExId,
        copilot_type: copilotType,
        description,
      },
    });
  }

  async getGoldenSetSchemas(copilotType?: string) {
    const results = await prisma.golden_set.findMany({
      where: {
        is_active: true,
        ...(copilotType && { copilot_type: copilotType }),
      },
      select: {
        schema_ex_id: true,
      },
      distinct: ['schema_ex_id'],
    });

    return results.map((r) => r.schema_ex_id);
  }

  async getGoldenSet(projectExId?: string, copilotType?: string) {
    return prisma.golden_set.findMany({
      where: {
        is_active: true,
        ...(projectExId && { project_ex_id: projectExId }),
        ...(copilotType && { copilot_type: copilotType }),
      },
    });
  }
}

export const goldenSetService = new GoldenSetService();
