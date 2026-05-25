import type {
  CopilotOutputOptions,
  CopilotOutputReturnType,
} from "../../../copilot-output/domain/interface/copilot-output.interface.ts";
import type {
  RubricOptions,
  RubricReturnType,
} from "../../../rubrics/domain/interface/rubric.interface.ts";
import type {
  ExcludeOptions,
  IRepository,
} from "../../../shared/domain/interface/repository.interface.ts";
import type { EvaluationSessionEntity } from "../entity/session.entity.ts";
import type {
  EvaluationRecordOptions,
  EvaluationRecordReturnType,
} from "./record.interface.ts";
import type {
  EvaluationResultOptions,
  EvaluationResultReturnType,
} from "./result.interface.ts";

export type EvaluationSetOptions = {
  name: "evaluationSet";
  options: {
    evaluationSession:
      | ExcludeOptions<EvaluationSessionOptions, "evaluationSet">
      | boolean;
    copilotOutput:
      | ExcludeOptions<CopilotOutputOptions, "evaluationSet">
      | boolean;
    rubric: ExcludeOptions<RubricOptions, "evaluationSet"> | boolean;
  };
};

export type EvaluationSessionOptions = {
  name: "evaluationSession";
  options: {
    evaluationSet:
      | ExcludeOptions<EvaluationSetOptions, "evaluationSession">
      | boolean;
    evaluationRecord:
      | ExcludeOptions<EvaluationRecordOptions, "evaluationSession">
      | boolean;
    evaluationResult:
      | ExcludeOptions<EvaluationResultOptions, "evaluationSession">
      | boolean;
  };
};

export type EvaluationSetReturnType<T> = {
  evaluationSession: T extends { options: { evaluationSession: infer ES } }
    ? EvaluationSessionReturnType<ES>[]
    : never;
  copilotOutput: T extends { options: { copilotOutput: infer CO } }
    ? CopilotOutputReturnType<CO>
    : never;
  rubric: T extends { options: { rubric: infer R } }
    ? RubricReturnType<R>
    : never;
};

export type EvaluationSessionReturnType<T> = T extends { options: infer O }
  ? {
      entity: EvaluationSessionEntity;
      evaluationRecordEntity: O extends { evaluationRecord: infer ER }
        ? EvaluationRecordReturnType<ER>[]
        : never;
      evaluationResultEntity: O extends { evaluationResult: infer ER }
        ? EvaluationResultReturnType<ER>
        : never;
      evaluationSet: O extends { evaluationSet: infer ES }
        ? EvaluationSetReturnType<ES>
        : never;
    }
  : T extends true
    ? { entity: EvaluationSessionEntity }
    : never;

export interface IEvaluationSessionRepository extends IRepository<EvaluationSessionEntity> {
  getByCopilotOutputId(
    copilotOutputId: string,
  ): Promise<Array<EvaluationSessionEntity>>;
  getByRubricId(rubricId: string): Promise<Array<EvaluationSessionEntity>>;
  getByCopilotOutputIdAndRubricId(
    copilotOutputId: string,
    rubricId: string,
  ): Promise<Array<EvaluationSessionEntity>>;
}
