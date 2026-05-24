# DDD Modules Directory

## OVERVIEW

Vertical DDD slices for domain logic. Each module owns its entities, application services, and Prisma-based repositories.

## MODULE MAP

| Module           | Domain                    | Entities                                              |
| ---------------- | ------------------------- | ----------------------------------------------------- |
| `account`        | Functorz Auth             | AccountEntity (login, token, GQL/WS clients)          |
| `copilot-input`  | Golden Sets & User Inputs | GoldenSetEntity, UserInputEntity, ProjectEntity       |
| `copilot-output` | Copilot Job Execution     | CopilotJobEntity, CopilotOutputEntity                 |
| `evaluation`     | Sessions & Results        | SessionEntity, RecordEntity, ResultEntity             |
| `rubrics`        | Evaluation Criteria       | RubricEntity, EntryEntity, AgentFeedbackEntity        |
| `shared`         | DDD Foundations           | Entity base, AggregateRoot, IRepository, ValueObjects |

## LAYER CONVENTION

Every module has 3 layers:

- `domain/` = entities, interfaces, schemas, domain services
- `application/` = use cases, orchestration, message handlers
- `infrastructure/repository/` = Prisma-backed repository implementations

Dependencies flow: application → domain ← infrastructure. Never reverse.

## SHARED MODULE

`shared/domain/` provides:

- `Entity<T, M>` base class: UUID generation, createdAt/updatedAt tracking, Zod schema validation, metadata management
- `AggregateRoot<T, M>`: wraps Entity for consistency boundaries, dynamic child entity management
- `IRepository<T>`: generic repository contract (`save`, `findById`)
- `ValueObject<T>`: immutable domain concepts
- `repositoryDateMapper()`: hydrates timestamps from DB records

All module entities extend `Entity<T, M>` (defaulting to `EntityMetadata`). Use `getData()` to retrieve typed projections. All module repositories implement `IRepository<T>`.

## CROSS-MODULE DEPENDENCIES

- `account` → `shared` (uses NetworkClient, GQLClient from shared/application)
- `copilot-output` → `copilot-input` (via `IProjectLifecycle` interface + `ProjectLifecycleAdapter`, and `IGoldenSetRepository` — see `execution-service.ts`)
- `copilot-output` → `account` (uses Account for WebSocket auth)
- `evaluation`, `rubrics` are independent, consumed by GraphQL resolvers
- Do NOT create circular dependencies between modules

## MODULE STATUS

- **`evaluation`**: domain layer complete (entities, aggregates, schemas). `application/` and `infrastructure/` layers are pending implementation. Post 2026-05-22 refactoring: `BaseSessionAggregateRoot` and `BaseSessionEntity` updated with `getData()` method pattern and Entity clone support.
- **`evaluation` GraphQL resolvers**: All 5 resolver methods (`getEvaluationSessionById`, `getEvaluationSessions`, `getEvaluationResultById`, `getEvaluationResults`, `submitHumanEvaluation`) throw `new Error("Method not implemented.")`. Module unusable via API.

## CONVENTIONS

- All entities extend `Entity<T, M>` from `shared/` (second generic param for `EntityMetadata`)
- All aggregates extend `AggregateRoot<T, M>` from `shared/`
- Use `.ts` extensions in imports (ESM + nodenext resolution)
- Schema files are the single source of truth for entity shape
- Domain services stay in `domain/service/` (no business logic in resolvers)
- Resolvers in `src/graphql/resolvers/` delegate to module application services
- Entities use `getData()` method (not direct `.data` property access) to retrieve typed data projections
