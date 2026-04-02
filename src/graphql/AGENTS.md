# AGENTS.md - GraphQL API Layer

> **Generated:** 2026-04-02 | **Commit:** [current] | **Branch:** main

Guidelines for managing schema, resolvers, and typed documents in the GraphQL API.

## Overview
Exposes the evaluation engine via Apollo Server. Orchestrates Golden Set management, HITL workflow triggers, and result analytics. Resolvers act as a thin delegation layer to services.

## Structure

| Component | Location | Responsibility |
|-----------|----------|----------------|
| **Schema** | `src/graphql/type/TypeDefs.ts` | Single source of truth for GQL types and documentation |
| **Resolvers** | `src/graphql/resolvers/` | Thin entry points; delegate to `src/services/` |
| **Orchestrator**| `src/graphql/schema.ts` | Combines typeDefs and merged resolver map |
| **Generated** | `src/graphql/generated/` | Auto-generated TypeScript types from schema |

## Resolver Map

| File | Primary Service | Key Operations |
|------|-----------------|----------------|
| `GoldenSetResolver.ts` | `goldenSetService` | CRUD for Golden Sets, User Inputs, and Projects |
| `SessionResolver.ts` | `executionService` | Session queries, execution results, and audit traces |
| `RubricResolver.ts` | `rubricService` | Question set generation and human evaluation submission |

## Development Patterns

### Schema First
- **Update**: Modify `TypeDefs.ts` first.
- **Generate**: Run `pnpm db:generate` (or equivalent GQL codegen) to update `generated/resolvers-types.ts`.
- **Implement**: Update resolvers using generated types for strict safety.

### Resolver Guidelines
- **Zero Logic**: No business logic or Prisma calls in resolvers. Use Services.
- **Transformation**: Map Prisma models to GQL types (e.g., date to string, enum conversion).
- **Error Handling**: Wrap in try-catch; use `logger.error` for internals, throw clean errors for clients.
- **Context**: Use the `context` argument for authentication and common utilities.

### Partial Updates (HITL)
- **Rubric Review**: Use `questionPatches` to modify specific criteria instead of replacing the set.
- **Evaluation**: Use `answers` array in `submitHumanEvaluation` to override agent scores.

## Common Operations

### Adding a Query/Mutation
1. Define in `TypeDefs.ts` with comprehensive docstrings.
2. Run type generation.
3. Implement in corresponding file in `resolvers/`.
4. Ensure service layer handles the actual data work.

### Typed Documents
- Use `GoldenSetDocuments` from `src/utils/graphql-client.ts` for internal/backend requests.
- Always prefer `gqlRequest()` with typed variables and response shapes.
