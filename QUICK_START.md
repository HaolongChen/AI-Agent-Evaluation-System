# 🚀 Quick Start: Refactored Architecture

## 30-Second Overview

The AI Agent Evaluation System has been refactored with:
- ✅ **Dependency Injection** (tsyringe)
- ✅ **Repository Pattern** (data access abstraction)
- ✅ **Circuit Breaker** (LLM resilience)
- ✅ **Structured Errors** (15+ error types)
- ✅ **Comprehensive Tests** (37+ tests with Vitest)

---

## ⚡ Quick Commands

```bash
# Install
pnpm install

# Run tests
pnpm test

# Test UI
pnpm test:ui

# Coverage
pnpm test:coverage

# Start dev server
pnpm dev
```

---

## 📖 Documentation Quick Links

| Document | When to Use |
|----------|-------------|
| **[REFACTORING_COMPLETE.md](./REFACTORING_COMPLETE.md)** | 📌 **START HERE** - Complete overview |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Understand system design |
| [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) | Migrate existing code |
| [INTEGRATION_CHECKLIST.md](./INTEGRATION_CHECKLIST.md) | Integration tasks |
| [REFACTORING.md](./REFACTORING.md) | Deep dive details |
| [tests/README.md](./tests/README.md) | Testing guide |

---

## 🎯 Use Cases

### 1. I Want to Understand the Changes
👉 Read **[REFACTORING_COMPLETE.md](./REFACTORING_COMPLETE.md)**

### 2. I Want to Write New Code
👉 See **example service**: `src/domains/evaluation/services/RefactoredEvaluationService.ts`

**Pattern:**
```typescript
import { injectable, inject } from 'tsyringe';
import { TOKENS } from '@shared/container/Container.ts';

@injectable()
export class MyService {
  constructor(
    @inject(TOKENS.EvaluationRepository) private repo: IEvaluationRepository
  ) {}

  async myMethod(id: number) {
    const item = await this.repo.findById(id);
    if (!item) {
      throw new NotFoundError('Item', id);
    }
    return item;
  }
}
```

### 3. I Want to Migrate Existing Code
👉 Follow **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)**

**Quick Migration:**
1. Add `@injectable()` to class
2. Inject dependencies in constructor
3. Replace Prisma with repository
4. Use structured errors
5. Add tests

### 4. I Want to Write Tests
👉 See **test examples**: `tests/unit/`

**Quick Test:**
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { MockEvaluationRepository } from '../../helpers/mockRepositories.ts';

describe('MyService', () => {
  let repository: MockEvaluationRepository;
  let service: MyService;

  beforeEach(() => {
    repository = new MockEvaluationRepository();
    service = new MyService(repository);
  });

  it('should work', async () => {
    const result = await service.doSomething();
    expect(result).toBeDefined();
  });
});
```

### 5. I Want to Use Circuit Breakers
👉 Use **ResilientLLMInvoker**

```typescript
import { resilientLLMInvoker } from '@langGraph/llm/ResilientLLMInvoker.ts';

const result = await resilientLLMInvoker.invoke(
  messages,
  { provider: 'azure', model: 'gpt-4o', temperature: 0.2 },
  { enableFallback: true, retries: 3 }
);
```

---

## 🛠️ Common Tasks

### Initialize DI Container

```typescript
// src/index.ts (add at top)
import 'reflect-metadata';
import { bootstrap } from './bootstrap.ts';

bootstrap(); // Initialize before anything else
```

### Create a New Service

```typescript
import { injectable, inject } from 'tsyringe';
import { TOKENS } from '@shared/container/Container.ts';

@injectable()
export class NewService {
  constructor(
    @inject(TOKENS.EvaluationRepository) private repo: IEvaluationRepository
  ) {}

  async doSomething(id: number) {
    return this.repo.findById(id);
  }
}
```

### Throw Structured Errors

```typescript
import { NotFoundError, ValidationError } from '@shared/errors';

// Not found
if (!item) {
  throw new NotFoundError('Item', id, { userId });
}

// Validation
if (!email.includes('@')) {
  throw new ValidationError('Invalid email', { email });
}
```

### Use in GraphQL Resolver

```typescript
import { container } from '@shared/container/Container.ts';
import { MyService } from '@domains/my/services/MyService.ts';

export const resolvers = {
  Query: {
    getData: async (_, { id }) => {
      const service = container.resolve(MyService);
      return service.getData(id);
    }
  }
};
```

### Write a Test

```typescript
import { describe, it, expect } from 'vitest';
import { MockEvaluationRepository } from '@tests/helpers/mockRepositories.ts';

describe('MyService', () => {
  it('should work', async () => {
    const repo = new MockEvaluationRepository();
    const service = new MyService(repo);
    
    const result = await service.getData(1);
    
    expect(result).toBeDefined();
    expect(repo.findById).toHaveBeenCalled();
  });
});
```

---

## 🎓 Learning Path

### Day 1: Understand the Changes
- [ ] Read [REFACTORING_COMPLETE.md](./REFACTORING_COMPLETE.md) (15 min)
- [ ] Skim [ARCHITECTURE.md](./ARCHITECTURE.md) (20 min)
- [ ] Run tests: `pnpm test` (5 min)

### Day 2: Explore the Code
- [ ] Review `src/shared/errors/` - Error classes (30 min)
- [ ] Review `src/shared/resilience/` - Circuit breaker (30 min)
- [ ] Study example service (30 min)

### Day 3: Write Code
- [ ] Follow [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) (2 hours)
- [ ] Migrate one service (2-4 hours)
- [ ] Write tests for migrated service (1-2 hours)

### Week 2+: Full Migration
- [ ] Follow [INTEGRATION_CHECKLIST.md](./INTEGRATION_CHECKLIST.md)
- [ ] Migrate all services
- [ ] Achieve 80% coverage

---

## ⚠️ Important Notes

### Must Do Before Using

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Initialize DI container:**
   ```typescript
   import 'reflect-metadata';
   import { bootstrap } from './bootstrap.ts';
   bootstrap();
   ```

3. **Run tests to verify:**
   ```bash
   pnpm test
   ```

### TypeScript Config

Ensure `tsconfig.json` has:
```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

---

## 🔗 Related Files

### Must-Read Files
1. `REFACTORING_COMPLETE.md` - **Start here**
2. `src/domains/evaluation/services/RefactoredEvaluationService.ts` - **Example code**
3. `tests/unit/errors/BaseError.test.ts` - **Example test**

### Reference Files
- `src/shared/errors/` - All error types
- `src/shared/resilience/` - Circuit breaker
- `src/domains/evaluation/repositories/` - Repository pattern
- `tests/helpers/mockRepositories.ts` - Test mocks

---

## 💡 Tips

### For Writing New Code
1. Always use `@injectable()` for services
2. Inject dependencies via constructor
3. Use repository interfaces, not Prisma
4. Throw structured errors
5. Write tests with mocks

### For Migrating Code
1. Start with one service
2. Add tests first
3. Use migration guide
4. Verify with tests
5. Deploy incrementally

### For Testing
1. Use mock repositories
2. Test happy and error paths
3. Aim for 80%+ coverage
4. Use test UI for debugging

---

## 🎉 You're Ready!

The refactoring is complete and ready to use. Choose your path:

- **New to changes?** → [REFACTORING_COMPLETE.md](./REFACTORING_COMPLETE.md)
- **Writing new code?** → See example service
- **Migrating code?** → [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)
- **Need checklist?** → [INTEGRATION_CHECKLIST.md](./INTEGRATION_CHECKLIST.md)

**Happy coding! 🚀**
