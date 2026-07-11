/* eslint-disable unicorn/no-null */
import { CopilotSessionCreatedEvent } from "../../domain/event/copilot-session-created.ts";
import type { ICopilotNetworkService } from "../interface/copilot-network.interface.ts";
import { CopilotInputEvent } from "../copilot/copilot-event.ts";
import { CopilotExecutionLog } from "../../domain/value-object/copilot-execution-log.ts";
import type { ICopilotRepositoryService } from "../interface/copilot-repository-service.interface.ts";
import type { NetworkClient } from "../../../account/domain/entity/network-client.entity.ts";
import { CopilotMessageHandler } from "../copilot/copilot-message-handler.ts";
import { CopilotExecutionEventBus } from "../copilot/copilot-execution-event-bus.ts";
import type { CopilotToolCallHandler } from "../copilot/copilot-tool-call-handler.ts";
import type { CopilotExecutionTaskCreatedEvent } from "../../domain/event/copilot-execution-task-created.event.ts";
import type { CopilotSessionEventConsumer } from "../../domain/event/event-map.ts";
import type { ProjectApplicationService } from "../../application/project-service.ts";
import { ProjectCreatedEventConsumer } from "./project-handler.ts";

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
      event.data.projectExId,
      event.data.copilotNetwork,
    );
    const humanInputMessageEvent = new CopilotInputEvent(
      "CopilotHumanInputMessage",
      {
        content: event.data.userInputContent,
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
    protected readonly copilotNetwork: ICopilotNetworkService,
    protected readonly projectApplicationService: ProjectApplicationService,
  ) {}
  handler: CopilotSessionEventConsumer<"copilot.executionTask.created">["handler"] =
    async (event: CopilotExecutionTaskCreatedEvent) => {
      this.subscribe(
        new ProjectCreatedEventConsumer(event, this.projectApplicationService),
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
      consumer.copilotNetwork,
      consumer.projectApplicationService,
    );
  }
}
