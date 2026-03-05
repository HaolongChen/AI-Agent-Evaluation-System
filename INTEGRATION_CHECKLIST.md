# Integration Checklist

This checklist helps you integrate the refactored architecture into your existing codebase.

## ✅ Phase 1: Verify Installation

### 1.1 Install Dependencies
```bash
pnpm install
```

**Verify:**
- [ ] No installation errors
- [ ] `tsyringe` installed (v4.8.0)
- [ ] `vitest` installed (v2.1.8)
- [ ] `reflect-metadata` installed (v0.2.2)

### 1.2 Test the Setup
```bash
pnpm test
```

**Expected:**
- [ ] All tests pass (37+ tests)
- [ ] Coverage report generated
- [ ] No TypeScript compilation errors

---

## ✅ Phase 2: Update Existing Code

### 2.1 Update Entry Point

**File:** `src/index.ts`

**Add at the top:**
```typescript
import 'reflect-metadata'; // Must be first
import { bootstrap } from './bootstrap.ts';

// Initialize DI container
bootstrap();
```

**Checklist:**
- [ ] Import `reflect-metadata` first
- [ ] Call `bootstrap()` before server start
- [ ] Verify no initialization errors in logs

### 2.2 Update Services to Use DI

**Example Service Migration:**

**Before:**
```typescript
// src/services/MyService.ts
import { prisma } from '../config/prisma.ts';

export class MyService {
  async getData(id: number) {
    return prisma.model.findUnique({ where: { id } });
  }
}

export const myService = new MyService();
```

**After:**
```typescript
// src/services/MyService.ts
import { injectable, inject } from 'tsyringe';
import { TOKENS } from '../shared/container/Container.ts';
import { IEvaluationRepository } from '../domains/evaluation/repositories/IEvaluationRepository.ts';

@injectable()
export class MyService {
  constructor(
    @inject(TOKENS.EvaluationRepository)
    private repo: IEvaluationRepository
  ) {}

  async getData(id: number) {
    return this.repo.findById(id);
  }
}

// Don't export instance, let container manage it
```

**For each service:**
- [ ] Add `@injectable()` decorator
- [ ] Inject dependencies via constructor
- [ ] Use repository interfaces instead of Prisma
- [ ] Remove singleton export
- [ ] Update imports in consumers

### 2.3 Update GraphQL Resolvers

**Before:**
```typescript
import { myService } from '../services/MyService.ts';

export const resolvers = {
  Query: {
    getData: async (_, { id }) => {
      return myService.getData(id);
    }
  }
};
```

**After:**
```typescript
import { container } from '../shared/container/Container.ts';
import { MyService } from '../services/MyService.ts';

export const resolvers = {
  Query: {
    getData: async (_, { id }) => {
      const service = container.resolve(MyService);
      return service.getData(id);
    }
  }
};
```

**Checklist:**
- [ ] Resolve services from container
- [ ] Remove direct imports of service instances
- [ ] Test all resolvers

---

## ✅ Phase 3: Migrate to Error Classes

### 3.1 Update Error Handling

**Before:**
```typescript
if (!user) {
  throw new Error('User not found');
}
```

**After:**
```typescript
import { NotFoundError } from '../shared/errors/index.ts';

if (!user) {
  throw new NotFoundError('User', id, { requestId });
}
```

### 3.2 Common Replacements

| Old Pattern | New Error Class |
|------------|-----------------|
| `throw new Error('Invalid input')` | `ValidationError` |
| `throw new Error('Not found')` | `NotFoundError` |
| `throw new Error('Already exists')` | `ConflictError` |
| `throw new Error('Database failed')` | `DatabaseError` |
| Generic `Error` in LLM code | `LLMProviderError` |

**Checklist:**
- [ ] Replace generic `Error` with specific error classes
- [ ] Add context to all errors
- [ ] Update error handling in GraphQL layer
- [ ] Test error responses

### 3.3 Update Error Logging

**Before:**
```typescript
catch (error) {
  logger.error('Failed:', error);
  throw error;
}
```

**After:**
```typescript
import { BaseError } from '../shared/errors/index.ts';

catch (error) {
  if (error instanceof BaseError) {
    logger.error('Operation failed:', error.toJSON());
  } else {
    logger.error('Unexpected error:', error);
  }
  throw error;
}
```

**Checklist:**
- [ ] Log structured error data
- [ ] Preserve error context
- [ ] Don't log sensitive information

---

## ✅ Phase 4: Integrate Circuit Breaker

### 4.1 Update LLM Calls

**Before:**
```typescript
import { getLLM } from '../langGraph/llm/index.ts';

const llm = getLLM(config);
const result = await llm.invoke(messages);
```

**After:**
```typescript
import { resilientLLMInvoker } from '../langGraph/llm/ResilientLLMInvoker.ts';

const result = await resilientLLMInvoker.invoke(
  messages,
  config,
  {
    enableFallback: true,
    retries: 3,
    operationName: 'my-operation',
    context: { sessionId }
  }
);
```

**Checklist:**
- [ ] Replace direct LLM calls
- [ ] Enable fallback where appropriate
- [ ] Add operation names for logging
- [ ] Test error scenarios

### 4.2 Monitor Circuit Breaker Health

**Add health endpoint:**
```typescript
import { container, TOKENS } from '../shared/container/Container.ts';
import { LLMCircuitBreakerManager } from '../shared/resilience/LLMCircuitBreakerManager.ts';

app.get('/health/circuit-breakers', (_req, res) => {
  const manager = container.resolve<LLMCircuitBreakerManager>(
    TOKENS.CircuitBreakerManager
  );
  
  const status = manager.getHealthStatus();
  res.json(status);
});
```

**Checklist:**
- [ ] Add health check endpoint
- [ ] Monitor circuit breaker states
- [ ] Set up alerts for OPEN circuits
- [ ] Test circuit breaker behavior

---

## ✅ Phase 5: Update Workflow Nodes

### 5.1 Migrate to BaseNode

**Before:**
```typescript
export async function myNode(state, config) {
  try {
    // Logic here
    return { /* new state */ };
  } catch (error) {
    logger.error('Node failed:', error);
    throw error;
  }
}
```

**After:**
```typescript
import { BaseNode, NodeContext } from './BaseNode.ts';

class MyNode extends BaseNode<StateType> {
  constructor() {
    super('MyNode');
  }

  protected async executeInternal(
    state: StateType,
    config: any,
    context: NodeContext
  ): Promise<Partial<StateType>> {
    // Validate state
    this.validateState(state, ['requiredProp']);
    
    // Log
    this.log('info', 'Processing...', { sessionId: context.sessionId });
    
    // Logic here
    return { /* new state */ };
  }
}

export const myNode = async (state, config) => {
  const node = new MyNode();
  return node.execute(state, config);
};
```

**For each node:**
- [ ] Extend `BaseNode`
- [ ] Implement `executeInternal()`
- [ ] Add state validation
- [ ] Use logging helpers
- [ ] Test error handling

---

## ✅ Phase 6: Add Tests

### 6.1 Test New Services

**Create test file:** `tests/unit/services/MyService.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { MockEvaluationRepository } from '../../helpers/mockRepositories.ts';
import { MyService } from '../../../src/services/MyService.ts';

describe('MyService', () => {
  let repository: MockEvaluationRepository;
  let service: MyService;

  beforeEach(() => {
    repository = new MockEvaluationRepository();
    service = new MyService(repository);
  });

  it('should get data', async () => {
    // Seed test data
    repository.seed([{ id: 1, /* ... */ }]);

    const result = await service.getData(1);

    expect(result).toBeDefined();
    expect(repository.findById).toHaveBeenCalledWith(1);
  });
});
```

**Checklist:**
- [ ] Test all services with mocks
- [ ] Test error scenarios
- [ ] Achieve 80%+ coverage
- [ ] Run tests in CI/CD

### 6.2 Test Error Handling

**Create test file:** `tests/unit/services/ErrorHandling.test.ts`

```typescript
import { NotFoundError } from '../../../src/shared/errors/index.ts';

it('should throw NotFoundError', async () => {
  await expect(service.getData(999)).rejects.toThrow(NotFoundError);
});

it('should include error context', async () => {
  try {
    await service.getData(999);
  } catch (error) {
    expect(error).toBeInstanceOf(NotFoundError);
    expect(error.context).toBeDefined();
  }
});
```

**Checklist:**
- [ ] Test all error paths
- [ ] Verify error context
- [ ] Test retryable errors
- [ ] Test circuit breaker errors

---

## ✅ Phase 7: Update Configuration

### 7.1 Environment Variables

**Add to `.env`:**
```env
# Circuit Breaker Configuration (optional)
CIRCUIT_BREAKER_FAILURE_THRESHOLD=5
CIRCUIT_BREAKER_RESET_TIMEOUT=30000
CIRCUIT_BREAKER_SUCCESS_THRESHOLD=3

# Testing
NODE_ENV=development
```

**Checklist:**
- [ ] Add circuit breaker config
- [ ] Update `.env.example`
- [ ] Document new variables

### 7.2 TypeScript Configuration

**Verify `tsconfig.json` includes:**
```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "paths": {
      "@/*": ["./src/*"],
      "@domains/*": ["./src/domains/*"],
      "@shared/*": ["./src/shared/*"],
      "@config/*": ["./src/config/*"]
    }
  }
}
```

**Checklist:**
- [ ] Decorators enabled
- [ ] Path aliases configured
- [ ] No TypeScript errors

---

## ✅ Phase 8: Documentation

### 8.1 Update README

**Add section:**
```markdown
## Architecture

This project uses:
- **Dependency Injection** with tsyringe
- **Repository Pattern** for data access
- **Circuit Breaker** for LLM resilience
- **Structured Errors** for error handling

See [ARCHITECTURE.md](./ARCHITECTURE.md) for details.

## Testing

Run tests:
\`\`\`bash
pnpm test           # Run all tests
pnpm test:ui        # Test UI
pnpm test:coverage  # Coverage report
\`\`\`
```

**Checklist:**
- [ ] Update README with new architecture
- [ ] Link to documentation files
- [ ] Update setup instructions

### 8.2 Team Documentation

**Create/update:**
- [ ] Onboarding guide with new patterns
- [ ] Code review checklist (DI, errors, tests)
- [ ] Troubleshooting guide

---

## ✅ Phase 9: Deployment

### 9.1 Pre-Deployment Checklist

**Code Quality:**
- [ ] All tests passing
- [ ] Coverage meets threshold (80%)
- [ ] No TypeScript errors
- [ ] No linting errors

**Dependencies:**
- [ ] All dependencies installed
- [ ] No security vulnerabilities
- [ ] Lock file updated

**Configuration:**
- [ ] Environment variables set
- [ ] Secrets configured
- [ ] Database migrations applied

### 9.2 Deployment Steps

1. **Build:**
   ```bash
   pnpm build:bundle
   ```
   - [ ] Build succeeds
   - [ ] Bundle size acceptable

2. **Database:**
   ```bash
   pnpm db:migrate
   ```
   - [ ] Migrations applied
   - [ ] Rollback plan ready

3. **Deploy:**
   - [ ] Deploy to staging
   - [ ] Run smoke tests
   - [ ] Monitor logs
   - [ ] Check circuit breaker health

4. **Production:**
   - [ ] Deploy to production
   - [ ] Monitor error rates
   - [ ] Check circuit breaker states
   - [ ] Verify metrics

### 9.3 Monitoring

**Set up:**
- [ ] Error tracking (Sentry, etc.)
- [ ] Circuit breaker alerts
- [ ] Performance monitoring
- [ ] Log aggregation

---

## ✅ Phase 10: Rollout Strategy

### Option A: Big Bang (Not Recommended)
- Switch all at once
- High risk
- Use only for small projects

### Option B: Gradual Migration (Recommended)

**Week 1-2:**
- [ ] Set up infrastructure (DI, tests)
- [ ] Migrate 1-2 services
- [ ] Test thoroughly

**Week 3-4:**
- [ ] Migrate remaining services
- [ ] Update all error handling
- [ ] Add circuit breakers to LLM calls

**Week 5-6:**
- [ ] Migrate workflow nodes
- [ ] Complete test coverage
- [ ] Documentation

**Week 7+:**
- [ ] Monitor production
- [ ] Fix issues
- [ ] Optimize

---

## 🚨 Common Issues

### Issue: DI Container Not Initialized
**Error:** `Cannot resolve dependency`

**Solution:**
```typescript
// Make sure bootstrap() is called first
import 'reflect-metadata';
import { bootstrap } from './bootstrap.ts';

bootstrap(); // Must be before any container.resolve()
```

### Issue: Circular Dependencies
**Error:** `Circular dependency detected`

**Solution:**
- Use lazy injection: `@inject(() => TOKENS.Service)`
- Refactor to break circular dependency
- Use events/mediator pattern

### Issue: Tests Failing
**Error:** Various test failures

**Solution:**
- Reset mocks: `beforeEach(() => vi.clearAllMocks())`
- Reset repository: `beforeEach(() => repository.reset())`
- Check async/await usage

### Issue: Circuit Breaker Not Working
**Error:** No fallback behavior

**Solution:**
- Verify circuit breaker is initialized
- Check `enableFallback` is `true`
- Monitor circuit breaker state
- Check error categorization

---

## 📊 Success Metrics

### After Integration

**Code Quality:**
- [ ] Test coverage ≥ 80%
- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] No critical linting issues

**Architecture:**
- [ ] All services use DI
- [ ] All data access via repositories
- [ ] Structured errors everywhere
- [ ] Circuit breakers on all LLM calls

**Monitoring:**
- [ ] Error rates stable or improved
- [ ] Circuit breaker health visible
- [ ] Test coverage tracking
- [ ] Performance metrics

---

## 📞 Support

### Resources
- [REFACTORING.md](./REFACTORING.md) - Detailed guide
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Architecture overview
- [tests/README.md](./tests/README.md) - Testing guide
- [REFACTORING_SUMMARY.md](./REFACTORING_SUMMARY.md) - Quick reference

### Getting Help
1. Check documentation above
2. Review example tests
3. Examine implementation files
4. Ask team/create issue

---

**Good luck with the integration! 🚀**
