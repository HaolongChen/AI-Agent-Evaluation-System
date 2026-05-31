# AGENTS.md - GraphQL Resolvers

> **Scope:** src/graphql/resolvers/ | **Generated:** 2026-05-31

Thin resolver layer delegating to DDD module use cases. Not legacy services.

## Files

| File                     | Primary Module | Notes                                  |
| ------------------------ | -------------- | -------------------------------------- |
| `golden-set-resolver.ts` | `dataset`      | + GQL_FIX from `copilot-session`       |
| `session-resolver.ts`    | `evaluation`   | All stubs - "not implemented"          |
| `rubric-resolver.ts`     | `rubrics`      | Also uses `copilot-session`, `dataset` |

> AnalyticResolver and GraphSessionResolver removed - migrated to DDD modules.

## Conventions

- **Standard export**: `{ Query: {...}, Mutation: {...} }`.
- **Thin logic**: Parse args, delegate to use case, return.
- **Module imports**: From `src/modules/<module>/application/`. Not `src/services/`.
- **Data transform**: Use `transformX`/`mapX` to convert module -> GQL shapes.
- **Repository injection**: Singleton from `src/DI/repository.ts`.
- **Zion injection**: Async bundle for Functorz backend access.
- **Error handling**: `try-catch` wrapper. `console.error` logs, `GraphQLError` for users.

## HITL Partial Updates

- **`questionPatches`**: Modify specific rubric criteria without full replacement.
- **`answers` array**: Override specific agent scores in `submitHumanEvaluation`.
- Module use cases merge patches with existing state before persist.

## Known Violations

- `golden-set-resolver.ts` `runCrdtTest` (line 200+): `pg.Client` + raw SQL via `DATABASE_URL_PRODUCTION`. Bypasses module layer entirely.
- `context` is available in resolver signatures but codegen sets `contextType: "undefined"`.

## Signature Changes

- `createProject` (post 2026-05-22): from `(number: Int!): String!` to `(projectName: String): GoldenSet!`. Creates `GoldenSetEntity` via `CreateGoldenSetUseCase`.
- `UserInput.createdBy` removed from schema.
