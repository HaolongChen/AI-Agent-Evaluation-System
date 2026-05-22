# PROJECT KNOWLEDGE BASE (AI Agent Evaluation System)

**Generated:** 2026-05-22 | **Commit:** 5ba93c9 | **Branch:** main

## OVERVIEW

End-to-end evaluation framework for Copilot-style agents. DDD vertical slices, PostgreSQL (Prisma 7), GraphQL API. **No LangGraph** — workflow logic lives in module application services.

**Architecture**: 6 DDD modules (`src/modules/`) + legacy `analytics-service.ts` (awaiting migration) + GraphQL API + Account abstraction for Functorz backend auth.

## STRUCTURE

```
AI-Agent-Evaluation-System/
├── src/
│   ├── index.ts              # Express + ApolloServer entry
│   ├── modules/              # DDD vertical slices (see modules/AGENTS.md)
│   │   ├── account/          # Functorz backend auth (login, GQL/WS client lifecycle)
│   │   ├── copilot-input/    # Golden Sets, User Inputs, Project management, CRDT
│   │   ├── copilot-output/   # Copilot job execution via WebSocket
│   │   ├── evaluation/       # Sessions, Records, Results (domain-only, app/infra pending)
│   │   ├── rubrics/          # Rubric generation via multi-agent orchestration
│   │   └── shared/           # DDD foundations (Entity, AggregateRoot, IRepository)
│   ├── prisma/               # Schema, migrations, generated client (committed)
│   ├── services/             # ⚠️ DEPRECATED — only analytics-service.ts remains
│   ├── graphql/              # GraphQL API (resolvers → module use cases)
│   ├── config/               # Env vars, constants, Prisma singleton
│   └── DI/                   # Composition root (factory functions)
└── local_shell/              # Runtime temp files (CRDT schema JSON, docs)
```

## DDD MODULES

| Module           | Domain                    | Purpose                                           |
| ---------------- | ------------------------- | ------------------------------------------------- |
| `account`        | Functorz Auth             | Login, token management, GQL/WS client lifecycle  |
| `copilot-input`  | Golden Sets & User Inputs | Evaluation datasets, project CRUD, CRDT schema    |
| `copilot-output` | Copilot Job Execution     | WebSocket job execution, output capture           |
| `evaluation`     | Sessions & Results        | Evaluation lifecycle, scoring, reports            |
| `rubrics`        | Evaluation Criteria       | Multi-agent rubric generation with HITL review    |
| `shared`         | DDD Foundations           | Entity base, Repository interfaces, Value Objects |

**See `src/modules/AGENTS.md`** for full DDD architecture documentation.

## WHERE TO LOOK

| Task                   | Location                                 | Notes                                      |
| ---------------------- | ---------------------------------------- | ------------------------------------------ |
| Add DDD module/layer   | `src/modules/<module>/`                  | Follow domain/application/infrastructure   |
| Add auth/account logic | `src/modules/account/`                   | Account entity, login, GQL/WS clients      |
| Add GraphQL resolver   | `src/graphql/resolvers/`                 | Thin layer → delegates to module use cases |
| Add business logic     | `src/modules/<module>/application/`      | Use cases in modules                       |
| Change DB schema       | `src/prisma/schema.prisma`                   | Run `pnpm db:generate` after               |
| Add utility            | `src/modules/shared/` or `src/DI/` | Shared utilities, repository bundles      |
| Env/constants          | `src/config/`                            | Never import `process.env` directly        |

## CONVENTIONS

- **ESM Only**: `"type": "module"`. ALWAYS include `.ts` in import paths.
- **Strict TypeScript**: All strict flags enabled. Explicit types for all signatures.
- **Compiler**: Uses `tsgo` (`@typescript/native-preview`), NOT `tsc`.
- **Naming**: PascalCase (classes/types), camelCase (functions/files), UPPER_SNAKE_CASE (constants).
- **DDD Layers**: `domain/` → `application/` → `infrastructure/` (one-way dependencies).
- **Logger**: Use structured logging. Prefer the shared logger from `modules/shared/infrastructure/logger.ts` for modules; use `console` sparingly in resolvers.

## ANTI-PATTERNS (THIS PROJECT)

- **`any` type**: Forbidden. Use `unknown` or proper types. (2 violations exist in `type-system.service.ts`)
- **Promise chaining**: Forbidden. Use `async/await`. (1 violation in `environment-setup.ts`)
- **Default exports**: Forbidden. Use named exports only.
- **Direct LLM calls**: Forbidden. Use `invokeWithRetry()`.
- **Generated files**: Never hand-edit `src/prisma/build/generated/prisma/` or `src/graphql/generated/`.
- **Cross-layer imports**: Domain layer must NOT import Application or Infrastructure layers. (1 violation in `prompts.service.ts`)
- **Logic in resolvers**: GraphQL resolvers must be thin — delegate to modules. (1 violation: direct Prisma query in `golden-set-resolver.ts`)
- **`src/DI/` directory**: Uses PascalCase — legacy naming, do not replicate.

## COMMANDS

```bash
pnpm install          # Install dependencies
pnpm dev             # Start dev server (nodemon + tsx)
pnpm build           # Production build (tsgo → dist/)
pnpm typecheck       # TypeScript validation (tsgo --noEmit)
pnpm db:generate     # Generate Prisma client
pnpm db:push         # Push schema to dev DB
pnpm db:migrate      # Run dev migrations
pnpm codegen         # Generate GraphQL types
pnpm lint            # ESLint
pnpm lint:fix        # Auto-fix lint issues
pnpm format          # Prettier + ESLint fix + depgen + Prisma format
```

## NOTES

- **Prisma 7**: Uses new `prisma.config.ts` at root. Schema at `src/prisma/schema.prisma`. Generated client committed in `src/prisma/build/generated/prisma/`.
- **Account abstraction**: `src/DI/account.ts` provides `createAccount()` factory — creates Account instances at startup with env credentials.
- **No tests**: Zero test infrastructure. README references `test:lg`, `test:graphql` — not implemented.
- **No CI pipeline**: `.github/workflows/opencode.yml` is an AI agent trigger, not build/test CI.
- **Private registries**: `.npmrc` configures GitHub Packages (`@HaolongChen:`) and Functorz (`@functorz:`) registries.
- **Phantom dirs**: `src/external/`, `src/langGraph/`, `src/jobs/`, `scripts/`, `src/deep-agents/` are documented but do not exist on disk.
- **local_shell/**: Runtime temp directory for CRDT schema JSON and documentation lookups. Not source code.
