# dataset/ (domain: copilot-input)

Manages evaluation datasets: Golden Sets, User Inputs, CopilotServer endpoints, and the CopilotInput join aggregate.

## LAYOUT

```
domain/
  entity/          GoldenSetEntity, UserInputEntity, CopilotInputEntity (id-only),
                   CopilotServerEntity (wsEndpoint, gqlEndpoint, name)
  interface/       IGoldenSetRepository, IUserInputRepository, ICopilotInputRepository,
                   ICopilotServerRepository
  schema/          Zod: golden-set.schema.ts (schemaId, copilotTypeEnum),
                   user-input.schema.ts (content, createdBy),
                   copilot-input.schema.ts (empty), copilot-server.schema.ts
  service/         AcquireCopilotServer, generateProjectName (not empty)
  aggregate/       CopilotInputAggregate (wraps GoldenSet + UserInput)
application/
  create-golden-set.ts     CreateGoldenSetUseCase (schemaId → persist)
  create-user-input.ts     CreateUserInputUseCase (content → persist, tracks createdBy)
  copilot-input.ts         BuildCopilotInputUseCase (links inputs to sets via aggregate)
  copilot-server.ts        GetCopilotServerUseCase (acquires server, updates Account endpoints)
infrastructure/
  repository/
    golden-set.repository.ts     Prisma: goldenSet model (findById, findBySchemaId)
    user-input.repository.ts     Prisma: userInput model (findById, getAll)
    copilot-input.repository.ts  Prisma: copilotInput join table (upsert, getByFilters)
    copilot-server.repository.ts Mock: CopilotServerEntity from env (mockCopilotServerEntity)
```

## KEY ENTITIES

- **GoldenSetEntity**: Evaluation container. Keyed by `schemaId`. Maps to `prisma.goldenSet`.
- **UserInputEntity**: Individual prompt. Fields: `content` (req), `createdBy` (default "unknown").
- **CopilotServerEntity**: Backend connection endpoints (`wsEndpoint`, `gqlEndpoint`, `name`). Mocked from env at startup.
- **CopilotInputAggregate**: Aggregate root wrapping GoldenSetEntity + UserInputEntity. Persisted via `prisma.copilotInput` join table.

## APPLICATION

- **BuildCopilotInputUseCase**: Overloaded — accepts entities or IDs. Builds CopilotInputAggregate for each UserInput, persists via copilotInputRepository. uses `goldenSetId_userInputId` unique constraint.
- **GetCopilotServerUseCase**: Calls AcquireCopilotServer domain service. Updates AccountService WS/GQL endpoints.
- **CreateGoldenSetUseCase / CreateUserInputUseCase**: Simple create+persist.

## REPOSITORIES

All follow `IRepository<T>` (save, findById):

- **GoldenSetRepository**: `findBySchemaId`. Simplified — no old association methods.
- **UserInputRepository**: `getAll`. Association methods removed (handled via copilotInput).
- **CopilotInputRepository**: `getByFilters` (overloaded, single or list), `addUserInput` (upsert join records).
- **CopilotServerRepository**: `getDefault` returns mock from env. In-memory.

Use `repositoryDateMapper` from `shared/` for createdAt/updatedAt hydration.

## CROSS-MODULE

- `copilot-session` consumes `IGoldenSetRepository` + `ICopilotServerRepository` from this module.
- Project lifecycle (`IProjectRepository`, `IProjectLifecycle`) moved to `copilot-session` module — not here.

## CONVENTIONS

- `copilotTypeEnum` from `domain/schema/golden-set.schema.ts`.
- Join table writes via `prisma.copilotInput.upsert` (idempotent).
- `CopilotServerEntity` is mocked at DI time, not fetched from DB.
- Retrieval use cases removed — resolvers call repositories directly via DI bundle.
