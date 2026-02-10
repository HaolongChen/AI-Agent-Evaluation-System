# AGENTS.md - AI Agent Evaluation System

> **Generated:** 2026-02-10 | **Commit:** 27cfc69 | **Branch:** main

Guidelines for agentic coding systems operating in this repository.

## Project Overview

AI Agent Evaluation System - An end-to-end evaluation framework for Copilot-style agents. It orchestrates Human-in-the-Loop (HITL) workflows with LangGraph, stores structured results in PostgreSQL via Prisma, and exposes a GraphQL API for golden set management, evaluations, and analytics.

**Tech Stack**: TypeScript (ESM), Node.js 18+, GraphQL (Apollo Server), LangGraph + LangChain, Prisma, PostgreSQL, Kubernetes (optional)

## Structure

```
AI-Agent-Evaluation-System/
├── src/
│   ├── index.ts              # Express + ApolloServer entry
│   ├── langGraph/            # LangGraph HITL workflow (see langGraph/AGENTS.md)
│   │   ├── nodes/            # 12 workflow nodes (pure functions)
│   │   ├── state/            # rubricAnnotation (state machine)
│   │   ├── llm/              # Azure/Gemini provider abstraction
│   │   └── tools/            # Schema download tool
│   ├── services/             # Business logic, DB ops (see services/AGENTS.md)
│   ├── jobs/                 # CLI job runners (see jobs/AGENTS.md)
│   ├── graphql/              # GraphQL API layer (see graphql/resolvers/AGENTS.md)
│   ├── utils/                # Pure utilities, logger
│   └── config/               # Environment, constants, prisma
├── tests/                    # Script-based tests (tsx execution)
├── prisma/                   # Schema + migrations
└── scripts/                  # DB setup/seed utilities
```

## Where to Look

| Task | Location | Notes |
|------|----------|-------|
| Add evaluation workflow node | `src/langGraph/nodes/` | Pure functions, return partial state |
| Add GraphQL mutation/query | `src/graphql/resolvers/` | Thin resolvers → delegate to services |
| Add business logic | `src/services/` | Singleton pattern, handles DB operations |
| Modify evaluation state | `src/langGraph/state/state.ts` | Uses LangGraph Annotation system |
| Add CLI job runner | `src/jobs/` | Embedded CLI parsing, start/wait/stop pattern |
| Change database schema | `prisma/schema.prisma` | Run `pnpm db:generate` after |
| Add utility function | `src/utils/` | Pure functions, no side effects |
| Configure LLM providers | `src/langGraph/llm/` | Azure OpenAI, Gemini support |
| Add tests | `tests/` | Script-based, use tsx (not Jest/Vitest) |

**See also**: `src/langGraph/AGENTS.md` for HITL workflow architecture details.

## Build, Test, and Lint Commands

### Build
```bash
pnpm build          # Development build
pnpm build:bundle   # Production bundle (esbuild)
pnpm dev            # Hot reload development
pnpm start          # Production start
```

### Test
```bash
pnpm test:lg              # LangGraph workflow tests
pnpm test:graphql         # GraphQL API tests
pnpm test:partial-update  # Partial update functionality
pnpm test:e2e             # End-to-end full flow
```

**Test Convention**: Script-based (not Jest/Vitest), executed via `tsx`, may require `.env` and seeded DB.

### Database
```bash
pnpm db:setup      # Initial database setup
pnpm db:seed       # Seed golden set data
pnpm db:push       # Push schema changes (dev)
pnpm db:generate   # Generate Prisma client
pnpm db:migrate    # Run migrations (prod)
pnpm db:studio     # Open Prisma Studio
```

## Code Style Guidelines

### Import Organization
- **Order**: External packages → Internal modules → Type-only imports
- **Style**: Named imports; `import type` for types
- **Paths**: Relative imports with `.ts` extension (ALWAYS)
- **Example**:
  ```typescript
  import { prisma } from '../config/prisma.ts';
  import { REVIEW_STATUS } from '../config/constants.ts';
  import type { Rubric, FinalReport } from '../langGraph/state/state.ts';
  ```

### TypeScript Usage
- **Strictness**: All strict flags enabled (`tsconfig.json`)
- **Type Annotations**: Explicitly type all function parameters and return values
- **Never** use `any` - use `unknown` or proper types
- **Prefer** `as const` objects over enums
- **Constants**: UPPER_SNAKE_CASE for exported constants

### Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Files | PascalCase (classes), camelCase (utilities) | `EvaluationPersistenceService.ts`, `logger.ts` |
| Classes | PascalCase | `EvaluationPersistenceService` |
| Functions | camelCase | `saveRubric`, `getCallerInfo` |
| Constants | UPPER_SNAKE_CASE | `REVIEW_STATUS`, `SESSION_STATUS` |
| Types/Interfaces | PascalCase | `Rubric`, `FinalReport` |

### Error Handling
**Pattern**: Try-catch with structured logging and user-friendly errors

```typescript
try {
  const result = await prisma.adaptiveRubric.create({ data: {...} });
  return result;
} catch (error) {
  logger.error('Error saving rubric to database:', error);
  throw new Error('Failed to save rubric');
}
```

### Async Patterns
**Prefer**: `async/await` over promise chaining

```typescript
// ✓ GOOD
async function processData() {
  const data = await fetchData();
  return await processData(data);
}

// ✗ AVOID
function processData() {
  return fetchData().then(data => processData(data));
}
```

## Architecture Patterns

### Service Layer (`src/services/`)
- Export class + singleton instance
- Encapsulate business logic and DB operations
- Use dependency injection via constructor when needed
- **Example**: `export const evaluationPersistenceService = new EvaluationPersistenceService();`

### GraphQL Resolvers (`src/graphql/resolvers/`)
- Keep resolvers thin - delegate to services
- Structure: `{ Query: {...}, Mutation: {...} }`
- Use partial update pattern (`questionPatches`, `answerPatches`) for HITL

### LangGraph Nodes (`src/langGraph/nodes/`)
- Pure functions that accept state and config
- Return partial state updates (never mutate)
- Always append to `auditTrace`
- Use `invokeWithRetry()` for LLM calls
- Validate I/O with Zod schemas

### Job Runners (`src/jobs/`)
- Implement start/wait/stop lifecycle pattern
- Embed CLI parsing with Zod
- Handle timeouts and Promise-based completion
- Support Kubernetes execution

## Database and Prisma

### Schema Management
- Schema: `prisma/schema.prisma`
- **Always** run `pnpm db:generate` after schema changes
- Use `db:migrate` for production, `db:push` for development
- **Never** edit files in `build/generated/prisma/`

### Query Patterns
- Import client from `src/config/prisma.ts`
- Use transactions for multi-table operations
- Handle null/undefined returns explicitly
- Use `select` to limit returned fields

## Anti-Patterns (THIS PROJECT)

| Forbidden | Why | Alternative |
|-----------|-----|-------------|
| `any` type | Breaks type safety | Use `unknown` or proper types |
| Promise chaining | Less readable | Use `async/await` |
| Default exports | Harder to refactor | Use named exports |
| Omitting `.ts` in imports | ESM requirement | Always include `.ts` extension |
| Editing `build/generated/prisma/` | Auto-generated code | Modify `prisma/schema.prisma` instead |
| `console.log` | No structured logging | Use `logger.info/error/debug()` |
| Direct LLM calls | No retry, no logging | Use `invokeWithRetry()` |
| Mutating state in nodes | LangGraph expects immutable | Return partial state updates |
| Full replacement in HITL | Verbose, error-prone | Use patch arrays (`questionPatches`, `answerPatches`) |

## Partial Update Pattern (HITL)

**Problem**: Users shouldn't need to copy and resubmit entire objects when reviewing rubrics or evaluations.

**Solution**: Use `questionPatches` for rubric reviews and `answerPatches` for evaluations.

### Rubric Review with Patches
```typescript
await graphExecutionService.submitRubricReview(
  sessionId,
  threadId,
  false,
  undefined,  // No full rubric replacement
  [
    { questionId: 123, weight: 0.6, title: 'Correctness - Enhanced' },
    { questionId: 124, expectedAnswer: false }
  ],
  'Adjusted based on project priorities',
  'reviewer-123'
);
```

### Human Evaluation with Patches
```typescript
await graphExecutionService.submitHumanEvaluation(
  sessionId,
  threadId,
  undefined,  // No full answers array
  [
    { questionId: 123, answer: true, explanation: 'Nearly perfect' },
    { questionId: 125, answer: false, explanation: 'Needs improvement' }
  ],
  'Minor corrections',
  'evaluator-456'
);
```

**Benefits**: Less data transfer, clearer intent, automatic merging, validation.

## Common Patterns

### Logger Usage
```typescript
import { logger } from '../utils/logger.ts';

logger.info('Processing evaluation', { sessionId });
logger.error('Failed to save rubric', error);
logger.debug('Detailed debug info');  // Only in development
```

### LLM Calls with Retry
```typescript
import { getLLM, invokeWithRetry } from '../llm/index.ts';

const llm = getLLM({ provider: 'azure', model: 'gpt-4o' });
const response = await invokeWithRetry(
  () => llm.invoke([new HumanMessage(prompt)], config),
  'azure',
  { operationName: 'RubricDrafter.invoke' }
);
```

## Important Notes

1. **ESM Only**: This project uses ES modules (`"type": "module"`)
2. **Strict TypeScript**: All strict flags enabled
3. **File Extensions**: Always include `.ts` in import paths
4. **Logger Everywhere**: Use `logger` instead of `console.log`
5. **No CI/CD**: No GitHub Actions or automated deployment (npm scripts only)
6. **Test Runner**: Scripts executed via `tsx` (not Jest/Vitest)

## When Making Changes

1. ✓ Run `pnpm lint` before committing
2. ✓ Check types: `pnpm tsc --noEmit`
3. ✓ Test affected functionality
4. ✓ Update Prisma client if schema changed: `pnpm db:generate`
5. ✓ Follow existing patterns in similar files
6. ✓ Add proper error handling and logging
7. ✓ Use explicit types for all function signatures
