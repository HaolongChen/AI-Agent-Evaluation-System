import type { evaluationSessionSchema } from "../schema/session.schema.ts";
import type { EvaluationSessionEntity } from "../entity/session.entity.ts";
import { AggregateRoot } from "../../../shared/domain/aggregate/aggregate-root.ts";
import type { EntityMetadata } from "../../../shared/domain/entity/entity.ts";
import type { EvaluationRecordAggregate } from "./record.aggregate.ts";

export class EvaluationSessionAggregate extends AggregateRoot<
  typeof evaluationSessionSchema,
  EntityMetadata,
  { rubric: EvaluationRecordAggregate }
> {
  constructor(data: EvaluationSessionEntity) {
    super(data, {});
  }
}
