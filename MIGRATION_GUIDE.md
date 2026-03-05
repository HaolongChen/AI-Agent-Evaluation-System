# Migration Guide: Adopting the Refactored Architecture

This guide provides step-by-step instructions for migrating existing code to use the new architecture.

---

## Table of Contents

1. [Before You Start](#before-you-start)
2. [Migrate Services](#migrate-services)
3. [Migrate GraphQL Resolvers](#migrate-graphql-resolvers)
4. [Migrate Error Handling](#migrate-error-handling)
5. [Migrate LLM Calls](#migrate-llm-calls)
6. [Migrate Workflow Nodes](#migrate-workflow-nodes)
7. [Add Tests](#add-tests)

---

## Before You Start

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Initialize DI Container

**Update `src/index.ts`:**

```typescript
// Add at the very top (before any other imports)
import 'reflect-metadata';

// After imports, before server setup
import { bootstrap } from './bootstrap.ts';

// Initialize DI container
bootstrap();

// Rest of server setup...
const app = express();
const server = new ApolloServer({ typeDefs, resolvers });
```

### 3. Run Tests to Verify Setup
```bash
pnpm test
```

Expected: All new tests should pass (37+ tests)

---

## Migrate Services

### Example: GraphExecutionService

#### Before

```typescript
// src/services/GraphExecutionService.ts
import { prisma } from '../config/prisma.ts';
import { logger } from '../utils/logger.ts';
import { evaluationPersistenceService } from './EvaluationPersistenceService.ts';

export class GraphExecutionService {
  async submitRubricReview(
    sessionId: number,
    threadId: string,
    approved: boolean,
    // ...
  ): Promise<RubricReviewResult> {
    try {
      const session = await prisma.evaluationSession.findUnique({
        where: { id: sessionId },
        include: { rubrics: true }
      });

      if (!session) {
        throw new Error('Session not found');
      }

      // More logic...
    } catch (error) {
      logger.error('Error submitting review:', error);
      throw new Error('Failed to submit review');
    }
  }
}

export const graphExecutionService = new GraphExecutionService();
```

#### After

```typescript
// src/domains/workflow/services/GraphExecutionService.ts
import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../shared/container/Container.ts';
import { IEvaluationRepository } from '../../evaluation/repositories/IEvaluationRepository.ts';
import { IRubricRepository } from '../../rubric/repositories/IRubricRepository.ts';
import { IUnitOfWork } from '../../../shared/interfaces/IUnitOfWork.ts';
import { 
  NotFoundError,
  DatabaseError,
  WorkflowExecutionError 
} from '../../../shared/errors/index.ts';

@injectable()
export class GraphExecutionService {
  constructor(
    @inject(TOKENS.EvaluationRepository)
    private readonly evaluationRepo: IEvaluationRepository,
    
    @inject(TOKENS.RubricRepository)
    private readonly rubricRepo: IRubricRepository,
    
    @inject(TOKENS.UnitOfWork)
    private readonly unitOfWork: IUnitOfWork,
    
    @inject(TOKENS.Logger)
    private readonly logger: typeof logger
  ) {}

  async submitRubricReview(
    sessionId: number,
    threadId: string,
    approved: boolean,
    // ...
  ): Promise<RubricReviewResult> {
    try {
      this.logger.info('Submitting rubric review', {
        sessionId,
        threadId,
        approved,
      });

      // Use repository instead of Prisma
      const session = await this.evaluationRepo.findByIdWithRubrics(sessionId);

      if (!session) {
        throw new NotFoundError('EvaluationSession', sessionId, {
          operationName: 'submitRubricReview',
          threadId,
        });
      }

      // Use Unit of Work for transaction
      await this.unitOfWork.transaction(async () => {
        // More logic with repository methods...
      });

      this.logger.info('Rubric review submitted successfully', {
        sessionId,
        threadId,
      });

      return { /* result */ };
    } catch (error) {
      // Structured error handling
      if (error instanceof NotFoundError) {
        throw error;
      }

      this.logger.error('Failed to submit rubric review', {
        sessionId,
        threadId,
        error: error instanceof Error ? error.message : String(error),
      });

      throw new WorkflowExecutionError(
        'rubricReview',
        error instanceof Error ? error.message : 'Unknown error',
        { sessionId, threadId },
        error instanceof Error ? error : undefined
      );
    }
  }
}

// Don't export instance - let DI container manage lifecycle
```

#### Migration Steps

1. **Add imports:**
   ```typescript
   import { injectable, inject } from 'tsyringe';
   import { TOKENS } from '../../../shared/container/Container.ts';
   ```

2. **Add `@injectable()` decorator:**
   ```typescript
   @injectable()
   export class MyService {
   ```

3. **Inject dependencies:**
   ```typescript
   constructor(
     @inject(TOKENS.EvaluationRepository) private repo: IEvaluationRepository
   ) {}
   ```

4. **Replace Prisma calls with repository methods:**
   ```typescript
   // Before: prisma.evaluationSession.findUnique(...)
   // After:  this.evaluationRepo.findById(...)
   ```

5. **Use structured errors:**
   ```typescript
   // Before: throw new Error('Not found')
   // After:  throw new NotFoundError('Resource', id, context)
   ```

6. **Remove singleton export:**
   ```typescript
   // Remove: export const myService = new MyService();
   ```

---

## Migrate GraphQL Resolvers

### Example: Session Resolver

#### Before

```typescript
// src/graphql/resolvers/SessionResolver.ts
import { executionService } from '../../services/ExecutionService.ts';

export const SessionResolver = {
  Query: {
    getSession: async (_: any, { id }: { id: string }) => {
      try {
        return await executionService.getSession(id);
      } catch (error) {
        throw new Error('Failed to get session');
      }
    }
  }
};
```

#### After

```typescript
// src/graphql/resolvers/SessionResolver.ts
import { container } from '../../shared/container/Container.ts';
import { RefactoredEvaluationService } from '../../domains/evaluation/services/RefactoredEvaluationService.ts';
import { NotFoundError, BaseError } from '../../shared/errors/index.ts';
import { GraphQLError } from 'graphql';

export const SessionResolver = {
  Query: {
    getSession: async (_: any, { id }: { id: string }) => {
      try {
        // Resolve service from container
        const service = container.resolve(RefactoredEvaluationService);
        return await service.getSession(parseInt(id));
      } catch (error) {
        // Map errors to GraphQL errors
        if (error instanceof NotFoundError) {
          throw new GraphQLError(error.message, {
            extensions: {
              code: 'NOT_FOUND',
              statusCode: error.getStatusCode(),
              context: error.context,
            },
          });
        }

        if (error instanceof BaseError) {
          throw new GraphQLError(error.message, {
            extensions: {
              code: error.code,
              statusCode: error.getStatusCode(),
              context: error.context,
            },
          });
        }

        throw new GraphQLError('Internal server error', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
        });
      }
    }
  }
};
```

#### Migration Steps

1. **Resolve services from container:**
   ```typescript
   const service = container.resolve(MyService);
   ```

2. **Handle structured errors:**
   ```typescript
   if (error instanceof NotFoundError) {
     throw new GraphQLError(error.message, {
       extensions: { code: 'NOT_FOUND', statusCode: 404 }
     });
   }
   ```

3. **Map error codes to GraphQL codes**

4. **Test resolver with various error scenarios**

---

## Migrate Error Handling

### Pattern 1: Not Found Errors

#### Before
```typescript
if (!item) {
  throw new Error('Item not found');
}
```

#### After
```typescript
import { NotFoundError } from '../shared/errors/index.ts';

if (!item) {
  throw new NotFoundError('Item', id, { userId, operationName });
}
```

### Pattern 2: Validation Errors

#### Before
```typescript
if (!email || !email.includes('@')) {
  throw new Error('Invalid email');
}
```

#### After
```typescript
import { ValidationError } from '../shared/errors/index.ts';

if (!email || !email.includes('@')) {
  throw new ValidationError('Invalid email format', { 
    email, 
    field: 'email' 
  });
}
```

### Pattern 3: Database Errors

#### Before
```typescript
try {
  await prisma.model.create(data);
} catch (error) {
  logger.error('Create failed:', error);
  throw new Error('Failed to create');
}
```

#### After
```typescript
import { DatabaseError } from '../shared/errors/index.ts';

try {
  await repository.create(data);
} catch (error) {
  logger.error('Create failed:', error);
  throw new DatabaseError(
    'Failed to create item',
    { data, operationName: 'create' },
    error instanceof Error ? error : undefined
  );
}
```

### Pattern 4: LLM Errors

#### Before
```typescript
try {
  const result = await llm.invoke(messages);
} catch (error) {
  throw new Error('LLM call failed');
}
```

#### After
```typescript
import { LLMProviderError } from '../shared/errors/index.ts';

try {
  const result = await llm.invoke(messages);
} catch (error) {
  throw new LLMProviderError(
    provider,
    error instanceof Error ? error.message : 'Unknown error',
    { model, operationName },
    error instanceof Error ? error : undefined
  );
}
```

---

## Migrate LLM Calls

### Before: Direct LLM Call

```typescript
import { getLLM } from '../langGraph/llm/index.ts';

const llm = getLLM({
  provider: 'azure',
  model: 'gpt-4o',
  temperature: 0.2
});

const result = await llm.invoke([
  new HumanMessage('Generate rubric')
]);
```

### After: Resilient LLM Call

```typescript
import { resilientLLMInvoker } from '../langGraph/llm/ResilientLLMInvoker.ts';
import { HumanMessage } from '@langchain/core/messages';

const result = await resilientLLMInvoker.invoke(
  [new HumanMessage('Generate rubric')],
  {
    provider: 'azure',
    model: 'gpt-4o',
    temperature: 0.2
  },
  {
    enableFallback: true,          // Enable automatic fallback to Gemini
    retries: 3,                    // Retry up to 3 times
    operationName: 'rubric-generation',
    context: {
      sessionId,
      threadId,
      goldenSetId
    }
  }
);
```

### Benefits

✅ Automatic retry with exponential backoff  
✅ Circuit breaker protection  
✅ Automatic fallback to alternative providers  
✅ Structured error handling  
✅ Rich logging with context  

---

## Migrate Workflow Nodes

### Before: Plain Function Node

```typescript
// src/langGraph/nodes/MyNode.ts
import { logger } from '../../utils/logger.ts';

export async function myNode(state, config) {
  try {
    logger.info('MyNode started');

    // Node logic
    const result = doSomething(state);

    logger.info('MyNode completed');
    return { result };
  } catch (error) {
    logger.error('MyNode failed:', error);
    throw error;
  }
}
```

### After: BaseNode Class

```typescript
// src/langGraph/nodes/MyNode.ts
import { BaseNode, NodeContext } from './BaseNode.ts';
import { StateType } from '../state/state.ts';

class MyNode extends BaseNode<StateType> {
  constructor() {
    super('MyNode');
  }

  protected async executeInternal(
    state: StateType,
    config: any,
    context: NodeContext
  ): Promise<Partial<StateType>> {
    // Validate required state
    this.validateState(state, ['requiredProp1', 'requiredProp2']);

    this.log('info', 'Processing state', {
      sessionId: context.sessionId,
      hasData: !!state.data
    });

    // Node logic
    const result = doSomething(state);

    this.log('info', 'Processing completed', {
      resultSize: result.length
    });

    return { result };
  }
}

// Export function for LangGraph compatibility
export const myNode = async (state, config) => {
  const node = new MyNode();
  return node.execute(state, config);
};
```

### Migration Checklist

- [ ] Create class extending `BaseNode<StateType>`
- [ ] Implement `executeInternal()`
- [ ] Add state validation with `validateState()`
- [ ] Use `this.log()` for logging
- [ ] Export function wrapper for LangGraph
- [ ] Test error scenarios

---

## Real-World Migration Examples

### Example 1: ExecutionService

**Before:** `src/services/ExecutionService.ts`

```typescript
import { prisma } from '../config/prisma.ts';
import { logger } from '../utils/logger.ts';

export class ExecutionService {
  async createEvaluationSessions(goldenSetId: number) {
    try {
      const goldenSet = await prisma.goldenSet.findUnique({
        where: { id: goldenSetId }
      });

      if (!goldenSet) {
        throw new Error('Golden set not found');
      }

      const session = await prisma.evaluationSession.create({
        data: { /* ... */ }
      });

      return session;
    } catch (error) {
      logger.error('Error:', error);
      throw new Error('Failed to create sessions');
    }
  }
}

export const executionService = new ExecutionService();
```

**After:** `src/domains/evaluation/services/ExecutionService.ts`

```typescript
import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../../../shared/container/Container.ts';
import { IEvaluationRepository } from '../repositories/IEvaluationRepository.ts';
import { IGoldenSetRepository } from '../../goldenset/repositories/IGoldenSetRepository.ts';
import { IUnitOfWork } from '../../../shared/interfaces/IUnitOfWork.ts';
import { NotFoundError, DatabaseError } from '../../../shared/errors/index.ts';

@injectable()
export class ExecutionService {
  constructor(
    @inject(TOKENS.EvaluationRepository) private evaluationRepo: IEvaluationRepository,
    @inject(TOKENS.GoldenSetRepository) private goldenSetRepo: IGoldenSetRepository,
    @inject(TOKENS.UnitOfWork) private unitOfWork: IUnitOfWork,
    @inject(TOKENS.Logger) private logger: any
  ) {}

  async createEvaluationSessions(goldenSetId: number) {
    try {
      this.logger.info('Creating evaluation sessions', { goldenSetId });

      // Use repository
      const goldenSet = await this.goldenSetRepo.findById(goldenSetId);

      if (!goldenSet) {
        throw new NotFoundError('GoldenSet', goldenSetId, {
          operationName: 'createEvaluationSessions'
        });
      }

      // Use transaction
      return await this.unitOfWork.transaction(async () => {
        const session = await this.evaluationRepo.create({
          goldenSetId,
          modelName: 'gpt-4o',
          sessionIdRef: null,
          startedAt: new Date(),
          completedAt: null,
          status: 'running',
          metadata: {}
        });

        this.logger.info('Sessions created', { sessionId: session.id });
        return session;
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      this.logger.error('Failed to create sessions', {
        goldenSetId,
        error: error instanceof Error ? error.message : String(error)
      });

      throw new DatabaseError(
        'Failed to create evaluation sessions',
        { goldenSetId, operationName: 'createEvaluationSessions' },
        error instanceof Error ? error : undefined
      );
    }
  }
}

// No singleton export
```

**Update consumers:**

```typescript
// Before
import { executionService } from './services/ExecutionService.ts';
const result = await executionService.createSessions(1);

// After
import { container } from './shared/container/Container.ts';
import { ExecutionService } from './domains/evaluation/services/ExecutionService.ts';

const service = container.resolve(ExecutionService);
const result = await service.createSessions(1);
```

---

### Example 2: Updating LLM Integration in Nodes

**Before:** `src/langGraph/nodes/RubricDrafterAgent.ts`

```typescript
import { getLLM } from '../llm/index.ts';

export async function rubricDrafterNode(state, config) {
  const llm = getLLM({
    provider: config.provider || 'azure',
    model: config.model || 'gpt-4o',
    temperature: 0.2
  });

  const result = await llm.invoke(messages);
  
  return { questionSetDraft: parseResult(result) };
}
```

**After:**

```typescript
import { BaseNode, NodeContext } from './BaseNode.ts';
import { resilientLLMInvoker } from '../llm/ResilientLLMInvoker.ts';
import { StateType } from '../state/state.ts';

class RubricDrafterNode extends BaseNode<StateType> {
  constructor() {
    super('RubricDrafter');
  }

  protected async executeInternal(
    state: StateType,
    config: any,
    context: NodeContext
  ): Promise<Partial<StateType>> {
    // Validate state
    this.validateState(state, ['userInput', 'copilotOutput']);

    this.log('info', 'Generating rubric draft', {
      sessionId: context.sessionId,
      provider: context.provider
    });

    // Use resilient invoker
    const result = await resilientLLMInvoker.invoke(
      messages,
      {
        provider: context.provider || 'azure',
        model: context.model || 'gpt-4o',
        temperature: 0.2
      },
      {
        enableFallback: true,
        retries: 3,
        operationName: 'rubric-generation',
        context: {
          sessionId: context.sessionId,
          threadId: context.threadId
        }
      }
    );

    const questionSetDraft = parseResult(result);

    this.log('info', 'Rubric draft generated', {
      questionCount: questionSetDraft.questions.length
    });

    return { questionSetDraft };
  }
}

export const rubricDrafterNode = async (state, config) => {
  const node = new RubricDrafterNode();
  return node.execute(state, config);
};
```

---

## Add Tests

### Unit Test Template

**Create:** `tests/unit/services/MyService.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { MockEvaluationRepository } from '../../helpers/mockRepositories.ts';
import { MyService } from '../../../src/services/MyService.ts';
import { NotFoundError } from '../../../src/shared/errors/index.ts';

describe('MyService', () => {
  let repository: MockEvaluationRepository;
  let service: MyService;

  beforeEach(() => {
    repository = new MockEvaluationRepository();
    service = new MyService(repository);
  });

  describe('getData', () => {
    it('should get data successfully', async () => {
      // Arrange
      repository.seed([
        {
          id: 1,
          goldenSetId: 1,
          modelName: 'gpt-4',
          sessionIdRef: null,
          startedAt: new Date(),
          completedAt: null,
          status: 'running',
          metadata: null
        }
      ]);

      // Act
      const result = await service.getData(1);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(repository.findById).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundError when data does not exist', async () => {
      // Act & Assert
      await expect(service.getData(999))
        .rejects
        .toThrow(NotFoundError);
    });
  });
});
```

### Integration Test Template

**Create:** `tests/integration/services/MyService.integration.test.ts`

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '../../../build/generated/prisma/client.ts';
import { EvaluationRepository } from '../../../src/domains/evaluation/repositories/EvaluationRepository.ts';
import { MyService } from '../../../src/services/MyService.ts';

describe('MyService Integration', () => {
  let prisma: PrismaClient;
  let repository: EvaluationRepository;
  let service: MyService;

  beforeAll(async () => {
    // Set up test database
    prisma = new PrismaClient();
    await prisma.$connect();
    
    repository = new EvaluationRepository(prisma);
    service = new MyService(repository);
  });

  afterAll(async () => {
    // Clean up
    await prisma.$disconnect();
  });

  it('should work with real database', async () => {
    // Create test data
    const session = await repository.create({
      goldenSetId: 1,
      modelName: 'gpt-4',
      sessionIdRef: null,
      startedAt: new Date(),
      completedAt: null,
      status: 'running',
      metadata: null
    });

    // Test service
    const result = await service.getData(session.id);

    expect(result).toBeDefined();
    expect(result.id).toBe(session.id);

    // Clean up
    await repository.delete(session.id);
  });
});
```

---

## Verification Steps

After migration, verify:

### 1. Code Compiles
```bash
pnpm build:bundle
```
- [ ] No TypeScript errors
- [ ] Bundle generated successfully

### 2. Tests Pass
```bash
pnpm test
```
- [ ] All unit tests pass
- [ ] Coverage ≥ 80%

### 3. Service Starts
```bash
pnpm dev
```
- [ ] Server starts without errors
- [ ] DI container initialized
- [ ] GraphQL playground accessible

### 4. Functionality Works
```bash
# Test GraphQL queries
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ getSession(id: \"1\") { id status } }"}'
```
- [ ] Queries return data
- [ ] Errors are structured
- [ ] Logging is working

### 5. Circuit Breaker Works
```bash
# Check health endpoint
curl http://localhost:4000/health/circuit-breakers
```
- [ ] Returns circuit breaker status
- [ ] States are tracked correctly

---

## Rollback Plan

If issues arise during migration:

### 1. Immediate Rollback (Git)
```bash
git revert HEAD~10  # Revert last 10 commits
git push origin main --force-with-lease
```

### 2. Partial Rollback

Keep new infrastructure, revert specific files:
```bash
git checkout HEAD~5 -- src/services/MyService.ts
git commit -m "Rollback MyService migration"
```

### 3. Feature Flag (Recommended)

Add feature flag to toggle between old and new code:
```typescript
const USE_NEW_ARCHITECTURE = process.env.USE_NEW_ARCHITECTURE === 'true';

if (USE_NEW_ARCHITECTURE) {
  const service = container.resolve(NewService);
  return service.doSomething();
} else {
  return oldService.doSomething();
}
```

---

## Timeline Estimate

| Phase | Duration | Effort |
|-------|----------|--------|
| Setup (Phases 1-2) | 1-2 days | Medium |
| Migrate 5-10 services | 3-5 days | High |
| Migrate resolvers | 1-2 days | Low |
| Update error handling | 2-3 days | Medium |
| Migrate LLM calls | 1-2 days | Low |
| Migrate workflow nodes | 2-3 days | Medium |
| Add tests | 3-5 days | High |
| Documentation | 1-2 days | Low |
| **Total** | **14-24 days** | |

**Recommended:** 2-3 developers working in parallel

---

## Support & Resources

- **Architecture:** [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Refactoring Details:** [REFACTORING.md](./REFACTORING.md)
- **Testing Guide:** [tests/README.md](./tests/README.md)
- **Implementation Summary:** [REFACTORING_SUMMARY.md](./REFACTORING_SUMMARY.md)
- **Example Service:** `src/domains/evaluation/services/RefactoredEvaluationService.ts`
- **Example Tests:** `tests/unit/`

---

**Need help? Create an issue or check the documentation above!**
