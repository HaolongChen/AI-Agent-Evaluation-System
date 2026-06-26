import type { NetworkClient } from "../../../account/domain/entity/network-client.entity.ts";
import type { IEventConsumerFactory } from "../../domain/event/event-consumer-factory.interface.ts";
import type {
  CopilotSessionEventBus,
  CopilotSessionEventConsumer,
} from "../../domain/event/event-map.ts";
import type { ICopilotRepository } from "../../domain/interface/copilot-repository.interface.ts";
import type { IProjectRepository } from "../../domain/interface/project-repository.interface.ts";
import type { IZionProjectService } from "../../domain/interface/project-service.interface.ts";
import { CopilotToolCallHandler } from "../copilot/copilot-tool-call-handler.ts";
import type { ICopilotNetworkService } from "../interface/copilot-network.interface.ts";
import type { ICopilotRepositoryService } from "../interface/copilot-repository-service.interface.ts";
import {
  CopilotExecutionTaskCreatedEventConsumer,
  CopilotSessionCreatedEventConsumer,
} from "./copilot-execution-handler.ts";
import {
  ProjectCreationTaskCreatedEventConsumer,
  ProjectDeletedEventConsumer,
} from "./project-handler.ts";

export class EventConsumerFactory implements IEventConsumerFactory {
  constructor(
    private readonly projectService: IZionProjectService,
    private readonly copilotNetworkService: ICopilotNetworkService,
    private readonly copilotRepositoryService: ICopilotRepositoryService,
    private readonly copilotRepository: ICopilotRepository,
    private readonly projectRepository: IProjectRepository,
  ) {}

  buildCopilotExecutionTaskCreatedEventConsumer(
    eventBus: CopilotSessionEventBus,
  ): CopilotSessionEventConsumer<"copilot.executionTask.created"> {
    return new CopilotExecutionTaskCreatedEventConsumer(
      (eventConsumer: CopilotSessionEventConsumer<"zionProject.created">) => {
        eventBus.subscribe(eventConsumer);
      },
      this.projectService,
      this.copilotNetworkService,
      this.copilotRepository,
    );
  }

  buildProjectCreationTaskCreatedEventConsumer(
    dangerousNetworkClient: NetworkClient,
  ): CopilotSessionEventConsumer<"zionProject.creationTask.created"> {
    return new ProjectCreationTaskCreatedEventConsumer(
      this.projectService,
      dangerousNetworkClient,
      this.projectRepository,
    );
  }

  buildCopilotSessionCreatedEventConsumer(): CopilotSessionEventConsumer<"copilot.session.started"> {
    const copilotToolCallHandler = new CopilotToolCallHandler(
      this.projectService,
    );
    return new CopilotSessionCreatedEventConsumer(
      this.copilotNetworkService,
      this.copilotRepositoryService,
      copilotToolCallHandler,
    );
  }

  buildProjectDeletedEventConsumer(): CopilotSessionEventConsumer<"zionProject.deleted"> {
    return new ProjectDeletedEventConsumer(this.projectService);
  }
}
