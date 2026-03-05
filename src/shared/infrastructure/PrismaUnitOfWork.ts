import { injectable, inject } from 'tsyringe';
import { PrismaClient } from '../../../build/generated/prisma/client.ts';
import { IUnitOfWork } from '../interfaces/IUnitOfWork.ts';
import { TOKENS } from '../container/Container.ts';
import { DatabaseTransactionError } from '../errors/index.ts';
import { logger } from '../../utils/logger.ts';

/**
 * Prisma implementation of Unit of Work pattern
 * 
 * Manages database transactions using Prisma's interactive transactions
 */
@injectable()
export class PrismaUnitOfWork implements IUnitOfWork {
  private transactionActive = false;
  private currentTransaction: PrismaClient | null = null;

  constructor(
    @inject(TOKENS.PrismaClient) private readonly prisma: PrismaClient
  ) {}

  async begin(): Promise<void> {
    if (this.transactionActive) {
      throw new DatabaseTransactionError('Transaction already active');
    }
    this.transactionActive = true;
    logger.debug('Transaction started');
  }

  async commit(): Promise<void> {
    if (!this.transactionActive) {
      throw new DatabaseTransactionError('No active transaction to commit');
    }
    this.transactionActive = false;
    this.currentTransaction = null;
    logger.debug('Transaction committed');
  }

  async rollback(): Promise<void> {
    if (!this.transactionActive) {
      throw new DatabaseTransactionError('No active transaction to rollback');
    }
    this.transactionActive = false;
    this.currentTransaction = null;
    logger.debug('Transaction rolled back');
  }

  async transaction<T>(work: (tx: PrismaClient) => Promise<T>): Promise<T> {
    try {
      await this.begin();
      
      const result = await this.prisma.$transaction(async (tx) => {
        this.currentTransaction = tx as PrismaClient;
        return await work(tx as PrismaClient);
      });

      await this.commit();
      return result;
    } catch (error) {
      await this.rollback();
      
      logger.error('Transaction failed:', error);
      
      throw new DatabaseTransactionError(
        'Transaction failed',
        { operationName: 'transaction' },
        error instanceof Error ? error : undefined
      );
    }
  }

  isActive(): boolean {
    return this.transactionActive;
  }

  /**
   * Get the current transaction client or the default prisma client
   */
  getClient(): PrismaClient {
    return this.currentTransaction || this.prisma;
  }
}
