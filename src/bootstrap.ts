/**
 * Application Bootstrap
 * 
 * Initializes dependency injection container and registers all dependencies
 */

import 'reflect-metadata';
import { container, TOKENS } from './shared/container/Container.ts';
import { PrismaClient } from '../build/generated/prisma/client.ts';
import { prisma } from './config/prisma.ts';

// Repositories
import { EvaluationRepository } from './domains/evaluation/repositories/EvaluationRepository.ts';
import { IEvaluationRepository } from './domains/evaluation/repositories/IEvaluationRepository.ts';

// Infrastructure
import { PrismaUnitOfWork } from './shared/infrastructure/PrismaUnitOfWork.ts';
import { IUnitOfWork } from './shared/interfaces/IUnitOfWork.ts';

// Resilience
import { LLMCircuitBreakerManager } from './shared/resilience/LLMCircuitBreakerManager.ts';

// Logger
import { logger } from './utils/logger.ts';

/**
 * Bootstrap the application
 * Registers all dependencies in the DI container
 */
export function bootstrap(): void {
  logger.info('Bootstrapping application...');

  // Register Prisma client
  container.registerInstance(TOKENS.PrismaClient, prisma);

  // Register Unit of Work
  container.register<IUnitOfWork>(TOKENS.UnitOfWork, {
    useClass: PrismaUnitOfWork,
  });

  // Register Repositories
  container.register<IEvaluationRepository>(TOKENS.EvaluationRepository, {
    useClass: EvaluationRepository,
  });

  // Register Circuit Breaker Manager (singleton)
  container.registerSingleton(TOKENS.CircuitBreakerManager, LLMCircuitBreakerManager);

  // Register Logger
  container.registerInstance(TOKENS.Logger, logger);

  logger.info('Application bootstrapped successfully');
  logger.info('Registered dependencies:', {
    repositories: ['EvaluationRepository'],
    infrastructure: ['PrismaClient', 'UnitOfWork'],
    resilience: ['CircuitBreakerManager'],
  });
}

/**
 * Get container instance
 */
export function getContainer() {
  return container;
}
