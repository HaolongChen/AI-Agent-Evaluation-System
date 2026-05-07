import { AggregateRoot } from "../../../shared/domain/aggregate/aggregate-root.ts";
import type { CriteriaEntity, RubricEntity } from "../entity/rubric.entity.ts";
import type { rubricSchema } from "../schema/rubric.schema.ts";

export class RubricAggregate extends AggregateRoot<typeof rubricSchema> {
  private _criterion: CriteriaEntity[] = [];
  private _totalWeight: number = 0;

  get criterion(): CriteriaEntity[] {
    return this._criterion;
  }
  constructor(entity: RubricEntity) {
    super(entity);
  }

  public addCriteria(criteriaEntity: CriteriaEntity): void {
    this._criterion.push(criteriaEntity);
    this._totalWeight += criteriaEntity.data.weight;
  }

  public toJSON(): ReturnType<AggregateRoot<typeof rubricSchema>["toJSON"]> & {
    criterion: CriteriaEntity[];
  } {
    return {
      ...super.toJSON(),
      criterion: this._criterion,
    };
  }
}
