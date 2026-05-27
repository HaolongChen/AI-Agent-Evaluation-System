import type { RubricAggregate } from "../../../rubrics/domain/aggregate/rubric.aggregate.ts";
import type { IRepository } from "../../../shared/domain/interface/repository.interface.ts";
import type { EvaluationSessionAggregate } from "../aggregate/session.aggregate.ts";
export interface IEvaluationSessionRepository extends IRepository<EvaluationSessionAggregate> {
  getByRubric(
    rubric: RubricAggregate,
  ): Promise<Array<EvaluationSessionAggregate>>;
}
