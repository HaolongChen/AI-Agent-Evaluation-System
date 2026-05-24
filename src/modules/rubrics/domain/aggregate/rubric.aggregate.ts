import { AggregateRoot } from "../../../shared/domain/aggregate/aggregate-root.ts";
import type { EntityMetadata } from "../../../shared/domain/entity/entity.ts";
import type { CriteriaEntity, RubricEntity } from "../entity/rubric.entity.ts";
import type { rubricSchema } from "../schema/rubric.schema.ts";

export class RubricAggregate extends AggregateRoot<
  typeof rubricSchema,
  EntityMetadata,
  { criterion: CriteriaEntity }
> {
  private _totalWeight: number = 0;

  constructor(entity: RubricEntity) {
    super(entity);
  }

  public getAllData(): ReturnType<
    AggregateRoot<typeof rubricSchema>["getData"]
  > & {
    criterion: ReturnType<CriteriaEntity["getData"]>[];
  } {
    return {
      ...super.getData(),
      criterion: super
        .getEntity("criterion")
        .map((criteria) => criteria.getData()),
    };
  }
}
