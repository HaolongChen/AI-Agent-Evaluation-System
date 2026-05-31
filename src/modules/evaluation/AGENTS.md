# Evaluation Module

## OVERVIEW

Domain module for evaluation lifecycle: sessions, judge records, results.

**Status: INCOMPLETE** — domain entities/aggregates/schemas/interfaces defined. Some infrastructure exists. Application layer empty.

## STRUCTURE

```
evaluation/
├── domain/
│   ├── aggregate/     # session.aggregate.ts, record.aggregate.ts
│   ├── entity/        # session.entity.ts, record.entity.ts (NO ResultEntity)
│   ├── interface/     # session.interface.ts, record.interface.ts (NOT empty)
│   ├── schema/        # session.schema.ts, record.schema.ts, result.schema.ts
│   └── service/       # EMPTY
├── application/       # EMPTY — no use cases
└── infrastructure/
    └── repository/    # session.repository.ts only (EvaluationSessionRepository)
```

## CROSS-MODULE DOMAIN COUPLING

Evaluation domain directly imports from other modules (anti-pattern):

| File                    | Imports from                                                                                                     |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `record.aggregate.ts`   | `rubrics/domain/aggregate`, `rubrics/domain/entity`, `rubrics/domain/schema`, `copilot-session/domain/aggregate` |
| `session.interface.ts`  | `rubrics/domain/aggregate`                                                                                       |
| `session.repository.ts` | `rubrics/domain/aggregate`, `rubrics/infrastructure/repository`                                                  |

Domain layer should NOT depend on other modules. This violates DDD layer isolation.

## MIGRATION STATUS

| Component             | Status                                                             |
| --------------------- | ------------------------------------------------------------------ |
| Domain entities       | SessionEntity, RecordEntity done. ResultEntity missing.            |
| Domain aggregates     | SessionAggregate, EvaluationRecordAggregate done.                  |
| Domain schemas        | Session, record, result Zod schemas done.                          |
| Domain interfaces     | IEvaluationSessionRepository, IEvaluationRecordRepository defined. |
| Domain services       | EMPTY                                                              |
| Application/use cases | EMPTY                                                              |
| Infrastructure/repos  | session.repository.ts only (save, findById, getByRubric).          |
| GraphQL resolvers     | 3 methods throw "Method not implemented" (2 queries, 1 mutation).  |

**GraphQL**: `session-resolver.ts` has `getEvaluationSessionById`, `getEvaluationSessions`, `submitHumanEvaluation` — all stubs. `getEvaluationResultById` and `getEvaluationResults` do not exist in resolvers. Module unusable via API.

**Legacy**: No migration source found — `src/services/analytics-service.ts` does not exist on disk.

## CONVENTIONS

- Entities extend shared `Entity` base class
- Schemas use Zod for runtime validation
- Aggregate root controls entity composition and invariant enforcement
- Import paths use `.ts` extension (ESM requirement)
