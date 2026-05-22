# Evaluation Module

## OVERVIEW

Domain module for evaluation lifecycle: sessions, judge records, and final results.

**Status: INCOMPLETE** — domain entities/aggregates/schemas are defined, but everything else is unimplemented.

## STRUCTURE

```
evaluation/
├── domain/
│   ├── aggregate/     # SessionAggregate (root), BaseAggregate — DONE
│   ├── entity/        # SessionEntity, RecordEntity, ResultEntity — DONE
│   ├── interface/     # EMPTY — no repository interfaces exist
│   ├── schema/        # Zod schemas (session, record, result) — DONE
│   └── service/       # EMPTY — no domain services
├── application/       # EMPTY — no use cases, commands, or queries
└── infrastructure/    # EMPTY — no Prisma repository implementations
```

Only the domain model is defined. Application and infrastructure layers are **completely empty** with no progress.

## ENTITIES

- **EvaluationSessionEntity**: Single evaluation run. Contains goldenSetId, status, timestamps, performance metrics.
- **EvaluationRecordEntity**: Judge scoring records against a rubric (question answers, scores, explanations).
- **EvaluationResultEntity**: Final report (overallScore, summary, detailedAnalysis, audit trail).

All extend BaseSessionEntity → shared Entity base class.

## AGGREGATE

**EvaluationSessionAggregate** (root). Enforces: same-session-id invariant for records and result. **BaseAggregate** provides shared aggregate plumbing.

## MIGRATION STATUS

| Component                       | Status                               |
| ------------------------------- | ------------------------------------ |
| Domain entities                 | Done                                 |
| Domain aggregates               | Done                                 |
| Domain schemas                  | Done                                 |
| Domain interfaces/IRepositories | EMPTY                                |
| Domain services                 | EMPTY                                |
| Application/use cases           | EMPTY                                |
| Infrastructure/repos            | EMPTY                                |
| GraphQL resolvers               | ALL 5 throw "Method not implemented" |

**GraphQL resolvers in `session-resolver.ts`**: All 5 mutations/queries (`runEvaluation`, `submitRubricReview`, `submitHumanEvaluation`, `getEvaluationSession`, `listEvaluationSessions`) throw `new Error("Method not implemented.")`. The module cannot be used via the API.

**Legacy code not yet migrated**: Evaluation logic remains in `src/services/analytics-service.ts` (51 references to evaluation/session/rubric). This is the future source for application layer migration.

## CONVENTIONS

- Entities extend shared `Entity` base class (`modules/shared/domain/`)
- Schemas use Zod for runtime validation
- Aggregate root controls entity composition and invariant enforcement
- Import paths use `.ts` extension (ESM requirement)
