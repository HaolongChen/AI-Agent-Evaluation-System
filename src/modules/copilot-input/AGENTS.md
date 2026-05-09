# copilot-input Module

## OVERVIEW

Manages evaluation datasets: Golden Sets (evaluated scenarios) and their User Inputs (individual prompts), with cross-module integration for project creation via the Zed backend.

## STRUCTURE

```
domain/
  entity/          GoldenSetEntity, UserInputEntity (extend Entity<T>)
  interface/      IGoldenSetRepository, IUserInputRepository
  schema/          Zod schemas: golden-set.schema.ts (copilotTypeEnum, filters),
                                   user-input.schema.ts
application/
  create-golden-set.ts    CreateGoldenSetUseCase
  create-user-input.ts    CreateUserInputUseCase
  get-golden-set.ts       GetGoldenSetByIdUseCase, GetGoldenSetsByFilterUseCase,
                          GetGoldenSetsByUserInputIdUseCase
  form-copilot-input.ts   FormCopilotInputUseCase (associates inputs to sets)
  project-service.ts     ProjectService (GraphQL calls to Zed backend,
                          subscription-based project creation)
infrastructure/repository/
  golden-set.repository.ts   Prisma: GoldenSet + goldenSet_userInput join table
  user-input.repository.ts  Prisma: UserInput + goldenSet_userInput join table
```

## ENTITIES

**GoldenSetEntity** — Evaluation dataset container. Identified by `schemaId` + `copilotType` (dataModelBuilder, uiBuilder, actionFlowBuilder, logAnalyzer, agentBuilder). Optional `modelName`. No direct Prisma model; maps to `prisma.goldenSet`.

**UserInputEntity** — Individual prompt within a golden set. Fields: `content` (required), `createdBy` (defaults to "unknown"). Maps to `prisma.userInput`.

**Association** — Many-to-many via `prisma.goldenSet_userInput` join table. Both repositories expose `add*Association` methods for wiring inputs to sets.

## APPLICATION USE CASES

- **CreateGoldenSetUseCase** — Creates a new golden set entity and persists it.
- **CreateUserInputUseCase** — Creates a user input entity and persists it.
- **GetGoldenSetByIdUseCase / GetGoldenSetsByFilterUseCase / GetGoldenSetsByUserInputIdUseCase** — Retrieval use cases for single, filtered, and association-based queries.
- **FormCopilotInputUseCase** — Links a user input to a golden set if not already associated (uses `getByUserInputId` + `addGoldenSetAssociation`).
- **ProjectService** — Creates/deletes projects via Zed GraphQL backend with async subscription handling (modern graphql-ws or legacy Apollo WS protocol). Depends on `ORGANIZATION_EX_ID` env var.

## REPOSITORIES

Both repositories follow `IRepository<T>` (save, findById) and add cross-cut queries:

- **GoldenSetRepository**: `getByUserInputId`, `getByFilters`, `addUserInputAssociation`, `getCopilotInputByGoldenSetIdAndUserInputId` (returns both entities from the join).
- **UserInputRepository**: `getByGoldenSetId`, `addGoldenSetAssociation`.

Use `repositoryDateMapper` from `shared/` to hydrate `createdAt`/`updatedAt`.

## CONVENTIONS

- `copilotTypeEnum` is shared across the module; import directly from `domain/schema/golden-set.schema.ts`.
- Join table writes are idempotent-safe via `upsert` where needed.
- `ProjectService` re-exports `ProjectNameDuplicateError` for use by callers.
