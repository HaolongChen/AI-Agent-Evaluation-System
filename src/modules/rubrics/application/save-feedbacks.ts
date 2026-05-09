import { AgentFeedbackEntity } from "../domain/entity/agent-feedback.entity.ts";
import type { IAgentFeedbackRepository } from "../domain/interface/agent-feedback.interface.ts";
import type { AgentName } from "../domain/schema/agent-feedback.schema.ts";
import type { Feedback } from "../domain/service/feedback.service.ts";

export class SaveFeedbacksUseCase {
  constructor(private agentFeedbackRepository: IAgentFeedbackRepository) {}

  async execute(
    Feedbacks: { [key in AgentName]: Feedback<key> },
    rubricId: string,
  ) {
    for (const name in Feedbacks) {
      const agentName = name as AgentName;
      const feedback = Feedbacks[agentName].getFeedbacks();

      const feedbackEntity = new AgentFeedbackEntity({
        rubricId,
        feedback,
        agentName,
      });

      await this.agentFeedbackRepository.save(feedbackEntity);
    }
  }
}
