# Services - Business Logic Layer

> **Scope:** src/services/ | **Generated:** 2026-02-10
## OVERVIEW

Core business logic and database orchestration layer, delegating from GraphQL resolvers to Prisma DB operations.

## WHERE TO LOOK

| Service | Responsibility | Key Operations |
|:---|:---|:---|
| `GraphExecutionService.ts` | LangGraph Orchestration | HITL state, thread management, patch merging (questions/answers) |
| `ExecutionService.ts` | Job Management | Runner initialization, status tracking, log streaming |
| `EvaluationPersistenceService.ts` | Result Storage | Prisma persistence for evaluations, state snapshots, result mapping |
| `GoldenSetService.ts` | Dataset Management | CRUD for inputs/expected outputs, versioning, bulk imports |
| `RubricService.ts` | Rubric Management | Criteria definitions, scoring logic validation, patch processing |
| `AnalyticsService.ts` | Metrics & Reporting | Aggregation queries, success rate calculations, trend analysis |
| `ProjectService.ts` | Project Lifecycle | `createProject()`, `acquireProject()`, `releaseProject()`, `getProjectById()` |

## CONVENTIONS
- **Singleton Export**: Always export a class instance: `export const serviceName = new ServiceName();`.
- **Resolver Delegation**: GraphQL resolvers must call services; no direct `prisma` calls in resolvers.
- **Prisma Encapsulation**: Services are the primary owners of DB logic using `src/config/prisma.ts`.
- **Patch Logic**: Implement `questionPatches` and `answerPatches` by merging delta updates with DB state.
- **Error Handling**: Throw domain-specific Errors with clear messages for GraphQL error boundaries.
- **Strict Typing**: Return typed interfaces or Prisma models; avoid `any` or generic objects.

## ANTI-PATTERNS
- **Circular Dependencies**: Services importing each other in a loop; refactor common logic to `src/utils/`.
- **Logic Leaks**: Writing business validation or DB queries directly in GraphQL resolvers or LangGraph nodes.
- **State Mismanagement**: Modifying LangGraph state outside of `GraphExecutionService` or node functions.
- **Silencing Prisma**: Catching DB errors without logging context-specific metadata via `console`.

## ProjectService

Owns the full project creation lifecycle and lock management.

```typescript
import { projectService, ProjectNameDuplicateError } from '../services/ProjectService.ts';

// Create a new project (name check → mutation → WS subscribe → DB upsert)
// Throws ProjectNameDuplicateError if name is taken
const projectExId = await projectService.createProject('My New Project');

// Modern graphql-ws path (for future use)
const projectExId2 = await projectService.createProject('My New Project', { useModernProtocol: true });

// Acquire / release the project lock
await projectService.acquireProject(projectExId);
await projectService.releaseProject(projectExId);
```

**`createProject()` flow:**
1. Validates `ORGANIZATION_EX_ID` env var is set
2. `CheckProjectNameDuplicate` query via `backendClient` — throws `ProjectNameDuplicateError` if taken
3. `createProjectInOrganizationAsync` mutation → `taskId`
4. Subscribes to `OnProjectCreationStatusChanged(uniqueId: taskId)` via legacy Apollo WS (default) or modern graphql-ws (`useModernProtocol: true`)
5. On `COMPLETED`: upserts `project` row (`projectExId`, `name`) in DB, resolves with `projectExId`
6. On `FAILED`: rejects

**Auth:** Reads token from `authState.getToken()` — call `authState.setToken()` before invoking.

`ProjectNameDuplicateError` is re-exported from this module for callers.
