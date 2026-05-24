# PRISMA DATABASE LAYER

**Scope:** `src/prisma/` | **Updated:** 2026-05-24

Database schema, migrations, and generated client. Prisma 7, PostgreSQL via `@prisma/adapter-pg`.

## STRUCTURE

```
src/prisma/
├── schema.prisma              # 226 lines, 12 models, ERD generator
├── migrations/                # Squashed migration (1 file)
├── build/generated/prisma/    # Committed generated client
└── ERD.svg
```

## MODELS

The schema defines 12 models corresponding to the evaluation lifecycle:

| Model                  | Purpose                                                                        |
| ---------------------- | ------------------------------------------------------------------------------ |
| `goldenSet`            | Evaluation dataset — uniquely identified by (schemaId, copilotType, modelName) |
| `project`              | External project tracking — unique by projectExId, schemaId, and name          |
| `userInput`            | Individual user-provided prompts per golden set                                |
| `goldenSet_userInput`  | Join table linking golden sets to user inputs (M:N)                            |
| `copilotOutput`        | Copilot job output captured per golden-set + user-input                        |
| `copilotOutput_rubric` | Join table linking copilot outputs to rubrics (M:N)                            |
| `rubric`               | AI-generated evaluation criterion sets per copilot input                       |
| `criteria`             | Individual rubric criteria (weight, expected answer, reasoning)                |
| `agentFeedbacks`       | Multi-agent feedback traces per rubric                                         |
| `evaluationSession`    | Execution session for an evaluator on a copilot output                         |
| `evaluationRecord`     | Individual rubric judgment answers (one per criteria)                          |
| `evaluationResult`     | Final evaluation report (overall score, analysis, audit)                       |

## CONVENTIONS

- **Never hand-edit** `src/prisma/build/generated/prisma/` — it is committed but auto-generated.
- **After schema changes**: run `pnpm db:generate` to regenerate the client.
- **Development**: use `pnpm db:push` to sync schema to your local DB without creating a migration.
- **Production**: use `pnpm db:migrate` to apply migrations properly.
- **Import the Prisma singleton** from `src/config/prisma.ts` — never import `process.env` or instantiate `PrismaClient` directly elsewhere.
- **`PrismaClient` uses `PrismaPg` adapter** from `@prisma/adapter-pg` — configured in `src/config/prisma.ts`.
- **Schema location**: `src/prisma/schema.prisma` (not the project root). The `prisma.config.ts` at the project root points to it.

## COMMANDS

```bash
pnpm db:generate   # Regenerate Prisma client from schema
pnpm db:push       # Push schema to dev DB (no migration file)
pnpm db:migrate    # Create and apply a new migration
pnpm db:studio     # Open Prisma Studio GUI
```

## COMPANION DOCS

- `src/modules/AGENTS.md` — DDD module architecture overview
- `src/config/AGENTS.md` — Config layer including prisma.ts singleton
