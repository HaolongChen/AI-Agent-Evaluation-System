import type { IRepository } from "../../../shared/domain/interface/repository.interface.ts";
import type { EvaluationResultEntity } from "../entity/result.entity.ts";

export interface IEvaluationResultRepository extends IRepository<EvaluationResultEntity> {
  getByEvaluationSessionId(id: string): Promise<EvaluationResultEntity>;
}
