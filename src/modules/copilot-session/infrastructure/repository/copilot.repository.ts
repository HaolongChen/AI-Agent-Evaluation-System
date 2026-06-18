import { prisma } from "../../../../config/prisma.ts";
import type { IDomainEventBus } from "../../../shared/domain/event/domain-event.bus.ts";
import type { CopilotExecutionAggregate } from "../../domain/aggregate/copilot-execution.aggregate.ts";
import type { ICopilotRepository } from "../../domain/interface/copilot-repository.interface.ts";
import type { CopilotExecutionLog } from "../../domain/value-object/copilot-execution-log.ts";
import type { ICopilotRepositoryService } from "../interface/copilot-repository-service.interface.ts";

export class CopilotRepository implements ICopilotRepository {
  constructor(private readonly eventBus: IDomainEventBus) {}

  async save(entity: CopilotExecutionAggregate): Promise<void> {
    const { id, copilotServerId } = entity.getData();
    await prisma.copilotOutput.create({ data: { id, copilotServerId } });
    const events = entity.events;
    await this.eventBus.publishAll(events);
  }
  async findById(id: string): Promise<CopilotExecutionAggregate> {
    throw new Error("Method not implemented.");
  }
}

export class CopilotRepositoryService implements ICopilotRepositoryService {
  async addProject(projectExId: string, id: string): Promise<void> {
    await prisma.copilotOutput.update({
      where: { id },
      data: {
        project: {
          connect: { projectExId },
        },
      },
    });
  }
  async saveSession(copilotSessionExId: string, id: string): Promise<void> {
    await prisma.copilotOutput.update({
      where: { id },
      data: { copilotSessionExId },
    });
  }
  async saveLog(
    copilotSessionExId: string,
    log: CopilotExecutionLog,
  ): Promise<void> {
    const { editableText, aiResponse, tasks } = log.data;
    await prisma.copilotOutput.update({
      where: { copilotSessionExId },
      data: {
        ...(editableText ? { editableText } : {}),
        ...(aiResponse ? { aiResponse } : {}),
        tasks: {
          set: tasks,
        },
      },
    });
  }
}
