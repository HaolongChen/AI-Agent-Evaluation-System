# Utilities Layer

> **Scope:** src/utils/

Shared utilities and cross-cutting concerns used across all layers.

## OVERVIEW

Pure functions, logger, GraphQL builders, type definitions, and Zed CRDT helpers.

## WHERE TO LOOK

| File | Purpose | Used By |
|------|---------|---------|
| `logger.ts` | Structured logging (file + console) | All modules |
| `types.ts` | Shared TypeScript types | Services, resolvers, jobs |
| `graphql-builder.ts` | GraphQL query/mutation builder | Tests, job runners |
| `zed/index.ts` | Zed CRDT helper utilities (10k+ lines) | Job runners, services |
| `zed/TypeSystemStore.ts` | Type system store for Zed | Job runners |
| `CRDTUtils.ts` | CRDT manipulation helpers | Job runners |

## CONVENTIONS

- **Logger**: Import from `./logger.ts`, use `logger.info/error/debug()` with structured metadata
- **Never** `console.log` — always use logger
- **Pure functions**: Utilities should be stateless (except logger file I/O)
- **Zed utilities**: Heavy dependency on `@functorz/ztype` and `@functorz/crdt-helper`

## PATTERNS

### Logger Usage
```typescript
import { logger } from '../utils/logger.ts';

logger.info('Processing evaluation', { sessionId, goldenSetId });
logger.error('Failed operation', error);
logger.debug('Detailed trace'); // Only in dev
```

### GraphQL Builder
```typescript
import { buildMutation } from '../utils/graphql-builder.ts';

const mutation = buildMutation('runEvaluation', {
  goldenSetId: 1,
  skipHumanReview: true
});
```

## NOTES

- `zed/index.ts` is 10,560 lines (largest file in repo) — contains extensive Zed CRDT operations
- Logger writes to `logs.txt` and console; structured JSON format
- Type definitions in `types.ts` bridge GraphQL, Prisma, and domain models
- GraphQL builder has TODO for mutation part enhancement
