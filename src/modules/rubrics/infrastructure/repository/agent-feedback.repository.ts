import { prisma } from "../../../../config/prisma.ts";
import { AgentNameType } from "../../../../prisma/build/generated/prisma/enums.js";
import { repositoryDateMapper } from "../../../shared/infrastructure/repository.ts";
import { AgentFeedbackEntity } from "../../domain/entity/agent-feedback.entity.js";
import type { IAgentFeedbackRepository } from "../../domain/interface/agent-feedback.interface.ts";
import type { AgentName } from "../../domain/schema/agent-feedback.schema.ts";

function agentNameMapperToRepository(agentName: AgentName): AgentNameType {
  return agentName.replaceAll("-", "_") as AgentNameType;
}

function agentNameMapperFromRepository(agentName: AgentNameType): AgentName {
  return agentName.replaceAll("_", "-") as AgentName;
}

export class AgentFeedbackRepository implements IAgentFeedbackRepository {
  async save(entity: AgentFeedbackEntity): Promise<void> {
    const result = await prisma.rubric.update({
      where: { id: entity.data.rubricId },
      data: {
        agentFeedbacks: {
          updateMany: {
            where: {
              agentName: agentNameMapperToRepository(entity.data.agentName),
            },
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
      new AgentFeedbackEntity(
        {
          ...agentFeedback,
          agentName: agentNameMapperFromRepository(agentFeedback.agentName),
        },
        agentFeedback.id,
      ),
    );
  }
}
