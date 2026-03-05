# Refactoring Documentation

This document describes the comprehensive refactoring applied to the AI Agent Evaluation System.

## Overview

The refactoring transforms the monolithic architecture into a maintainable, testable, and resilient system with:
- **Dependency Injection** for loose coupling
- **Domain-Driven Design** with repository pattern
- **Structured Error Handling** with custom error hierarchy
- **Circuit Breaker Pattern** for LLM resilience
- **Comprehensive Testing** with Vitest

---

## Phase 1: Foundation Setup

### 1.1 Dependencies Added

#### New Production Dependencies
- `tsyringe` (^4.8.0) - Dependency injection container
- `reflect-metadata` (^0.2.2) - Required for DI decorators

#### New Development Dependencies
- `vitest` (^2.1.8) - Modern test framework
- `@vitest/ui` (^2.1.8) - Test UI for debugging
- `@vitest/coverage-v8` (^2.1.8) - Code coverage reporting
- `vite` (^6.0.7) - Build tool for Vitest

### 1.2 Error Hierarchy

Created structured error classes in `src/shared/errors/`:

```typescript
// Base error with metadata
export class BaseError extends Error {
  code: ErrorCode;
  context: ErrorContext;
  metadata: ErrorMetadata;
}
```

**Error Categories:**
- **Domain Errors:** `ValidationError`, `NotFoundError`, `ConflictError`, `InvalidStateError`
- **Infrastructure Errors:** `DatabaseError`, `WebSocketError`, `KubernetesError`
- **LLM Errors:** `LLMProviderError`, `LLMTimeoutError`, `LLMRateLimitError`, `LLMDeploymentNotFoundError`
- **Circuit Breaker Errors:** `CircuitBreakerOpenError`, `CircuitBreakerTimeoutError`
- **Workflow Errors:** `WorkflowExecutionError`, `WorkflowNodeError`, `WorkflowStateError`

**Features:**
- Structured error codes
- Context metadata
- Retryable flag
- HTTP status codes
- JSON serialization
- Original error preservation

---

## Phase 2: Domain-Driven Architecture

### 2.1 Repository Pattern

Created interfaces and implementations for data access:

**Base Interface:**
```typescript
export interface IRepository<T, ID = number> {
  findById(id: ID): Promise<T | null>;
  findMany(criteria?: Partial<T>): Promise<T[]>;
  create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
  update(id: ID, data: Partial<T>): Promise<T>;
  delete(id: ID): Promise<void>;
  exists(id: ID): Promise<boolean>;
}
```

**Domain Repositories:**
- `IEvaluationRepository` / `EvaluationRepository` - Evaluation sessions
- More repositories can be added following the same pattern

### 2.2 Unit of Work Pattern

Manages transactions across repositories:

```typescript
export interface IUnitOfWork {
  transaction<T>(work: () => Promise<T>): Promise<T>;
  begin(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
}
```

Implementation: `PrismaUnitOfWork` wraps Prisma transactions

### 2.3 Dependency Injection

Setup with tsyringe:

**Container Tokens:**
```typescript
export const TOKENS = {
  PrismaClient: Symbol('PrismaClient'),
  EvaluationRepository: Symbol('EvaluationRepository'),
  UnitOfWork: Symbol('UnitOfWork'),
  CircuitBreakerManager: Symbol('CircuitBreakerManager'),
  Logger: Symbol('Logger'),
};
```

**Registration:**
```typescript
// In bootstrap.ts
container.register<IEvaluationRepository>(
  TOKENS.EvaluationRepository,
  { useClass: EvaluationRepository }
);
```

**Injection:**
```typescript
@injectable()
export class EvaluationRepository {
  constructor(
    @inject(TOKENS.PrismaClient) private prisma: PrismaClient
  ) {}
}
```

---

## Phase 3: Enhanced Error Handling

### 3.1 BaseNode Class

Created base class for all LangGraph workflow nodes:

**Features:**
- Structured error handling
- Execution metrics (start time, duration)
- Context extraction from config
- State validation helpers
- Logging helpers

**Usage:**
```typescript
export class MyNode extends BaseNode<State> {
  constructor() {
    super('MyNode');
  }

  protected async executeInternal(
    state: State,
    config: any,
    context: NodeContext
  ): Promise<Partial<State>> {
    // Node logic here
    this.log('info', 'Processing...', { sessionId: context.sessionId });
    
    this.validateState(state, ['requiredProp1', 'requiredProp2']);
    
    return { /* updated state */ };
  }
}
```

### 3.2 Error Context

All errors include rich context:
```typescript
{
  timestamp: "2026-03-05T12:00:00Z",
  sessionId: 123,
  threadId: "thread-abc",
  operationName: "rubric-generation",
  retryAttempt: 2,
  provider: "azure"
}
```

---

## Phase 4: Circuit Breaker Implementation

### 4.1 CircuitBreaker Class

Implements the circuit breaker pattern:

**States:**
- `CLOSED` - Normal operation
- `OPEN` - Rejecting requests
- `HALF_OPEN` - Testing recovery

**Configuration:**
```typescript
{
  failureThreshold: 5,        // Open after 5 failures
  failureTimeWindow: 60000,   // 60 second window
  resetTimeout: 30000,        // Wait 30s before retry
  successThreshold: 3,        // Need 3 successes to close
  timeout: 60000              // 60s timeout per call
}
```

**Metrics:**
- Total calls
- Successful/failed calls
- Rejected calls
- Consecutive failures/successes
- State transitions

### 4.2 LLMCircuitBreakerManager

Manages circuit breakers for multiple LLM providers:

**Features:**
- Per-provider circuit breakers (Azure, Gemini)
- Automatic fallback chain
- Health status monitoring
- Manual reset/configuration

**Usage:**
```typescript
const result = await circuitBreakerManager.execute(
  'azure',
  (provider) => callLLM(provider),
  enableFallback: true
);
```

### 4.3 ResilientLLMInvoker

Wraps LLM calls with resilience:

**Features:**
- Circuit breaker protection
- Exponential backoff retry
- Error categorization
- Automatic provider fallback
- Timeout handling

**Flow:**
```
Call LLM → Circuit Breaker Check → Execute with Retry → 
  Success → Return
  Failure → Categorize Error → Retry or Fallback
```

---

## Phase 5: Testing Infrastructure

### 5.1 Vitest Setup

**Configuration:** `vitest.config.ts`
- Node environment
- Global test helpers
- Coverage reporting (80% threshold)
- Path aliases (@domains, @shared, @config)

**Setup File:** `tests/setup.ts`
- Environment variables for tests
- Global before/after hooks
- Mock initialization

### 5.2 Mock Implementations

**MockEvaluationRepository:**
- In-memory storage
- Full IRepository implementation
- Test helpers (reset, seed)
- Vitest spies on all methods

### 5.3 Test Structure

**Unit Tests:**
- `tests/unit/errors/` - Error class tests
- `tests/unit/resilience/` - Circuit breaker tests
- `tests/unit/repositories/` - Repository tests

**Test Coverage:**
```bash
pnpm test              # Run tests
pnpm test:ui           # Open test UI
pnpm test:coverage     # Generate coverage report
```

---

## Migration Guide

### For Existing Services

**Before:**
```typescript
import { prisma } from '../config/prisma.ts';

export class MyService {
  async doSomething() {
    const data = await prisma.model.findMany();
  }
}
```

**After:**
```typescript
import { injectable, inject } from 'tsyringe';
import { TOKENS } from '@shared/container/Container.ts';
import { IEvaluationRepository } from '@domains/evaluation/repositories/IEvaluationRepository.ts';

@injectable()
export class MyService {
  constructor(
    @inject(TOKENS.EvaluationRepository) 
    private evaluationRepo: IEvaluationRepository
  ) {}

  async doSomething() {
    const data = await this.evaluationRepo.findMany();
  }
}
```

### For Error Handling

**Before:**
```typescript
try {
  // operation
} catch (error) {
  logger.error('Failed:', error);
  throw new Error('Failed to do something');
}
```

**After:**
```typescript
import { DatabaseError, NotFoundError } from '@shared/errors';

try {
  const item = await repository.findById(id);
  if (!item) {
    throw new NotFoundError('Item', id, { userId });
  }
} catch (error) {
  if (error instanceof NotFoundError) {
    throw error;
  }
  
  logger.error('Database operation failed:', error);
  throw new DatabaseError(
    'Failed to find item',
    { itemId: id },
    error instanceof Error ? error : undefined
  );
}
```

### For LLM Calls

**Before:**
```typescript
const llm = getLLM(config);
const result = await llm.invoke(messages);
```

**After:**
```typescript
import { resilientLLMInvoker } from '@langGraph/llm/ResilientLLMInvoker.ts';

const result = await resilientLLMInvoker.invoke(
  messages,
  config,
  {
    enableFallback: true,
    retries: 3,
    operationName: 'rubric-generation',
    context: { sessionId }
  }
);
```

---

## Benefits

### 1. Testability
- Mock dependencies easily with DI
- Unit test services in isolation
- Fast tests with in-memory mocks

### 2. Maintainability
- Clear separation of concerns
- Repository abstraction
- Structured errors with context

### 3. Resilience
- Circuit breakers prevent cascading failures
- Automatic retry with backoff
- Graceful degradation with fallbacks

### 4. Observability
- Rich error context
- Execution metrics
- Circuit breaker health status

### 5. Type Safety
- Interface-based contracts
- Compile-time dependency checking
- IDE auto-completion

---

## File Structure

```
src/
├── bootstrap.ts                      # DI container setup
├── shared/
│   ├── container/
│   │   └── Container.ts             # DI tokens
│   ├── errors/
│   │   ├── BaseError.ts            # Base error class
│   │   ├── DomainErrors.ts         # Domain error types
│   │   ├── InfrastructureErrors.ts # Infrastructure errors
│   │   ├── LLMErrors.ts            # LLM-specific errors
│   │   ├── WorkflowErrors.ts       # Workflow errors
│   │   └── index.ts                # Exports
│   ├── interfaces/
│   │   ├── IRepository.ts          # Repository interface
│   │   └── IUnitOfWork.ts          # UoW interface
│   ├── infrastructure/
│   │   └── PrismaUnitOfWork.ts     # Prisma UoW implementation
│   └── resilience/
│       ├── CircuitBreaker.ts       # Circuit breaker
│       └── LLMCircuitBreakerManager.ts # LLM CB manager
├── domains/
│   └── evaluation/
│       └── repositories/
│           ├── IEvaluationRepository.ts
│           └── EvaluationRepository.ts
└── langGraph/
    ├── llm/
    │   └── ResilientLLMInvoker.ts  # Resilient LLM calls
    └── nodes/
        └── BaseNode.ts             # Base node class

tests/
├── setup.ts                        # Vitest setup
├── helpers/
│   └── mockRepositories.ts         # Mock implementations
└── unit/
    ├── errors/
    ├── resilience/
    └── repositories/
```

---

## Next Steps

1. **Migrate Existing Services** to use DI and repositories
2. **Add More Repositories** (Rubric, GoldenSet, Project)
3. **Update Workflow Nodes** to extend BaseNode
4. **Add Integration Tests** with test database
5. **Implement Health Check Endpoint** using circuit breaker metrics
6. **Add Correlation IDs** for distributed tracing
7. **Create API Documentation** with GraphQL schema

---

## Testing the Refactoring

### Run Tests
```bash
# All tests
pnpm test

# With UI
pnpm test:ui

# With coverage
pnpm test:coverage

# Watch mode
pnpm test --watch
```

### Verify Error Handling
```bash
# Unit tests
pnpm test tests/unit/errors

# Circuit breaker tests
pnpm test tests/unit/resilience
```

### Check Repository Pattern
```bash
pnpm test tests/unit/repositories
```

---

## Questions?

For questions or issues related to the refactoring, please refer to:
- Error handling: `src/shared/errors/`
- DI setup: `src/bootstrap.ts`
- Repository pattern: `src/domains/evaluation/repositories/`
- Circuit breaker: `src/shared/resilience/`
- Testing: `tests/`
