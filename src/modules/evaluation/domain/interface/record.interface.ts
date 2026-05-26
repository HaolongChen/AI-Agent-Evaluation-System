import type { IRepository } from "../../../shared/domain/interface/repository.interface.ts";
import type { EvaluationRecordEntity } from "../entity/record.entity.ts";

export interface IEvaluationRecordRepository extends IRepository<EvaluationRecordEntity> {
  getByEvaluationSessionId(
    evaluationSessionId: string,
  ): Promise<Array<EvaluationRecordEntity>>;
}
