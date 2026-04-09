import { prisma } from '../src/config/prisma.ts';


async function setupDatabase() {
  try {
    console.info('Setting up database...');

    // Test connection
    await prisma.$connect();
    console.info('✓ Database connection successful');

    // You can add additional setup logic here
    // For example, creating initial data or checking schemas

    console.info('Database setup completed successfully');
  } catch (error) {
    console.error('Database setup failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

await setupDatabase();
