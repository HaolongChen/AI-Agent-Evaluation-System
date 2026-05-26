# AGENTS.md - GraphQL API Layer

> **Generated:** 2026-05-26 | **Commit:** c3231fd8 | **Branch:** main

Guidelines for schema, resolvers, and typed documents in the GraphQL API.

## Overview

Exposes the evaluation engine via Apollo Server on Express. Orchestrates Golden Set management, HITL workflow triggers, and result analytics. Resolvers delegate to DDD modules.

## Structure

| Component        | Location                          | Responsibility                                               |
| ---------------- | --------------------------------- | ------------------------------------------------------------ |
| **Schema**       | `src/graphql/type/schema.graphql` | Single source of truth for GQL types and documentation       |
| **Resolvers**    | `src/graphql/resolvers/`          | Thin entry points; delegate to DDD modules                   |
| **Orchestrator** | `src/graphql/schema.ts`           | Combines typeDefs (loaded from file) and merged resolver map |
| **Generated**    | `src/graphql/generated/`          | Auto-generated TypeScript types from schema                  |

## Resolver → Module Map

| File                     | DDD Module      | Key Operations                                          |
| ------------------------ | --------------- | ------------------------------------------------------- |
| `golden-set-resolver.ts` | `copilot-input` | CRUD for Golden Sets, User Inputs, and Projects         |
| `session-resolver.ts`    | `evaluation`    | Session queries, execution results, and audit traces    |
| `rubric-resolver.ts`     | `rubrics`       | Question set generation and human evaluation submission |

> **Note:** GraphSessionResolver does not exist - execution now in copilot-output module.
> **Note:** Resolvers delegate to DDD modules, not legacy services.

## Resolver Guidelines

### Schema First

- **Update**: Modify `type/schema.graphql` first.
- **Generate**: Run `pnpm codegen` to update `generated/types.ts`.
- **Implement**: Update resolvers using generated types for strict safety.

### Module Delegation

- **Zero Logic**: No business logic or Prisma calls in resolvers. Delegate to modules.
  - ⚠️ Known violation: `golden-set-resolver.ts` `runCrdtTest` (lines 203-217) uses direct `pg.Client` + raw SQL, bypassing module layer entirely.
- **Transform**: Map module output to GQL types (dates to strings, enums).
- **Error Handling**: Try-catch; `console.error` for internals, throw clean errors for clients.
- **Context**: Use `context` for auth and common utilities.

### Partial Updates (HITL)

- **Rubric Review**: Use `questionPatches` to modify specific criteria instead of replacing the set.
- **Evaluation**: Use `answers` array in `submitHumanEvaluation` to override agent scores.

## Adding a Query/Mutation

1. Define in `type/schema.graphql` with docstrings.
2. Run `pnpm codegen`.
3. Implement in corresponding resolver file in `resolvers/`.
4. Delegate to the appropriate DDD module.

## Typed Documents

- Use `GoldenSetDocuments` from `src/modules/shared/application/graphql-client.ts` for internal/backend requests.
- Prefer `gqlRequest()` with typed variables and response shapes.

## Migration Note

Resolvers are transitioning from legacy `src/services/` to DDD modules in `src/modules/`. New implementations must use DDD modules. Do not import from `src/services/` (only `analytics-service.ts` remains).
