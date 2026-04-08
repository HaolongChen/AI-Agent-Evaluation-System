import { PrismaClient } from '@src/prisma/build/generated/prisma/client';
import { DATABASE_URL } from './env.ts';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = DATABASE_URL;

const adapter = new PrismaPg({
  connectionString,
});

export const prisma = new PrismaClient({ adapter, errorFormat: 'pretty' });

