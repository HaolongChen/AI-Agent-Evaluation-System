# Services - Business Logic Layer

> **Scope:** src/services/ | **Status:** ⚠️ DEPRECATED - Only analytics-service.ts remains

## OVERVIEW

**⚠️ DEPRECATED**: All services have migrated to DDD modules in `src/modules/`. This directory contains only the legacy `analytics-service.ts`.

## CURRENT STATE

| File                              | Status        | Notes                                                               |
| --------------------------------- | ------------- | ------------------------------------------------------------------- |
| `analytics-service.ts`            | ✅ Still here | No DDD module yet for analytics. Uses direct Prisma queries.        |
| `GraphExecutionService.ts`        | ❌ Deleted    | Migrated to evaluation module                                       |
| `ExecutionService.ts`             | ❌ Deleted    | Migrated to copilot-output module                                   |
| `EvaluationPersistenceService.ts` | ❌ Deleted    | Migrated to evaluation module                                       |
| `GoldenSetService.ts`             | ❌ Deleted    | Migrated to copilot-input module                                    |
| `RubricService.ts`                | ❌ Deleted    | Migrated to rubrics module                                          |
| `ProjectService.ts`               | ❌ Deleted    | Moved to `src/modules/copilot-input/application/project-service.ts` |

## MIGRATION STATUS (COMPLETE)

- ✅ `copilot-input` module: GoldenSetService, ProjectService migrated
- ✅ `copilot-output` module: ExecutionService migrated
- ✅ `rubrics` module: RubricService migrated
- ✅ `evaluation` module: GraphExecutionService, EvaluationPersistenceService migrated
- ⏳ `analytics-service.ts` — Awaiting analytics module creation

**Only `analytics-service.ts` remains** — no module yet for analytics functionality.

## CONVENTIONS

- **DO NOT add new services here** - use DDD modules in `src/modules/`
- **Resolver Delegation**: GraphQL resolvers call module use cases, not services
- **Prisma Access**: Use `src/config/prisma.ts` singleton

## ANTI-PATTERNS

- **New services in this directory** - forbidden, use modules instead
- **Logic in GraphQL resolvers** - use module use cases
- **analytics-service.ts** uses 6 `console.error` calls and direct Prisma queries — candidate for structured logger + repository pattern

## NOTES

- New features must be built in `src/modules/` (DDD pattern)
- When analytics module is created, analytics-service.ts will migrate there
