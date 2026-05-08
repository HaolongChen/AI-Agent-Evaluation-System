import { prisma } from "../../../../config/prisma.ts";
import { repositoryDateMapper } from "../../../shared/infrastructure/repository.ts";
import { AgentFeedbackEntity } from "../../domain/entity/agent-feedback.entity.js";
import type { IAgentFeedbackRepository } from "../../domain/interface/agent-feedback.interface.ts";

export class AgentFeedbackRepository implements IAgentFeedbackRepository {
  async save(entity: AgentFeedbackEntity): Promise<void> {
    const result = await prisma.rubric.update({
      where: { id: entity.data.rubricId },
      data: {
        agentFeedbacks: {
          updateMany: {
            where: { agentName: entity.data.agentName },
            data: { feedback: { push: entity.data.feedback } },
          },
        },
      },
      include: { agentFeedbacks: true },
    });
    repositoryDateMapper(result, entity);
  }
  async findById(id: string): Promise<AgentFeedbackEntity> {
    const agentFeedback = await prisma.agentFeedbacks.findUnique({
      where: { id },
    });
    if (!agentFeedback) {
      throw new Error(`AgentFeedback with ID ${id} not found`);
    }
    return repositoryDateMapper(
      agentFeedback,
      new AgentFeedbackEntity(agentFeedback, agentFeedback.id),
    );
  }
}
