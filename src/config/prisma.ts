import { PrismaClient } from '../prisma/build/generated/prisma/client.ts';
import { DATABASE_URL } from './env.ts';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = DATABASE_URL;

const adapter = new PrismaPg({
  connectionString,
});
export const prisma = new PrismaClient({ adapter, errorFormat: 'pretty' });

