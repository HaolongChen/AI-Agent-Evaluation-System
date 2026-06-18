import { prisma } from "../../../../config/prisma.ts";
import type { IDomainEventBus } from "../../../shared/domain/event/domain-event.bus.ts";
import {
  CopilotExecutionStarted,
  CopilotSessionCreatedEvent,
} from "../../domain/event/copilot-session-created.ts";
import type { ICopilotNetworkService } from "../../domain/interface/copilot-network.interface.ts";
import type { ICopilotRepository } from "../../domain/interface/copilot-repository.interface.ts";
import type { IZionProjectService } from "../../domain/interface/project-service.interface.ts";

export class CopilotExecutionHandler {
  constructor(
    private readonly copilotNetwork: ICopilotNetworkService,
    private readonly projectService: IZionProjectService,
    private readonly copilotRepository: ICopilotRepository,
    private readonly eventBus: IDomainEventBus,
  ) {}
  async onCopilotSessionCreated(event: CopilotSessionCreatedEvent) {
    const copilotSessionExId = await this.projectService.createCopilotSession(
      event.projectExId,
      event.networkClient,
    );
    await prisma.copilotOutput.upsert({
      where: { id: event.copilotExecutionId },
      update: { ...event, copilotSessionExId },
      create: { ...event, copilotSessionExId },
    });
    await this.eventBus.publish(
      new CopilotExecutionStarted(
        {
          copilotSessionExId,
          projectExId: event.projectExId,
          userInput: event.userInput,
          tasks: [],
        },
        event.networkClient,
      ),
    );
  }

  async onCopilotExecutionStarted(event: CopilotExecutionStarted) {}
}
