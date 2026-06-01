import { generateRubrics } from "./rubricsGenerator/rubrics-generator.ts";
import type { ICopilotInputRepository } from "../../dataset/domain/interface/copilot-input.interface.ts";
import type { IRubricRepository } from "../domain/interface/rubric.interface.ts";
import { RubricAggregate } from "../domain/aggregate/rubric.aggregate.ts";
import { CriteriaEntity } from "../domain/entity/rubric.entity.ts";
import type { IRepository } from "../../shared/domain/interface/repository.interface.ts";
import type { AgentFeedbackEntity } from "../domain/entity/agent-feedback.entity.ts";
import { SaveFeedbacksUseCase } from "./save-feedbacks.ts";
import {
  Feedback,
  feedbacksgetData,
  type Feedbacks,
} from "../domain/service/feedback.service.js";
import { randomUUID } from "node:crypto";
import type { IProjectRepository } from "../../copilot-session/domain/interface/project.interface.ts";

export class GenerateRubricUseCase {
  constructor(
    private repository: {
      rubricRepository: IRubricRepository;
      copilotInputRepository: ICopilotInputRepository;
      agentFeedbackRepository: IRepository<AgentFeedbackEntity>;
      projectRepository: IProjectRepository;
    },
  ) {}

  async execute(projectId: string) {
    const project = await this.repository.projectRepository.findById(projectId);
    const saveFeedbacksUseCase = new SaveFeedbacksUseCase(
      this.repository.agentFeedbackRepository,
    );
    const schemaId = project
      .getEntity("copilotInput")
      .getEntity("goldenSet")
      .getData("schemaId");
    const query = project
      .getEntity("copilotInput")
      .getEntity("userInput")
      .getData("content");
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
    const rubricAggregate = new RubricAggregate(project, rubricId);
    rubricAggregate.pushEntity(
      "criterion",
      criterion.map((criteria) => new CriteriaEntity(criteria)),
    );
    await this.repository.rubricRepository.save(rubricAggregate);
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
