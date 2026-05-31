# Prisma Database Layer

**Scope:** `src/prisma/` | **Updated:** 2026-05-31

Prisma 7 schema, migrations, generated client. PostgreSQL via `@prisma/adapter-pg`. Config: `prisma.config.ts` at project root (not `package.json`).

## Structure

```
src/prisma/
├── schema.prisma                 # 226 lines, 12 models
├── migrations/                   # 1 squashed migration file
└── build/generated/prisma/       # Committed generated client
```

## Models (12)

| Model                  | Purpose                                    |
| ---------------------- | ------------------------------------------ |
| `goldenSet`            | Dataset (schemaId, copilotType, modelName) |
| `project`              | External project tracking                  |
| `userInput`            | User prompts per golden set                |
| `goldenSet_userInput`  | Join table (M:N)                           |
| `copilotOutput`        | Copilot job output                         |
| `copilotOutput_rubric` | Join table (M:N)                           |
| `rubric`               | AI-generated criterion sets                |
| `criteria`             | Individual rubric criteria                 |
| `agentFeedbacks`       | Multi-agent feedback traces                |
| `evaluationSession`    | Execution session                          |
| `evaluationRecord`     | Rubric judgment answers                    |
| `evaluationResult`     | Final evaluation report                    |

## Conventions

- **All models**: UUID PKs, `@map("snake_case")` on every field, named `@relation` strings
- **Never hand-edit** `build/generated/prisma/` — committed but auto-generated
- **Import singleton** from `src/config/prisma.ts` (uses PrismaPg adapter) — never instantiate `PrismaClient` directly
- **Schema**: `src/prisma/schema.prisma` pointed to by root `prisma.config.ts`
- **Development**: `pnpm db:push` (no migration file). **Production**: `pnpm db:migrate`

## Commands

```
pnpm db:generate   Regenerate Prisma client
pnpm db:push       Sync schema to dev DB (no migration)
pnpm db:migrate    Apply migrations
pnpm db:studio     Prisma Studio GUI
```
