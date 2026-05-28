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
import type { ICopilotSessionRepository } from "../../copilot-session/domain/interface/copilot-session.interface.ts";

export class GenerateRubricUseCase {
  constructor(
    private repository: {
      rubricRepository: IRubricRepository;
      copilotInputRepository: ICopilotInputRepository;
      copilotSessionRepository: ICopilotSessionRepository;
      agentFeedbackRepository: IRepository<AgentFeedbackEntity>;
    },
  ) {}

  async execute(goldenSetId: string, userInputId: string) {
    const copilotSessions =
      await this.repository.copilotSessionRepository.getByCopilotInput(
        await this.repository.copilotInputRepository.getByFilters({
          goldenSetId,
          userInputId,
        }),
      );
    const saveFeedbacksUseCase = new SaveFeedbacksUseCase(
      this.repository.agentFeedbackRepository,
    );
    const results = await Promise.all(
      copilotSessions.map(async (session) => {
        const schemaId = session
          .getEntity("copilotInput")
          .getEntity("goldenSet")
          .getData("schemaId");
        const query = session
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
        const rubricAggregate = new RubricAggregate(session, rubricId);
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
      }),
    );
    return results;
  }
}
