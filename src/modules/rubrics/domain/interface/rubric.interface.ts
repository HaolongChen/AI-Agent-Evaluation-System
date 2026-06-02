import type { ProjectAggregate } from "../../../copilot-session/domain/aggregate/project.aggregate.ts";
import type { IRepository } from "../../../shared/domain/interface/repository.interface.ts";
import type { RubricAggregate } from "../aggregate/rubric.aggregate.ts";

export interface IRubricRepository extends IRepository<RubricAggregate> {
  getByProject(project: ProjectAggregate): Promise<Array<RubricAggregate>>;

  deleteCriterion(criterionId: string): Promise<void>;

  deleteRubric(rubricId: string): Promise<void>;
}
