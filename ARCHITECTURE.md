# System Architecture

## Overview

The AI Agent Evaluation System is now built with a modern, maintainable architecture featuring:

- **Domain-Driven Design** with clear separation of concerns
- **Dependency Injection** for loose coupling and testability
- **Repository Pattern** for data access abstraction
- **Circuit Breaker Pattern** for resilience
- **Comprehensive Error Handling** with structured error types
- **Full Test Coverage** with modern testing infrastructure

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        GraphQL API Layer                     │
│                    (Apollo Server + Express)                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                      Service Layer                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Evaluation   │  │   Rubric     │  │   Workflow   │      │
│  │   Service    │  │   Service    │  │   Service    │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                         │                                    │
└─────────────────────────┼────────────────────────────────────┘
                          │
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                   Repository Layer                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Evaluation   │  │   Rubric     │  │  GoldenSet   │      │
│  │  Repository  │  │  Repository  │  │  Repository  │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                         │                                    │
│                    Unit of Work                              │
│                         │                                    │
└─────────────────────────┼────────────────────────────────────┘
                          │
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                  Prisma ORM + PostgreSQL                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   LangGraph Workflow Engine                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  BaseNode    │  │  LLM Layer   │  │  Circuit     │      │
│  │   (Error     │  │  (Resilient  │  │  Breaker     │      │
│  │  Handling)   │  │   Invoker)   │  │  Manager     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              External Services (LLM Providers)               │
│         Azure OpenAI  ←→  Circuit Breaker  ←→  Gemini       │
└─────────────────────────────────────────────────────────────┘
```

---

## Layer Responsibilities

### 1. GraphQL API Layer

**Purpose:** HTTP entry point, request validation, response formatting

**Components:**
- Apollo Server (GraphQL)
- Express middleware
- GraphQL resolvers
- Type definitions

**Responsibilities:**
- Request authentication/authorization
- Input validation
- Response formatting
- Error translation to HTTP codes

### 2. Service Layer

**Purpose:** Business logic orchestration

**Components:**
- Domain services (Evaluation, Rubric, Workflow)
- Business logic
- Transaction coordination

**Responsibilities:**
- Coordinate multiple repositories
- Implement business rules
- Handle complex workflows
- Manage Unit of Work

**Example:**
```typescript
@injectable()
export class EvaluationService {
  constructor(
    @inject(TOKENS.EvaluationRepository) private repo: IEvaluationRepository,
    @inject(TOKENS.UnitOfWork) private uow: IUnitOfWork
  ) {}

  async createWithRubrics(data: CreateData) {
    return this.uow.transaction(async () => {
      const session = await this.repo.create(data);
      // More operations...
      return session;
    });
  }
}
```

### 3. Repository Layer

**Purpose:** Data access abstraction

**Components:**
- Repository interfaces (contracts)
- Prisma implementations
- Domain models

**Responsibilities:**
- CRUD operations
- Query building
- Data mapping
- Error translation

**Benefits:**
- Testable with mocks
- Swappable implementations
- Clean separation from ORM

### 4. Infrastructure Layer

**Purpose:** Technical concerns

**Components:**
- Unit of Work (transactions)
- Circuit Breakers
- Logging
- Caching (future)

### 5. Workflow Layer

**Purpose:** LangGraph execution engine

**Components:**
- Workflow nodes (extends BaseNode)
- State management
- LLM integration
- Human-in-the-loop

---

## Design Patterns

### 1. Dependency Injection

**Implementation:** TSyringe container

**Benefits:**
- Loose coupling
- Easy testing with mocks
- Centralized configuration
- Lifecycle management

**Example:**
```typescript
// Register
container.register<IEvaluationRepository>(
  TOKENS.EvaluationRepository,
  { useClass: EvaluationRepository }
);

// Inject
@injectable()
class MyService {
  constructor(
    @inject(TOKENS.EvaluationRepository) private repo: IEvaluationRepository
  ) {}
}
```

### 2. Repository Pattern

**Purpose:** Abstract data access

**Structure:**
```typescript
interface IRepository<T> {
  findById(id: number): Promise<T | null>;
  findMany(criteria?: Partial<T>): Promise<T[]>;
  create(data: Omit<T, 'id'>): Promise<T>;
  update(id: number, data: Partial<T>): Promise<T>;
  delete(id: number): Promise<void>;
}
```

**Benefits:**
- Testable data layer
- Swappable implementations
- Domain-focused interfaces

### 3. Unit of Work

**Purpose:** Manage transactions

**Usage:**
```typescript
await unitOfWork.transaction(async (tx) => {
  await repo1.create(data1);
  await repo2.update(id, data2);
  // All or nothing
});
```

### 4. Circuit Breaker

**Purpose:** Prevent cascading failures

**States:**
- **CLOSED**: Normal operation
- **OPEN**: Failing, reject requests
- **HALF_OPEN**: Testing recovery

**Usage:**
```typescript
const result = await circuitBreaker.execute(async () => {
  return await callExternalService();
});
```

### 5. Template Method (BaseNode)

**Purpose:** Standardize workflow node execution

**Structure:**
```typescript
abstract class BaseNode<TState> {
  async execute(state, config): Promise<Partial<TState>> {
    // Before (metrics, logging)
    const result = await this.executeInternal(state, config);
    // After (metrics, logging)
    return result;
  }

  protected abstract executeInternal(state, config): Promise<Partial<TState>>;
}
```

---

## Error Handling Strategy

### Error Hierarchy

```
BaseError (abstract)
├── DomainErrors
│   ├── ValidationError (400)
│   ├── NotFoundError (404)
│   ├── ConflictError (409)
│   └── InvalidStateError (400)
├── InfrastructureErrors
│   ├── DatabaseError (500)
│   ├── WebSocketError (503)
│   └── KubernetesError (500)
├── LLMErrors
│   ├── LLMProviderError (502)
│   ├── LLMTimeoutError (504)
│   ├── LLMRateLimitError (429)
│   └── LLMDeploymentNotFoundError (404)
├── CircuitBreakerErrors
│   ├── CircuitBreakerOpenError (503)
│   └── CircuitBreakerTimeoutError (504)
└── WorkflowErrors
    ├── WorkflowExecutionError (500)
    ├── WorkflowNodeError (500)
    └── WorkflowStateError (400)
```

### Error Context

Every error includes:
```typescript
{
  code: ErrorCode,
  context: {
    timestamp: string,
    sessionId?: number,
    operationName?: string,
    // ... domain-specific context
  },
  metadata: {
    retryable: boolean,
    statusCode: number,
    originalError?: Error
  }
}
```

---

## Data Flow Examples

### 1. Create Evaluation Session

```
GraphQL Request
    ↓
Resolver validates input
    ↓
Service coordinates operation
    ↓
Repository creates entity
    ↓
Prisma executes SQL
    ↓
PostgreSQL stores data
    ↓
Success response propagates up
```

### 2. LLM Call with Circuit Breaker

```
Service initiates LLM call
    ↓
ResilientLLMInvoker wraps call
    ↓
Circuit Breaker checks state
    ↓ (if CLOSED)
Execute with retry logic
    ↓ (on failure)
Circuit Breaker records failure
    ↓ (if threshold exceeded)
Circuit opens → reject future calls
    ↓ (if fallback enabled)
Try alternative provider
```

### 3. Workflow Execution

```
GraphQL starts workflow
    ↓
LangGraph state machine begins
    ↓
Node1 (extends BaseNode)
    ├─ Before: Log start, extract context
    ├─ Execute: Business logic
    └─ After: Log metrics, handle errors
    ↓
Node2 (Human-in-the-Loop)
    └─ Pause for human input
    ↓
Resume on GraphQL mutation
    ↓
Continue to completion
```

---

## Resilience Strategies

### 1. Circuit Breaker Configuration

```typescript
{
  azure: {
    failureThreshold: 5,      // Open after 5 failures
    failureTimeWindow: 60000,  // Within 60 seconds
    resetTimeout: 30000,       // Wait 30s before retry
    successThreshold: 3,       // Need 3 successes to close
    timeout: 60000             // 60s per call
  }
}
```

### 2. Retry Strategy

- **Exponential backoff**: 1s, 2s, 4s, 8s, ...
- **Max retries**: 3 attempts
- **Jitter**: Random delay to prevent thundering herd
- **Categorized errors**: Only retry transient failures

### 3. Fallback Chain

```
Primary Provider (Azure) → Secondary Provider (Gemini)
                ↓
        Circuit Breaker
                ↓
        Graceful Degradation
```

---

## Testing Architecture

### Test Pyramid

```
         ╱╲
        ╱E2E╲          ← Integration/E2E (few)
       ╱──────╲
      ╱ Integ. ╲       ← Integration (some)
     ╱──────────╲
    ╱    Unit    ╲     ← Unit tests (many)
   ╱──────────────╲
```

### Test Types

1. **Unit Tests** (`tests/unit/`)
   - Individual classes/functions
   - Mocked dependencies
   - Fast execution

2. **Integration Tests** (`tests/integration/` - TODO)
   - Multiple components
   - Real database (test DB)
   - Slower execution

3. **E2E Tests** (`tests/e2e/`)
   - Full system
   - Real services
   - Slowest execution

### Mock Strategy

```typescript
// Mock repository
const mockRepo = new MockEvaluationRepository();

// Inject mock
const service = new EvaluationService(mockRepo);

// Verify interactions
expect(mockRepo.findById).toHaveBeenCalledWith(1);
```

---

## Performance Considerations

### 1. Database Queries

- Use repository pattern for query optimization
- Implement eager loading with `include`
- Add database indexes on foreign keys
- Use connection pooling (Prisma default)

### 2. Circuit Breaker Overhead

- Minimal: ~1-2ms per call
- State checks are in-memory
- No external dependencies

### 3. Caching Strategy (Future)

```typescript
@injectable()
class CachedEvaluationRepository implements IEvaluationRepository {
  constructor(
    @inject(TOKENS.EvaluationRepository) private repo: IEvaluationRepository,
    @inject(TOKENS.Cache) private cache: ICache
  ) {}

  async findById(id: number) {
    const cached = await this.cache.get(`session:${id}`);
    if (cached) return cached;

    const session = await this.repo.findById(id);
    await this.cache.set(`session:${id}`, session, TTL);
    return session;
  }
}
```

---

## Security Considerations

### 1. Input Validation

- GraphQL schema validation
- Custom validators in services
- Sanitize user inputs

### 2. Error Messages

- Don't leak sensitive info
- Structured errors with safe context
- Different messages for client vs. logs

### 3. Dependency Injection Security

- Register dependencies at startup
- Prevent runtime tampering
- Use readonly containers in production

---

## Monitoring & Observability

### Current Implementation

1. **Structured Logging**
   - All errors logged with context
   - Execution metrics
   - Circuit breaker state changes

2. **Circuit Breaker Metrics**
   - Success/failure counts
   - State transitions
   - Response times

### Future Enhancements

1. **Distributed Tracing** (OpenTelemetry)
2. **Metrics Dashboard** (Prometheus + Grafana)
3. **Alert System** (circuit breaker opens)
4. **Health Checks** (circuit breaker status)

---

## Deployment Architecture

### Current: Single Instance

```
┌─────────────────────┐
│   Load Balancer     │
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│    Application      │
│   (Node.js + DI)    │
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│    PostgreSQL       │
└─────────────────────┘
```

### Future: Scaled Architecture

```
┌─────────────────────┐
│   Load Balancer     │
└──────────┬──────────┘
           │
     ┌─────┴─────┐
     │           │
┌────▼───┐  ┌───▼────┐
│ App 1  │  │ App 2  │  (Stateless instances)
└────┬───┘  └───┬────┘
     │          │
     └────┬─────┘
          │
┌─────────▼──────────┐
│   PostgreSQL       │
│   (Primary/Replica)│
└────────────────────┘
          │
┌─────────▼──────────┐
│   Redis (Cache +   │
│  CB State Sharing) │
└────────────────────┘
```

---

## References

- [REFACTORING.md](./REFACTORING.md) - Detailed refactoring guide
- [REFACTORING_SUMMARY.md](./REFACTORING_SUMMARY.md) - Implementation summary
- [tests/README.md](./tests/README.md) - Testing guide
- [README.md](./README.md) - Project overview
