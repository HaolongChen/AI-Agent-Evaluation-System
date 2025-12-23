import { prisma } from '../src/config/prisma.ts';
import { logger } from '../src/utils/logger.ts';

async function seedGoldenSet() {
  try {
    logger.info('Seeding golden set...');

    // Example seed data
    const goldenSetData = [
      {
        projectExId: 'X57jbwZzB76',
        schemaExId: 'example-schema-1',
        copilotType: 'dataModel' as const,
        description: 'Example data model for e-commerce',
        query:
          'create a table called like_table which contains post_id and user_id, etc. create anything else when needed', // TODO: implement meaningful prompt templates
      },
      // {
      //   projectExId: 'example-project-2',
      //   schemaExId: 'example-schema-2',
      //   copilotType: 'uiBuilder' as const,
      //   description: 'Example UI for dashboard',
      //   query: 'Create a dashboard UI with charts and tables',
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
        create: {
          projectExId: data.projectExId,
          schemaExId: data.schemaExId,
          copilotType: data.copilotType,
          userInput: {
            create: {
              description: data.description,
              content: data.query,
            },
          },
        },
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
