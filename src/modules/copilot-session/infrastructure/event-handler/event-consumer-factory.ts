import type { ProjectApplicationService } from "../../application/project-service.ts";
import type { IEventConsumerFactory } from "../../domain/event/event-consumer-factory.interface.ts";
import type {
  CopilotSessionEventBus,
  CopilotSessionEventConsumer,
} from "../../domain/event/event-map.ts";
import type { IZionProjectService } from "../../domain/interface/project-service.interface.ts";
import { CopilotToolCallHandler } from "../copilot/copilot-tool-call-handler.ts";
import type { ICopilotNetworkService } from "../interface/copilot-network.interface.ts";
import type { ICopilotRepositoryService } from "../interface/copilot-repository-service.interface.ts";
import {
  CopilotExecutionTaskCreatedEventConsumer,
  CopilotSessionCreatedEventConsumer,
} from "./copilot-execution-handler.ts";
import { ProjectDeletedEventConsumer } from "./project-handler.ts";

export class EventConsumerFactory implements IEventConsumerFactory {
  constructor(
    private readonly projectService: IZionProjectService,
    private readonly copilotNetworkService: ICopilotNetworkService,
    private readonly copilotRepositoryService: ICopilotRepositoryService,
    private readonly projectApplicationService: ProjectApplicationService,
  ) {}

  buildCopilotExecutionTaskCreatedEventConsumer(
    eventBus: CopilotSessionEventBus,
  ): CopilotSessionEventConsumer<"copilot.executionTask.created"> {
    return new CopilotExecutionTaskCreatedEventConsumer(
      (eventConsumer: CopilotSessionEventConsumer<"zionProject.created">) => {
        eventBus.subscribe(eventConsumer);
      },
      this.copilotNetworkService,
      this.projectApplicationService,
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
