# Services - Business Logic Layer

> **Scope:** src/services/ | **Status:** MIGRATING TO DDD MODULES

## OVERVIEW

**⚠️ DEPRECATED**: This layer is being migrated to DDD modules in `src/modules/`. Prefer modules for new work.

Legacy business logic and database orchestration layer. GraphQL resolvers delegate here (in transition to modules).

## WHERE TO LOOK (LEGACY)

| Service | Responsibility | Migration Status |
| :------ | :------------ | :--------------- |
| `GraphExecutionService.ts` | HITL state, thread management | ⏳ Migrating to evaluation module |
| `ExecutionService.ts` | Job management, runner init | ✅ Moved to copilot-output module |
| `EvaluationPersistenceService.ts` | Result storage | ⏳ Migrating to evaluation module |
| `GoldenSetService.ts` | Dataset CRUD | ✅ Moved to copilot-input module |
| `RubricService.ts` | Rubric management | ✅ Moved to rubrics module |
| `AnalyticsService.ts` | Metrics & reporting | Still in services (no module yet) |
| `ProjectService.ts` | Project lifecycle | ✅ Moved to copilot-input module |

## MIGRATION STATUS

- ✅ `copilot-input` module: GoldenSetService, ProjectService migrated
- ✅ `copilot-output` module: ExecutionService migrated
- ✅ `rubrics` module: RubricService migrated
- ⏳ `evaluation` module: GraphExecutionService, EvaluationPersistenceService pending
- ❌ AnalyticsService: No module yet, stays in services

## CONVENTIONS

- **Singleton Export**: `export const serviceName = new ServiceName();`
- **Resolver Delegation**: GraphQL resolvers call services (transitioning to modules)
- **Prisma Encapsulation**: Services own DB logic via `src/config/prisma.ts`
- **Patch Logic**: `questionPatches` and `answerPatches` merge delta updates

## ANTI-PATTERNS

- **Circular Dependencies**: Services importing each other in a loop
- **Logic Leaks**: Writing business logic in GraphQL resolvers (use services or modules)
- **State Mismanagement**: Modifying state outside of GraphExecutionService

## NOTES

- Cross-module communication via interface dependencies
- New features should be built in `src/modules/` (DDD pattern)
- Services serve as transitional layer until migration complete