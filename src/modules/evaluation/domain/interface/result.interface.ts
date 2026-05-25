import type {
  ExcludeOptions,
  IRepository,
} from "../../../shared/domain/interface/repository.interface.ts";
import type { EvaluationResultEntity } from "../entity/result.entity.ts";
import type {
  EvaluationSessionOptions,
  EvaluationSessionReturnType,
} from "./session.interface.ts";

export type EvaluationResultOptions = {
  name: "evaluationResult";
  options: {
    evaluationSession:
      | ExcludeOptions<EvaluationSessionOptions, "evaluationResult">
      | boolean;
  };
};

export type EvaluationResultReturnType<T> = T extends {
  options: { evaluationSession: infer ES };
}
  ? {
      entity: EvaluationResultEntity;
      evaluationSession: EvaluationSessionReturnType<ES>;
    }
  : T extends true
    ? { entity: EvaluationResultEntity }
    : never;

export interface IEvaluationResultRepository extends IRepository<EvaluationResultEntity> {
  getByEvaluationSessionId(id: string): Promise<EvaluationResultEntity>;
}
