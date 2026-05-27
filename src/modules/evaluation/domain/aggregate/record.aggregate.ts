import type { CopilotSessionAggregate } from "../../../copilot-session/domain/aggregate/copilot-session.aggregate.ts";
import { RubricAggregate } from "../../../rubrics/domain/aggregate/rubric.aggregate.ts";
import type { CriteriaEntity } from "../../../rubrics/domain/entity/rubric.entity.ts";
import { criteriaSchema } from "../../../rubrics/domain/schema/rubric.schema.ts";
import { AggregateRoot } from "../../../shared/domain/aggregate/aggregate-root.ts";
import type { EntityMetadata } from "../../../shared/domain/entity/entity.ts";
import type { EvaluationRecordEntity } from "../entity/record.entity.ts";
export class CriteriaRecordAggregate extends AggregateRoot<
  typeof criteriaSchema,
  EntityMetadata,
  { evaluationRecord: EvaluationRecordEntity }
> {
  constructor(criteria: CriteriaEntity) {
    super(criteria);
  }

  isDone(): boolean {
    return (
      this.getEntity("evaluationRecord").length === 1 &&
      this.getEntity("evaluationRecord")[0].getData("criteriaId") ===
        this.getData("id")
    );
  }

  addEvaluationRecord(record: EvaluationRecordEntity) {
    this.setEntity("evaluationRecord", [record]);
  }
}

export class EvaluationRecordAggregate extends RubricAggregate<{
  copilotSession: CopilotSessionAggregate;
  criterion: CriteriaRecordAggregate;
}> {
  constructor(rubricAggregate: RubricAggregate) {
    super(rubricAggregate.getEntity("copilotSession")[0]);
    this.setEntity(
      "criterion",
      rubricAggregate
        .getEntity("criterion")
        .map((criteria) => new CriteriaRecordAggregate(criteria)),
    );
  }

  evaluate(record: EvaluationRecordEntity) {
    const criteriaId = record.getData("criteriaId");
    const criteria = this.getEntity("criterion").find(
      (criteria) => criteria.getData("id") === criteriaId,
    );
    if (!criteria) throw new Error("Criteria not found");
    criteria.addEvaluationRecord(record);
  }
}
