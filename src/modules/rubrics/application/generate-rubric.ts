import { generateRubrics } from "./rubricsGenerator/rubrics-generator.ts";
import type { ICopilotInputRepository } from "../../copilot-input/domain/interface/copilot-input.interface.ts";
import type { IRubricRepository } from "../domain/interface/rubric.interface.ts";
import { RubricAggregate } from "../domain/aggregate/rubric.aggregate.ts";
import {
  CriteriaEntity,
  RubricEntity,
} from "../domain/entity/rubric.entity.ts";
import type { IRepository } from "../../shared/domain/interface/repository.interface.ts";
import type { AgentFeedbackEntity } from "../domain/entity/agent-feedback.entity.ts";
import { SaveFeedbacksUseCase } from "./save-feedbacks.ts";
import {
  Feedback,
  feedbacksgetData,
  type Feedbacks,
} from "../domain/service/feedback.service.js";
import { randomUUID } from "node:crypto";

export class GenerateRubricUseCase {
  constructor(
    private repository: {
      rubricRepository: IRubricRepository;
      copilotInputRepository: ICopilotInputRepository;
      agentFeedbackRepository: IRepository<AgentFeedbackEntity>;
    },
  ) {}

  async execute(goldenSetId: string, userInputId: string) {
    const copilotInput =
      await this.repository.copilotInputRepository.getByFilters({
        goldenSetId,
        userInputId,
      });
    const schemaId = copilotInput.goldenSetEntity[0].getData("schemaId");
    const query = copilotInput.userInputEntity[0].getData("content");
    const rubricId = randomUUID();
    const feedbacks: Feedbacks = {
      "rubrics-generator-agent": new Feedback<"rubrics-generator-agent">(
        "rubrics-generator-agent",
        rubricId,
      ),
      "documentations-lookup-agent":
        new Feedback<"documentations-lookup-agent">(
          "documentations-lookup-agent",
          rubricId,
        ),
      "schema-lookup-agent": new Feedback<"schema-lookup-agent">(
        "schema-lookup-agent",
        rubricId,
      ),
    };
    const { criterion } = await generateRubrics(schemaId, query, feedbacks);
    const rubricAggregate = new RubricAggregate(
      new RubricEntity({ goldenSetId, userInputId }, rubricId),
    );
    for (const criteria of criterion.criterion) {
      rubricAggregate.pushEntity(
        "criterion",
        new CriteriaEntity({
          ...criteria,
          rubricId: rubricAggregate.getData("id"),
        }),
      );
    }
    await this.repository.rubricRepository.saveWithCriterion(rubricAggregate);
    const saveFeedbacksUseCase = new SaveFeedbacksUseCase(
      this.repository.agentFeedbackRepository,
    );
    await saveFeedbacksUseCase.execute(
      feedbacks,
      rubricAggregate.getData("id"),
    );
    return {
      ...rubricAggregate.getAllData(),
      feedbacks: feedbacksgetData(feedbacks),
    };
  }
}
