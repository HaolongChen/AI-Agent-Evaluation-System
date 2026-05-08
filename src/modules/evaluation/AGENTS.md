# Evaluation Module

## OVERVIEW

Domain module for evaluation lifecycle: sessions, judge records, and final results.

## STRUCTURE

```
evaluation/
├── domain/
│   ├── aggregate/     # SessionAggregate (aggregate root)
│   ├── entity/        # SessionEntity, RecordEntity, ResultEntity
│   └── schema/         # Zod schemas for validation
├── application/       # EMPTY - not yet implemented
└── infrastructure/   # EMPTY - not yet implemented
```

Domain layer is complete. Application and infrastructure layers are pending.

## ENTITIES

- **EvaluationSessionEntity**: Represents a single evaluation run. Contains metadata like goldenSetId, status, timestamps, and performance metrics (latency, tokens, contextUsage).

- **EvaluationRecordEntity**: Stores judge scoring records against a rubric. Each record belongs to a session and contains question answers, scores, and explanations.

- **EvaluationResultEntity**: Final report for a session. Contains overallScore, summary, detailedAnalysis, and audit trail.

All entities extend BaseSessionEntity which provides identifier accessors and inherits from shared Entity base class.

## AGGREGATE

**EvaluationSessionAggregate** serves as the aggregate root. It enforces invariants:

- Only allows adding RecordEntity instances that share the same session identifier
- Only allows setting ResultEntity with matching identifier
- Provides controlled access to child entities via getter methods

This pattern ensures all related records and results stay consistent under a single transaction boundary.

## MIGRATION STATUS

This module is in early stages. Domain layer is defined but:

- No application services yet (use cases, commands, queries)
- No infrastructure layer (repository implementations, Prisma mappers)

Currently, evaluation logic lives in legacy services under `src/services/`. Future work involves migrating that logic into this module's application layer.

## CONVENTIONS

- Entities extend shared Entity base class from `modules/shared/domain/`
- Schemas use Zod for runtime validation
- Aggregate root controls entity composition and invariant enforcement
- Import paths use `.ts` extension (ESM requirement)