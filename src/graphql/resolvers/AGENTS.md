# AGENTS.md - GraphQL Resolvers

> **Scope:** src/graphql/resolvers/ | **Generated:** 2026-05-26 | **Status:** UPDATED

Guidelines for managing the GraphQL API layer in this repository.

## OVERVIEW

Thin resolver layer that delegates to **DDD module use cases** (NOT legacy services). Ensures consistent error handling and data transformation.

## WHERE TO LOOK

| File                     | Responsibility                             | Module Use Case                         |
| ------------------------ | ------------------------------------------ | --------------------------------------- |
| `golden-set-resolver.ts` | Golden Set CRUD and input management       | `copilot-input` module use cases        |
| `session-resolver.ts`    | Session queries and shared transformations | `evaluation` module (pending migration) |
| `rubric-resolver.ts`     | Rubric management and review status        | `rubrics` module use cases              |

> **Note:** AnalyticResolver and GraphSessionResolver do not exist - resolvers migrated to DDD modules.

## CONVENTIONS

### Structure & Pattern

- **Standard Layout**: Export an object with `{ Query: {...}, Mutation: {...} }`.
- **Thin Logic**: Resolvers must only handle argument parsing and use case delegation.
- **Module Delegation**: Import use cases from `src/modules/<module>/application/` - NOT from `src/services/`.
- **Data Transformation**: Use `transformX` or `mapX` functions to convert module outputs to GraphQL schema shapes.
- **Repository Injection**: Use `repository` from `src/DI/repository.ts` to get module repositories.

### Error Handling

- **Consistent Wrapper**: Always use `try-catch` blocks for all resolver functions.
- **Logging**: Log detailed errors via `console.error('context message', error)`.
- **User Errors**: Throw `GraphQLError` for user-facing errors.

### HITL Partial Updates (Patches)

- **Problem**: Avoid resubmitting large objects (entire rubrics or evaluations).
- **Solution**: Use patch arrays for Human-in-the-Loop mutations.
- **`questionPatches`**: Modify specific rubric criteria without replacing the entire set.
- **`answerPatches`**: Override specific agent scores via `submitHumanEvaluation`.
- **Validation**: Module use cases merge patches with existing state before persistence.

## KNOWN VIOLATIONS

- `golden-set-resolver.ts` `runCrdtTest` (lines 203-217): Direct `pg.Client` + raw SQL query bypasses module layer. Connects to production DB via `DATABASE_URL_PRODUCTION` env var directly. Should delegate to use case.

## SIGNIFICANT CHANGES

- `createProject` mutation signature changed (post 2026-05-22): from `(number: Int!): String!` to `(projectName: String): GoldenSet!`. Now creates a `GoldenSetEntity` via `CreateGoldenSetUseCase` after project initialization.
- `UserInput` type: `createdBy` field removed from schema.
