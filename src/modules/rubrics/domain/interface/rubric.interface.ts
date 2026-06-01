import type { ProjectAggregate } from "../../../copilot-session/domain/aggregate/project.aggregate.ts";
import type { IRepository } from "../../../shared/domain/interface/repository.interface.ts";
import type { RubricAggregate } from "../aggregate/rubric.aggregate.ts";
import type { CriteriaEntity } from "../entity/rubric.entity.ts";

export interface IRubricRepository extends IRepository<RubricAggregate> {
  getByProject(project: ProjectAggregate): Promise<Array<RubricAggregate>>;

  addCriterionToRubric(
    rubricId: string,
    criterion: CriteriaEntity[],
  ): Promise<void>;

  deleteCriterion(criterionId: string): Promise<void>;

  deleteRubric(rubricId: string): Promise<void>;
}
