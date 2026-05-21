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

- `Entity<T>` base class: UUID generation, createdAt/updatedAt tracking, Zod schema validation
- `AggregateRoot<T>`: wraps Entity for consistency boundaries
- `IRepository<T>`: generic repository contract (save, findById)
- `ValueObject<T>`: immutable domain concepts
- `repositoryDateMapper()`: hydrates timestamps from DB records

All module entities extend `Entity<T>`. All module repositories implement `IRepository<T>`.

## CROSS-MODULE DEPENDENCIES

- `account` → `shared` (uses NetworkClient, GQLClient from shared/application)
- `copilot-output` → `copilot-input` (uses GoldenSetEntity to create projects and run jobs)
- `copilot-output` → `account` (uses Account for WebSocket auth)
- `evaluation`, `rubrics` are independent, consumed by GraphQL resolvers
- Do NOT create circular dependencies between modules

## ADDING A NEW MODULE

1. Create `src/modules/<name>/domain/`, `application/`, `infrastructure/repository/`
2. Define Zod schema in `domain/schema/`
3. Extend `Entity<T>` in `domain/entity/`
4. Define `IRepository<T>` interface in `domain/interface/`
5. Implement repository in `infrastructure/repository/`
6. Add application use cases in `application/`
7. Import shared modules only (no cross-module imports without justification)

## CONVENTIONS

- All entities extend `Entity<T>` from `shared/`
- Use `.ts` extensions in imports (ESM + nodenext resolution)
- Schema files are the single source of truth for entity shape
- Domain services stay in `domain/service/` (no business logic in resolvers)
- Resolvers in `src/graphql/resolvers/` delegate to module application services
