/* eslint-disable unicorn/no-null */
import { CopilotSessionCreatedEvent } from "../../domain/event/copilot-session-created.ts";
import type { ICopilotNetworkService } from "../interface/copilot-network.interface.ts";
import type { IZionProjectService } from "../../domain/interface/project-service.interface.ts";
import { CopilotInputEvent } from "../copilot/copilot-event.ts";
import { CopilotExecutionLog } from "../../domain/value-object/copilot-execution-log.ts";
import type { ICopilotRepositoryService } from "../interface/copilot-repository-service.interface.ts";
import type { NetworkClient } from "../../../account/domain/entity/network-client.entity.ts";
import { CopilotMessageHandler } from "../copilot/copilot-message-handler.ts";
import { CopilotExecutionEventBus } from "../copilot/copilot-execution-event-bus.ts";
import type { CopilotToolCallHandler } from "../copilot/copilot-tool-call-handler.ts";
import type { CopilotExecutionTaskCreatedEvent } from "../../domain/event/copilot-execution-task-created.event.ts";
import type { ProjectCreatedEvent } from "../../domain/event/project-created.event.ts";
import type { ICopilotRepository } from "../../domain/interface/copilot-repository.interface.ts";
import type { CopilotSessionEventConsumer } from "../../domain/event/event-map.ts";

export class CopilotSessionCreatedEventConsumer implements CopilotSessionEventConsumer<"copilot.session.started"> {
  constructor(
    private readonly copilotNetwork: ICopilotNetworkService,
    private readonly copilotRepositoryService: ICopilotRepositoryService,
    private readonly copilotToolCallHandler: CopilotToolCallHandler,
  ) {}
  eventName = "copilot.session.started" as const;
  isActive: boolean = true;

  private onMessageSent = (
    copilotSessionExId: string,
    copilotNetwork: NetworkClient,
  ) => {
    return async (event: CopilotInputEvent) => {
      return this.copilotNetwork.sendMessageToSession(
        copilotSessionExId,
        copilotNetwork,
        event,
      );
    };
  };

  private onExecutionLogUpdated = (copilotSessionExId: string) => {
    return async (log: CopilotExecutionLog) => {
      return this.copilotRepositoryService.saveLog(copilotSessionExId, log);
    };
  };

  handler = async (event: CopilotSessionCreatedEvent) => {
    const copilotExecutionEventBus = new CopilotExecutionEventBus();
    copilotExecutionEventBus.subscribeToMessageSentEvent(
      this.onMessageSent(
        event.data.copilotSessionExId,
        event.data.copilotNetwork,
      ),
    );
    copilotExecutionEventBus.subscribeToExecutionLogUpdatedEvent(
      this.onExecutionLogUpdated(event.data.copilotSessionExId),
    );
    const copilotToolCallRunner = this.copilotToolCallHandler.setStaticProject(
      event.data.project,
    );
    const humanInputMessageEvent = new CopilotInputEvent(
      "CopilotHumanInputMessage",
      {
        content: event.data.project.getEntity("copilotInput").userInput,
        context: null,
      },
    );
    const handler = new CopilotMessageHandler(
      humanInputMessageEvent,
      copilotToolCallRunner,
      copilotExecutionEventBus.publishMessageSentEvent,
      copilotExecutionEventBus.publishExecutionLogUpdatedEvent,
    );
    const unsubscribe = this.copilotNetwork.subscribeToSessionUpdates(
      event.data.copilotSessionExId,
      event.data.copilotNetwork,
      handler.publish,
    );
    copilotExecutionEventBus.subscribeToMessageSentEvent(
      async (inputEvent: CopilotInputEvent) => {
        if (inputEvent.message.copilotMessageType === "TERMINATE") {
          unsubscribe();
          event.data.project.release();
          return this.copilotRepositoryService.complete(
            event.data.copilotSessionExId,
          );
        }
      },
    );
  };
}

export class CopilotExecutionTaskCreatedEventConsumer implements CopilotSessionEventConsumer<"copilot.executionTask.created"> {
  isActive: boolean = true;
  eventName = "copilot.executionTask.created" as const;
  constructor(
    private readonly subscribe: (
      eventConsumer: CopilotSessionEventConsumer<"zionProject.created">,
    ) => void,
    protected readonly projectService: IZionProjectService,
    protected readonly copilotNetwork: ICopilotNetworkService,
    protected readonly copilotRepository: ICopilotRepository,
  ) {}
  handler: CopilotSessionEventConsumer<"copilot.executionTask.created">["handler"] =
    async (event: CopilotExecutionTaskCreatedEvent) => {
      this.subscribe(
        new ProjectCreatedEventConsumer(
          event,
          this.projectService,
          this.copilotRepository,
        ),
      );
    };
  static enableSubscription(
    consumer: CopilotExecutionTaskCreatedEventConsumer,
    subscribe: (
      eventConsumer: CopilotSessionEventConsumer<"zionProject.created">,
    ) => void,
  ) {
    return new CopilotExecutionTaskCreatedEventConsumer(
      subscribe,
      consumer.projectService,
      consumer.copilotNetwork,
      consumer.copilotRepository,
    );
  }
}

class ProjectCreatedEventConsumer implements CopilotSessionEventConsumer<"zionProject.created"> {
  isActive: boolean = true;
  eventName = "zionProject.created" as const;
  constructor(
    private readonly context: CopilotExecutionTaskCreatedEvent,
    private readonly projectService: IZionProjectService,
    private readonly copilotRepository: ICopilotRepository,
  ) {}
  handler = async (event: ProjectCreatedEvent) => {
    if (this.context.data.copilotInputId !== event.data.project.getData("copilotInputId")) {
      return;
    }
    if ( this.context.data.copilotExecution.state.status !== "pending" || event.data.project.state.status !== "active" )
    {
      throw new Error(`Invalid state for copilot execution or project. Copilot execution status: ${this.context.data.copilotExecution.state.status}, Project status: ${event.data.project.state.status}`);
    }
    await this.projectService.createSafeCopilotSession(
      event.data.project,
      this.context.data.copilotExecution,
    );
    await this.copilotRepository.save(this.context.data.copilotExecution);
    this.isActive = false;
  };
}
