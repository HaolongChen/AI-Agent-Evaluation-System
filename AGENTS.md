# PROJECT KNOWLEDGE BASE (AI Agent Evaluation System)

**Generated:** 2026-04-02 | **Commit:** 8a9944d | **Branch:** main

## OVERVIEW
An end-to-end evaluation framework for Copilot-style agents orchestrating HITL workflows with LangGraph, PostgreSQL (Prisma), and GraphQL.

## STRUCTURE
```
AI-Agent-Evaluation-System/
├── src/
│   ├── index.ts              # Express + ApolloServer entry
│   ├── langGraph/            # LangGraph HITL workflow (see langGraph/AGENTS.md)
│   ├── services/             # Business logic, DB ops (see services/AGENTS.md)
│   ├── jobs/                 # CLI job runners (see jobs/AGENTS.md)
│   ├── graphql/              # GraphQL API layer (see graphql/resolvers/AGENTS.md)
│   ├── utils/                # Pure utilities, logger (see utils/AGENTS.md)
│   ├── config/               # Environment, constants, prisma
│   └── deep-agents/          # Local deep-agent implementation
├── tests/                    # Script-based tests (tsx execution)
├── prisma/                   # Schema + migrations
└── scripts/                  # DB setup/seed utilities
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Add evaluation workflow node | `src/langGraph/nodes/` | Pure functions, return partial state |
| Add GraphQL mutation/query | `src/graphql/resolvers/` | Thin resolvers → delegate to services |
| Add business logic | `src/services/` | Singleton pattern, handles DB operations |
| Modify evaluation state | `src/langGraph/state/state.ts` | Uses LangGraph Annotation system |
| Add CLI job runner | `src/jobs/` | Embedded CLI parsing, start/wait/stop pattern |
| Change database schema | `prisma/schema.prisma` | Run `pnpm db:generate` after |
| Add utility function | `src/utils/` | Pure functions, no side effects |
| Configure LLM providers | `src/langGraph/llm/` | Azure OpenAI, Gemini support |
| Make Functorz backend GQL request | `src/utils/graphql-client.ts` | Use `gqlRequest()` + `backendClient` |
| Add tests | `tests/` | Script-based, use tsx (not Jest/Vitest) |

## CONVENTIONS
- **ESM Only**: Use `"type": "module"`. ALWAYS include `.ts` in import paths.
- **Strict TypeScript**: All strict flags enabled. Explicit types for all signatures.
- **Naming**: PascalCase for classes/types, camelCase for functions/files (utils), UPPER_SNAKE_CASE for constants.
- **Partial Updates**: Use `questionPatches`/`answerPatches` for HITL instead of full replacement.
- **Logger**: Use `logger` instead of `console.log` for structured logging.

## ANTI-PATTERNS (THIS PROJECT)
- **`any` type**: Forbidden. Use `unknown` or proper types.
- **Promise chaining**: Forbidden. Use `async/await`.
- **Default exports**: Forbidden. Use named exports only.
- **Direct LLM calls**: Forbidden. Use `invokeWithRetry()`.
- **Mutating state**: Forbidden in LangGraph nodes; return partial state updates.
- **Generated files**: Never hand-edit files in `src/prisma/build/generated/prisma/` or `src/utils/zed/index.ts`.
- **Duplicate logic**: Avoid duplicating `deep-agents` logic between local and package deps.

## COMMANDS
```bash
pnpm install          # Install dependencies
pnpm dev              # Start dev server
pnpm build            # Production build
pnpm test:lg          # Run LangGraph tests
pnpm db:generate      # Generate Prisma client
pnpm db:push          # Push schema to dev DB
```

## NOTES
- **TSConfig Excludes**: Core sources in `src/langGraph` and `src/jobs` are currently excluded from `tsc` (handled by `tsx` or bundle).
- **Prisma Client**: Generated client is committed in `src/prisma/build/generated/prisma/`.
- **Zed Types**: `src/utils/zed/index.ts` is a massive (~10k line) generated file. Do not hand-edit.
