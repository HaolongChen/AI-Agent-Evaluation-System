import { prisma } from '../src/config/prisma.ts';
import { logger } from '../src/utils/logger.ts';

async function setupDatabase() {
  try {
    logger.info('Setting up database...');

    // Test connection
    await prisma.$connect();
    logger.info('✓ Database connection successful');

    // You can add additional setup logic here
    // For example, creating initial data or checking schemas

    logger.info('Database setup completed successfully');
  } catch (error) {
    logger.error('Database setup failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

setupDatabase();
