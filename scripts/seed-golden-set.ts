import { prisma } from '../src/config/prisma.ts';


async function seedGoldenSet() {
  try {
    console.info('Seeding golden set...');

    // Example seed data
    const goldenSetData = [
      {
        projectExId: 'mwLZrNj2ZKB',
        copilotType: 'dataModel' as const,
        description: 'Example data model for testing',
        query:
          'Model a many-to-many relationship between users and teams where a user can have exactly one role per team, but roles are extensible. create anything else when needed. do not ask me for further info', // TODO: implement meaningful prompt templates
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
          projectExId: data.projectExId,
          copilotType: data.copilotType,
        },
        update: {
          userInput: {
            create: {
              description: data.description,
              content: data.query,
            },
          },
        },
        create: {
          projectExId: data.projectExId,
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

    console.info(`✓ Seeded ${goldenSetData.length} golden set entries`);
  } catch (error) {
    console.error('Seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedGoldenSet();
