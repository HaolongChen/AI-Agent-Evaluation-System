import type { IRepository } from "../../../shared/domain/interface/repository.interface.ts";
import type { RubricAggregate } from "../aggregate/rubric.aggregate.ts";
import type { CriteriaEntity, RubricEntity } from "../entity/rubric.entity.ts";

export interface IRubricRepository extends IRepository<RubricEntity> {
  saveWithCriterion(rubricAggregate: RubricAggregate): Promise<void>;

  getCriterionByRubricId(rubricId: string): Promise<CriteriaEntity[]>;

  addCriterionToRubric(
    rubricId: string,
    criterion: CriteriaEntity[],
  ): Promise<void>;

  deleteCriterion(criterionId: string): Promise<void>;

  deleteRubric(rubricId: string): Promise<void>;

  getByGoldenSetIdAndUserInputId(
    goldenSetId: string,
    userInputId: string,
  ): Promise<RubricAggregate[]>;

  linkRubricToCopilotOutput(
    rubricId: string,
    copilotOutputId: string,
  ): Promise<void>;

  findById(id: string): Promise<RubricAggregate>;
}
