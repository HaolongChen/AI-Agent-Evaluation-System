# Services - Business Logic Layer

> **Scope:** `src/services/` | **Status:** ⚠️ DEPRECATED  
> **Last verified:** 2026-05-22

## OVERVIEW

**⚠️ DEPRECATED**: All services have migrated to DDD modules in `src/modules/`. Only `analytics-service.ts` remains.

## CURRENT STATE

| File                              | Status     | Notes                                                               |
| --------------------------------- | ---------- | ------------------------------------------------------------------- |
| `analytics-service.ts`            | ✅ Present | No DDD module yet. Uses direct Prisma queries.                      |
| All others                        | ❌ Deleted | Migrated to `src/modules/` DDD modules                              |

## MIGRATION STATUS

- ✅ `copilot-input` module: GoldenSetService, ProjectService migrated
- ✅ `copilot-output` module: ExecutionService migrated
- ✅ `rubrics` module: RubricService migrated
- ✅ `evaluation` module: GraphExecutionService, EvaluationPersistenceService migrated
- ⏳ `analytics-service.ts` — Awaiting analytics module creation

## CONVENTIONS

- **No new services here** — use DDD modules in `src/modules/`
- **Resolvers** delegate to module use cases, not services
- **Prisma access** via `src/config/prisma.ts` singleton

## ANTI-PATTERNS

- `analytics-service.ts` uses 6 `console.error` calls and direct Prisma queries — candidate for structured logger + repository pattern

## NOTES

- New features must be built in `src/modules/` (DDD pattern)
- When analytics module is created, analytics-service.ts will migrate there
