import { PrismaClient } from '../../build/generated/prisma/client.ts';
import { NODE_ENV, DATABASE_URL } from './env.ts';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const connectionString = `${DATABASE_URL}`;

const adapter = new PrismaPg({
  connectionString,
});

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    adapter,
  });

if (NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
