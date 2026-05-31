# AGENTS.md - GraphQL API Layer

> **Generated:** 2026-05-31 | **Branch:** main

Schema-first GraphQL. Apollo Server on Express. Thin resolvers delegate to DDD modules.

## Structure

| Component        | Location                          | Responsibility                           |
| ---------------- | --------------------------------- | ---------------------------------------- |
| **Schema**       | `src/graphql/type/schema.graphql` | 229 lines, all String IDs, no scalars    |
| **Resolvers**    | `src/graphql/resolvers/`          | Thin entry points -> DDD modules         |
| **Orchestrator** | `src/graphql/schema.ts`           | typeDefs from file + merged resolver map |
| **Generated**    | `src/graphql/generated/`          | Auto-generated TS types (3 targets)      |

## Resolver -> Module Map

| File                     | Primary Module | Notes                                  |
| ------------------------ | -------------- | -------------------------------------- |
| `golden-set-resolver.ts` | `dataset`      | CRUD GoldenSets, UserInputs, Projects  |
| `session-resolver.ts`    | `evaluation`   | All stubs - "not implemented"          |
| `rubric-resolver.ts`     | `rubrics`      | Also uses `copilot-session`, `dataset` |

## Codegen (3 Targets)

Run `pnpm codegen` (graphql-codegen --config codegen.ts):

1. **resolvers-types.ts** - types from local schema; `contextType: "undefined"`
2. **types.ts** - operation types from remote Functorz backend
3. **merged-schema.graphql** - local + remote schema merged

## Guidelines

- **Schema first**: Edit `type/schema.graphql`, codegen, implement resolvers.
- **Zero logic**: No Prisma/business logic in resolvers. Delegate to modules.
  - Caution: `golden-set-resolver.ts` `runCrdtTest` (line 200+) uses `pg.Client` + raw SQL.
- **Transform**: Map module outputs to GQL types.
- **HITL patches**: `questionPatches` for rubric edits, `answers` array for evaluation overrides.
