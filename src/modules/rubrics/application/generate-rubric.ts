import { generateRubrics } from "./rubricsGenerator/rubrics-generator.ts";
import type { IGoldenSetRepository } from "../../copilot-input/domain/interface/golden-set.interface.ts";
import type { IRubricRepository } from "../domain/interface/rubric.interface.ts";
import { RubricAggregate } from "../domain/aggregate/rubric.aggregate.ts";
import {
  CriteriaEntity,
  RubricEntity,
} from "../domain/entity/rubric.entity.ts";
import type { IAgentFeedbackRepository } from "../domain/interface/agent-feedback.interface.ts";
import { SaveFeedbacksUseCase } from "./save-feedbacks.ts";

export class GenerateRubricUseCase {
  constructor(
    private repository: {
      rubricRepository: IRubricRepository;
      goldenSetRepository: IGoldenSetRepository;
      agentFeedbackRepository: IAgentFeedbackRepository;
    },
  ) {}

  async execute(goldenSetId: string, userInputId: string) {
    const copilotInput =
      await this.repository.goldenSetRepository.getCopilotInputByGoldenSetIdAndUserInputId(
        goldenSetId,
        userInputId,
      );
    const schemaId = copilotInput.goldenSetEntity.data.schemaId;
    const query = copilotInput.userInputEntity.data.content;
    const { criterion, ...Feedbacks } = await generateRubrics(schemaId, query);
    const rubricAggregate = new RubricAggregate(
      new RubricEntity({ goldenSetId, userInputId }),
    );
    for (const criteria of criterion.criterion) {
      rubricAggregate.addCriteria(
        new CriteriaEntity({ ...criteria, rubricId: rubricAggregate.id }),
      );
    }
    await this.repository.rubricRepository.saveWithCriterion(rubricAggregate);
    const saveFeedbacksUseCase = new SaveFeedbacksUseCase(
      this.repository.agentFeedbackRepository,
    );
    await saveFeedbacksUseCase.execute(Feedbacks, rubricAggregate.id);
    return rubricAggregate.toJSON();
  }
}
