# AGENTS.md - GraphQL API Layer

> **Generated:** 2026-05-08 | **Commit:** 5f7332f | **Branch:** main

Guidelines for schema, resolvers, and typed documents in the GraphQL API.

## Overview

Exposes the evaluation engine via Apollo Server. Orchestrates Golden Set management, HITL workflow triggers, and result analytics. Resolvers delegate to DDD modules (transitioning from legacy services).

## Structure

| Component        | Location                       | Responsibility                                         |
| ---------------- | ------------------------------ | ------------------------------------------------------ |
| **Schema**       | `src/graphql/type/TypeDefs.ts` | Single source of truth for GQL types and documentation |
| **Resolvers**    | `src/graphql/resolvers/`       | Thin entry points; delegate to DDD modules             |
| **Orchestrator** | `src/graphql/schema.ts`        | Combines typeDefs and merged resolver map              |
| **Generated**    | `src/graphql/generated/`       | Auto-generated TypeScript types from schema            |

## Resolver → Module Map

| File                   | DDD Module       | Key Operations                                            |
| ---------------------- | ---------------- | --------------------------------------------------------- |
| `GoldenSetResolver.ts` | `copilot-input`  | CRUD for Golden Sets, User Inputs, and Projects           |
| `SessionResolver.ts`   | `evaluation`     | Session queries, execution results, and audit traces      |
| `RubricResolver.ts`    | `rubrics`        | Question set generation and human evaluation submission   |
| `GraphSessionResolver` | `copilot-output` | Execution service, copilot job execution, WebSocket calls |

> **Note:** Resolvers delegate to DDD modules, not legacy services. Modules are in `src/modules/`.

## Resolver Guidelines

### Schema First

- **Update**: Modify `TypeDefs.ts` first.
- **Generate**: Run `pnpm codegen` to update `generated/resolvers-types.ts`.
- **Implement**: Update resolvers using generated types for strict safety.

### Module Delegation

- **Zero Logic**: No business logic or Prisma calls in resolvers. Delegate to modules.
- **Transform**: Map module output to GQL types (dates to strings, enums).
- **Error Handling**: Try-catch; `console.error` for internals, throw clean errors for clients.
- **Context**: Use `context` for auth and common utilities.

### Partial Updates (HITL)

- **Rubric Review**: Use `questionPatches` to modify specific criteria instead of replacing the set.
- **Evaluation**: Use `answers` array in `submitHumanEvaluation` to override agent scores.

## Adding a Query/Mutation

1. Define in `TypeDefs.ts` with docstrings.
2. Run `pnpm codegen`.
3. Implement in corresponding resolver file in `resolvers/`.
4. Delegate to the appropriate DDD module.

## Typed Documents

- Use `GoldenSetDocuments` from `src/utils/graphql-client.ts` for internal/backend requests.
- Prefer `gqlRequest()` with typed variables and response shapes.

## Migration Note

Resolvers are transitioning from legacy `src/services/` to DDD modules in `src/modules/`. New implementation must use modules.
