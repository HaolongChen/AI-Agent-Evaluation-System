# copilot-input Module

## OVERVIEW

Manages evaluation datasets: Golden Sets (evaluated scenarios), User Inputs (individual prompts), Projects (via Zed backend), and CRDT schema management.

## STRUCTURE

```
domain/
  entity/          GoldenSetEntity, UserInputEntity, ProjectEntity (extend Entity<T>)
  interface/      IGoldenSetRepository, IUserInputRepository, IProjectRepository
  schema/          Zod schemas: golden-set.schema.ts (copilotTypeEnum, filters),
                   user-input.schema.ts, project.schema.ts
  service/         Empty directory (placeholder)
application/
  create-golden-set.ts    CreateGoldenSetUseCase
  create-user-input.ts    CreateUserInputUseCase
  get-golden-set.ts       GetGoldenSetByIdUseCase, GetGoldenSetsByFilterUseCase,
                          GetGoldenSetsByUserInputIdUseCase
  get-schema-id.ts        GetSchemaIdUseCase
  get-user-input.ts       GetUserInputUseCase
  form-copilot-input.ts   FormCopilotInputUseCase (associates inputs to sets)
  project-service.ts      ProjectService (GraphQL calls to Zed backend,
                          subscription-based project creation)
infrastructure/
  crdt-schema-manager.ts   CRDT schema lifecycle (fetch, save, diff)
  project-manager.ts       Project lifecycle (create, delete via Zed)
  repository/
    golden-set.repository.ts   Prisma: GoldenSet + goldenSet_userInput join table
    user-input.repository.ts   Prisma: UserInput + goldenSet_userInput join table
    project.repository.ts      Prisma-backed IProjectRepository
```

## ENTITIES

**GoldenSetEntity** — Evaluation dataset container. Identified by `schemaId` + `copilotType` (dataModelBuilder, uiBuilder, actionFlowBuilder, logAnalyzer, agentBuilder). Optional `modelName`. No direct Prisma model; maps to `prisma.goldenSet`.

**UserInputEntity** — Individual prompt within a golden set. Fields: `content` (required), `createdBy` (defaults to "unknown"). Maps to `prisma.userInput`.

**ProjectEntity** — Zed backend project representation. Tracks project metadata for copilot execution.

**Association** — Many-to-many via `prisma.goldenSet_userInput` join table. Both repositories expose `add*Association` methods for wiring inputs to sets.

## APPLICATION USE CASES

- **CreateGoldenSetUseCase** — Creates a new golden set entity and persists it.
- **CreateUserInputUseCase** — Creates a user input entity and persists it.
- **GetGoldenSetByIdUseCase / GetGoldenSetsByFilterUseCase / GetGoldenSetsByUserInputIdUseCase** — Retrieval use cases for single, filtered, and association-based queries.
- **GetSchemaIdUseCase** — Retrieves schema ID for a golden set.
- **GetUserInputUseCase** — Retrieves user input by ID.
- **FormCopilotInputUseCase** — Links a user input to a golden set if not already associated (uses `getByUserInputId` + `addGoldenSetAssociation`).
- **ProjectService** — Creates/deletes projects via Zed GraphQL backend with async subscription handling (modern graphql-ws or legacy Apollo WS protocol). Depends on `ORGANIZATION_EX_ID` env var.

## INFRASTRUCTURE

**CrdtSchemaManager** — Manages CRDT schema lifecycle: fetches binary schema from backend, saves as JSON to `local_shell/`, computes schema diffs.

**ProjectManager** — Project lifecycle management: creates projects via Zed, deletes temp projects after evaluation runs.

## REPOSITORIES

Both repositories follow `IRepository<T>` (save, findById) and add cross-cutting queries:

- **GoldenSetRepository**: `getByUserInputId`, `getByFilters`, `addUserInputAssociation`, `getCopilotInputByGoldenSetIdAndUserInputId` (returns both entities from the join).
- **UserInputRepository**: `getByGoldenSetId`, `addGoldenSetAssociation`.
- **ProjectRepository**: Prisma-backed project persistence.

Use `repositoryDateMapper` from `shared/` to hydrate `createdAt`/`updatedAt`.

## CONVENTIONS

- `copilotTypeEnum` is shared across the module; import directly from `domain/schema/golden-set.schema.ts`.
- Join table writes are idempotent-safe via `upsert` where needed.
- `ProjectService` re-exports `ProjectNameDuplicateError` for use by callers.
- CRDT schema files saved to `local_shell/` at runtime (not source code).
