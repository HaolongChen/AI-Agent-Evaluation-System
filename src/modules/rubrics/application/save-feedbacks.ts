import { AgentFeedbackEntity } from "../domain/entity/agent-feedback.entity.ts";
import type { IRepository } from "../../shared/domain/interface/repository.interface.ts";
import type { AgentName } from "../domain/schema/agent-feedback.schema.ts";
import type { Feedbacks } from "../domain/service/feedback.service.ts";

export class SaveFeedbacksUseCase {
  constructor(
    private agentFeedbackRepository: IRepository<AgentFeedbackEntity>,
  ) {}

  async execute(feedbacks: Feedbacks, rubricId: string) {
    for (const name in feedbacks) {
      const agentName = name as AgentName;
      const feedback = feedbacks[agentName].getFeedbacks();

      const feedbackEntity = new AgentFeedbackEntity({
        rubricId,
        feedback,
        agentName,
      });

      await this.agentFeedbackRepository.save(feedbackEntity);
    }
  }
}
