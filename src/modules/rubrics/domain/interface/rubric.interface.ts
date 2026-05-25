import type {
  EvaluationSetOptions,
  EvaluationSetReturnType,
} from "../../../evaluation/domain/interface/session.interface.ts";
import type {
  ExcludeOptions,
  IRepository,
} from "../../../shared/domain/interface/repository.interface.ts";
import type { RubricAggregate } from "../aggregate/rubric.aggregate.ts";
import type { CriteriaEntity, RubricEntity } from "../entity/rubric.entity.ts";
import type {
  CriteriaOptions,
  CriteriaReturnType,
} from "./criteria.interface.ts";
import type {
  AgentFeedbackOptions,
  AgentFeedbackReturnType,
} from "./feedback.interface.ts";

export type RubricOptions = {
  name: "rubric";
  options: {
    evaluationSet: ExcludeOptions<EvaluationSetOptions, "rubric"> | boolean;
    criteria: ExcludeOptions<CriteriaOptions, "rubric"> | boolean;
    agentFeedback: ExcludeOptions<AgentFeedbackOptions, "rubric"> | boolean;
  };
};

export type RubricReturnType<T> = {
  entity: RubricEntity;
  criteriaEntity: T extends { options: { criteria: infer CR } }
    ? CriteriaReturnType<CR>[]
    : never;
  evaluationSet: T extends { options: { evaluationSet: infer ES } }
    ? EvaluationSetReturnType<ES>
    : never;
  agentFeedback: T extends { options: { agentFeedback: infer AF } }
    ? AgentFeedbackReturnType<AF>[]
    : never;
};

export interface IRubricRepository extends IRepository<RubricEntity> {
  saveWithCriterion(rubricAggregate: RubricAggregate): Promise<void>;

  getCriterionByRubricId(rubricId: string): Promise<CriteriaEntity[]>;

  addCriterionToRubric(
    rubricId: string,
    criterion: CriteriaEntity[],
  ): Promise<void>;

  deleteCriterion(criterionId: string): Promise<void>;

  deleteRubric(rubricId: string): Promise<void>;

  findById(id: string): Promise<RubricAggregate>;

  getByGoldenSetIdAndUserInputId(
    goldenSetId: string,
    userInputId: string,
  ): Promise<RubricAggregate[]>;

  linkRubricToCopilotOutput(
    rubricId: string,
    copilotOutputId: string,
  ): Promise<void>;
}
