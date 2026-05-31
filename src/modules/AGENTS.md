# DDD Modules Directory

## MODULE MAP

| Module            | Domain                    | Entities                                        |
| ----------------- | ------------------------- | ----------------------------------------------- |
| `account`         | Functorz Auth             | AccountEntity (login, token, GQL/WS clients)    |
| `dataset`         | Golden Sets & User Inputs | GoldenSetEntity, UserInputEntity, ProjectEntity |
| `copilot-session` | Copilot Job Execution     | CopilotJobEntity, CopilotOutputEntity           |
| `evaluation`      | Sessions & Results        | SessionEntity, RecordEntity, ResultEntity       |
| `rubrics`         | Evaluation Criteria       | RubricEntity, EntryEntity, AgentFeedbackEntity  |
| `shared`          | DDD Foundations           | Entity, AggregateRoot, IRepository, ValueObject |

Module AGENTS.md files use domain names (`copilot-input`, `copilot-output`) that map to on-disk dirs: `copilot-input` → `dataset/`, `copilot-output` → `copilot-session/`. Use disk dirs for code navigation.

## LAYERS

3 layers per module: `domain/` (entities, interfaces, services), `application/` (use cases), `infrastructure/repository/` (Prisma repos). Deps flow: application → domain ← infrastructure.

## SHARED

`shared/domain/` provides `Entity<T, M>`, `AggregateRoot<T, M>`, `IRepository<T>`, `ValueObject<T>`, `repositoryDateMapper()`. All entities extend `Entity<T, M>`. Use `getData()` for typed projections.

## CROSS-MODULE DEPENDENCIES

- `account` → `shared` (uses NetworkClient, GQLClient from shared/application)
- `copilot-session` → `dataset` (via `IProjectLifecycle` interface + `ProjectLifecycleAdapter`, and `IGoldenSetRepository` in `execution-service.ts`)
- `copilot-session` → `account` (uses Account for WebSocket auth)
- `evaluation` domain → `copilot-session` domain, `rubrics` domain (direct imports, cross-module coupling)
- `rubrics` is independent, consumed by GraphQL resolvers
- Do NOT create circular dependencies between modules

## MODULE STATUS

- **`evaluation`**: domain layer complete (entities, aggregates, schemas). `application/` use cases are empty stubs. `infrastructure/` has only `session.repository.ts`. All 3 GraphQL resolver methods (`getEvaluationSessionById`, `getEvaluationSessions`, `submitHumanEvaluation`) throw `Error("Method not implemented.")`.
- **Cross-layer violations**: `prompts.service.ts` domain→app, `feedback.service.ts` domain→infra, `entity.ts` domain→infra.
- **No barrel exports**: No module has an `index.ts`. Imports reference internal files directly.
- **DI pattern**: Manual factory bundles in `src/DI/`, no DI container.

## CONVENTIONS

- Entities extend `Entity<T, M>` (default `EntityMetadata`), aggregates extend `AggregateRoot<T, M>`. Use `getData()` for typed projections.
- `.ts` extensions in imports (ESM + nodenext). Schema files = single source of truth.
- No business logic in resolvers; delegate to module application services.
- Domain services stay in `domain/service/`.
