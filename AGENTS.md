# PROJECT KNOWLEDGE BASE (AI Agent Evaluation System)

**Generated:** 2026-05-08 | **Commit:** 5f7332f | **Branch:** main

## OVERVIEW

An end-to-end evaluation framework for Copilot-style agents. Uses DDD vertical slices + LangGraph HITL workflows, PostgreSQL (Prisma), and GraphQL.

**Architecture**: DDD modules in `src/modules/` + legacy layers (`services/`, `graphql/`, `jobs/`) migrating to modules.

## STRUCTURE

```
AI-Agent-Evaluation-System/
├── src/
│   ├── index.ts              # Express + ApolloServer entry
│   ├── modules/              # DDD vertical slices (see modules/AGENTS.md)
│   ├── services/             # Legacy services → migrating to modules/
│   ├── graphql/              # GraphQL API (thin resolvers → modules)
│   ├── jobs/                 # CLI job runners (consume modules)
│   ├── external/             # Functorz backend integration (GQL client, Zed)
│   ├── deep-agents/          # LLM-based rubric generation agents
│   ├── config/               # Env vars, constants, Prisma singleton
│   └── DI/                   # Dependency injection
├── prisma/                   # Schema + migrations
├── scripts/                  # DB setup/seed utilities
└── tests/                    # Script-based tests (tsx)
```

## DDD MODULES (PRIMARY)

| Module | Domain | Purpose |
|--------|--------|---------|
| `copilot-input` | Golden Sets & User Inputs | Manages evaluation datasets |
| `copilot-output` | Copilot Job Execution | Executes copilot queries, captures outputs |
| `evaluation` | Sessions & Results | Evaluation lifecycle, scoring, reports |
| `rubrics` | Evaluation Criteria | Rubric generation via deep agents |
| `shared` | DDD Foundations | Entity base, Repository interfaces, Value Objects |

**See `src/modules/AGENTS.md`** for full DDD architecture documentation.

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Add DDD module/layer | `src/modules/<module>/` | Follow domain/application/infrastructure |
| Add GraphQL resolver | `src/graphql/resolvers/` | Thin layer → delegates to modules |
| Add business logic | `src/modules/<module>/domain/service/` | Domain services in modules |
| Change DB schema | `prisma/schema.prisma` | Run `pnpm db:generate` after |
| Add utility | `src/external/` or `src/modules/shared/` | Utilities in external |
| Add LLM agent tool | `src/deep-agents/` | Deep agent tooling |
| Add CLI job | `src/jobs/` | Job runners consuming modules |
| Add tests | `tests/` | Script-based, use tsx |

## CONVENTIONS

- **ESM Only**: `"type": "module"`. ALWAYS include `.ts` in import paths.
- **Strict TypeScript**: All strict flags enabled. Explicit types for all signatures.
- **Naming**: PascalCase (classes/types), camelCase (functions/files), UPPER_SNAKE_CASE (constants).
- **DDD Layers**: `domain/` → `application/` → `infrastructure/` (one-way dependencies).
- **Logger**: Use `console` instead of `console.log`.

## ANTI-PATTERNS (THIS PROJECT)

- **`any` type**: Forbidden. Use `unknown` or proper types.
- **Promise chaining**: Forbidden. Use `async/await`.
- **Default exports**: Forbidden. Use named exports only.
- **Direct LLM calls**: Forbidden. Use `invokeWithRetry()`.
- **Generated files**: Never hand-edit `src/prisma/build/generated/prisma/` or `src/utils/zed/index.ts`.
- **Cross-layer imports**: Domain layer must NOT import Application or Infrastructure layers.
- **Logic in resolvers**: GraphQL resolvers must be thin — delegate to modules.

## COMMANDS

```bash
pnpm install          # Install dependencies
pnpm dev             # Start dev server (nodemon + tsx)
pnpm build           # Production build (tsc → dist/)
pnpm typecheck       # TypeScript validation (tsc --noEmit)
pnpm test:unit       # Unit tests
pnpm db:generate     # Generate Prisma client
pnpm db:push         # Push schema to dev DB
pnpm codegen         # Generate GraphQL types
pnpm lint            # ESLint
pnpm lint:fix        # Auto-fix lint issues
```

## NOTES

- **Prisma Client**: Generated client committed in `src/prisma/build/generated/prisma/`.
- **Zed Types**: `src/external/zed/index.ts` is a large (~10k line) generated file.
- **Migration**: Legacy `services/` are being migrated to `modules/`. Prefer modules for new work.