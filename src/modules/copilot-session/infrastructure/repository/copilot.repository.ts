import { prisma } from "../../../../config/prisma.ts";
import type { CopilotExecutionAggregate } from "../../domain/aggregate/copilot-execution.aggregate.ts";
import type { ICopilotRepository } from "../../domain/interface/copilot-repository.interface.ts";

export class CopilotRepository implements ICopilotRepository {
  async save(entity: CopilotExecutionAggregate): Promise<void> {
    await prisma.copilotOutput.upsert({
      where: {
        projectId: entity.getData("projectId"),
      },
      update: {
        ...entity.executionLogs,
        copilotSessionExId: entity.getData("copilotSessionExId"),
      },
      create: {
        ...entity.executionLogs,
        projectId: entity.getData("projectId"),
        copilotSessionExId: entity.getData("copilotSessionExId"),
      },
    });
  }
  async findById(id: string): Promise<CopilotExecutionAggregate> {
    throw new Error("Method not implemented.");
  }
}
