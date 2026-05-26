import type { IRepository } from "../../../shared/domain/interface/repository.interface.ts";
import type { EvaluationSessionEntity } from "../entity/session.entity.ts";
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
