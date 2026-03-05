import 'reflect-metadata';
import { container } from 'tsyringe';

/**
 * Dependency Injection Container
 * 
 * This module configures the tsyringe DI container with all application dependencies.
 * Register all repositories, services, and external dependencies here.
 */

// Tokens for dependency injection
export const TOKENS = {
  // Database
  PrismaClient: Symbol('PrismaClient'),

  // Repositories
  EvaluationRepository: Symbol('EvaluationRepository'),
  RubricRepository: Symbol('RubricRepository'),
  GoldenSetRepository: Symbol('GoldenSetRepository'),
  ProjectRepository: Symbol('ProjectRepository'),
  SessionRepository: Symbol('SessionRepository'),

  // Unit of Work
  UnitOfWork: Symbol('UnitOfWork'),

  // Services
  EvaluationService: Symbol('EvaluationService'),
  RubricService: Symbol('RubricService'),
  WorkflowService: Symbol('WorkflowService'),
  AnalyticsService: Symbol('AnalyticsService'),

  // External Services
  LLMProvider: Symbol('LLMProvider'),
  CircuitBreakerManager: Symbol('CircuitBreakerManager'),

  // Logger
  Logger: Symbol('Logger'),
} as const;

/**
 * Initialize the DI container
 * This should be called at application startup
 */
export function initializeContainer(): void {
  // Container is ready for registration
  // Actual registrations happen in bootstrap.ts after imports
}

export { container };
