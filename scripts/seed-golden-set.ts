import { prisma } from '../src/config/prisma.ts';
import { logger } from '../src/utils/logger.ts';
import { CopilotType } from '../src/generated/prisma/index.js'; // Import the enum

async function seedGoldenSet() {
  try {
    logger.info('Seeding golden set...');

    // Example seed data
    const goldenSetData = [
      {
        projectExId: 'l7YRy8qyJYN',
        schemaExId: 'example-schema-1',
        copilotType: CopilotType.dataModel, // Use enum
        description: 'Example data model for e-commerce',
        promptTemplate: 'create a table called like_table which contains post_id and user_id, etc. create anything else when needed', // TODO: implement meaningful prompt templates
        idealResponse: { entities: ['User', 'Product', 'Order'] },
      },
      // {
      //   projectExId: 'example-project-2',
      //   schemaExId: 'example-schema-2',
      //   copilotType: CopilotType.uiBuilder, // Use enum
      //   description: 'Example UI for dashboard',
      //   promptTemplate: 'Create a dashboard UI with charts and tables',
      //   idealResponse: { components: ['Chart', 'Table', 'Card'] },
      // },
    ];

    for (const data of goldenSetData) {
      await prisma.goldenSet.upsert({
        where: {
          projectExId_schemaExId_copilotType: {
            projectExId: data.projectExId,
            schemaExId: data.schemaExId,
            copilotType: data.copilotType,
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
