import { prisma } from '../src/config/prisma';
import { logger } from '../src/utils/logger';

async function seedGoldenSet() {
  try {
    logger.info('Seeding golden set...');

    // Example seed data
    const goldenSetData = [
      {
        project_ex_id: 'example-project-1',
        schema_ex_id: 'example-schema-1',
        copilot_type: 'data_model_builder',
        description: 'Example data model for e-commerce',
      },
      {
        project_ex_id: 'example-project-2',
        schema_ex_id: 'example-schema-2',
        copilot_type: 'ui_builder',
        description: 'Example UI for dashboard',
      },
    ];

    for (const data of goldenSetData) {
      await prisma.golden_set.upsert({
        where: {
          project_ex_id_schema_ex_id_copilot_type: {
            project_ex_id: data.project_ex_id,
            schema_ex_id: data.schema_ex_id,
            copilot_type: data.copilot_type,
          },
        },
        update: {},
        create: data,
      });
    }

    logger.info(`✓ Seeded ${goldenSetData.length} golden set entries`);
  } catch (error) {
    logger.error('Seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedGoldenSet();
