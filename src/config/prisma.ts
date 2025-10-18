import { PrismaClient } from '../generated/prisma/index.js';
import { NODE_ENV } from './env.ts';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

if (NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
