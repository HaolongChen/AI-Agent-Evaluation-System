# AGENTS.md - GraphQL Resolvers

> **Scope:** src/graphql/resolvers/ | **Generated:** 2026-02-10

Guidelines for managing the GraphQL API layer in this repository.

## OVERVIEW

Thin resolver layer that delegates business logic to services while ensuring consistent error handling and data transformation.

## WHERE TO LOOK

| File                      | Responsibility                               | Service Delegate        |
| ------------------------- | -------------------------------------------- | ----------------------- |
| `AnalyticResolver.ts`     | Evaluation results and comparative analytics | `analyticsService`      |
| `GoldenSetResolver.ts`    | Golden Set CRUD and input management         | `goldenSetService`      |
| `GraphSessionResolver.ts` | HITL workflow state and mutation patches     | `graphExecutionService` |
| `RubricResolver.ts`       | Rubric management and review status          | `rubricService`         |
| `SessionResolver.ts`      | Session queries and shared transformations   | `executionService`      |

## CONVENTIONS

### Structure & Pattern

- **Standard Layout**: Export an object with `{ Query: {...}, Mutation: {...} }`.
- **Thin Logic**: Resolvers must only handle argument parsing and service delegation.
- **Service Delegation**: Use imported singleton services for all business and DB operations.
- **Data Transformation**: Use `transformX` or `mapX` functions to convert Prisma models/Service outputs to GraphQL schema shapes.

### Error Handling

- **Consistent Wrapper**: Always use `try-catch` blocks for all resolver functions.
- **Logging**: Log detailed errors via `console.error('context message', error)`.
- **User Errors**: Throw generic user-friendly `Error('Public message')` to the client.

### HITL Partial Updates (Patches)

- **Problem**: Avoid resubmitting large objects (entire rubrics or evaluations).
- **Solution**: Use patch arrays for Human-in-the-Loop mutations.
- **`questionPatches`**: Used in `submitRubricReview` to modify specific criteria (title, weight, etc.).
- **`answerPatches`**: Used in `submitHumanEvaluation` to override specific agent scores or explanations.
- **Validation**: Service layer merges patches with existing state before persistence.
