import { AggregateRoot } from "../../../shared/domain/aggregate/aggregate-root.ts";
import type { CriteriaEntity } from "../entity/rubric.entity.ts";
import type { rubricSchema } from "../schema/rubric.schema.ts";

export class RubricAggregate extends AggregateRoot<typeof rubricSchema> {
  private _criterion: CriteriaEntity[] = [];
  private _totalWeight: number = 0;

  get criterion(): CriteriaEntity[] {
    return this._criterion;
  }

  public addCriteria(criteriaEntity: CriteriaEntity): void {
    this._criterion.push(criteriaEntity);
    this._totalWeight += criteriaEntity.getData("weight");
  }

  public getAllData(): ReturnType<
    AggregateRoot<typeof rubricSchema>["getData"]
  > & {
    criterion: ReturnType<CriteriaEntity["getData"]>[];
  } {
    return {
      ...super.getData(),
      criterion: this._criterion.map((criteria) => criteria.getData()),
    };
  }
}
