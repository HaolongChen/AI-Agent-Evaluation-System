import type { evaluationSessionSchema } from "../schema/session.schema.ts";
import type { EvaluationSessionEntity } from "../entity/session.entity.ts";
import type { EvaluationRecordEntity } from "../entity/record.entity.ts";
import type { EvaluationResultEntity } from "../entity/result.entity.ts";
import { BaseSessionAggregateRoot } from "./base.aggregate.ts";

export class EvaluationSessionAggregate extends BaseSessionAggregateRoot<
  typeof evaluationSessionSchema
> {
  private _recordsEntities: EvaluationRecordEntity[] = [];
  private _resultEntity: EvaluationResultEntity | undefined;
  constructor(data: EvaluationSessionEntity) {
    super(data);
  }

  private validateExternalEntity(
    entity: EvaluationRecordEntity | EvaluationResultEntity,
  ): boolean {
    return this.entity.identifier == entity.identifier;
  }

  public addRecordEntity(recordEntity: EvaluationRecordEntity): void {
    if (!this.validateExternalEntity(recordEntity)) {
      throw new Error("The record entity does not belong to this session.");
    }
    this._recordsEntities.push(recordEntity);
  }

  public set resultEntity(resultEntity: EvaluationResultEntity) {
    if (!this.validateExternalEntity(resultEntity)) {
      throw new Error("The result entity does not belong to this session.");
    }
    this._resultEntity = resultEntity;
  }

  public get recordsEntities(): EvaluationRecordEntity[] {
    return this._recordsEntities;
  }

  public get resultEntity(): EvaluationResultEntity | undefined {
    return this._resultEntity;
  }
}
