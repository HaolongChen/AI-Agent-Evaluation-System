/* eslint-disable unicorn/no-null */
import type { IDomainEventBus } from "../../../shared/domain/event/domain-event.bus.ts";
import { CopilotSessionCreatedEvent } from "../../domain/event/copilot-session-created.ts";
import type { ICopilotNetworkService } from "../interface/copilot-network.interface.ts";
import type { IZionProjectService } from "../../domain/interface/project-service.interface.ts";
import {
  CopilotInputEvent,
  type CopilotMessageEvent,
} from "../copilot/copilot-event.schema.ts";
import type { CopilotExecutionLogType } from "../../domain/schema/copilot-execution-log.schema.ts";
import { CopilotExecutionLog } from "../../domain/value-object/copilot-execution-log.ts";
import type { ICopilotRepositoryService } from "../interface/copilot-repository-service.interface.ts";
import type { NetworkClient } from "../../../account/domain/entity/network-client.entity.ts";
import { runCopilotToolCalls } from "../copilot/copilot-tool-call-handler.ts";
import type { ProjectAggregate } from "../../domain/aggregate/project.aggregate.ts";

export class CopilotExecutionHandler {
  constructor(
    private readonly copilotNetwork: ICopilotNetworkService,
    private readonly projectService: IZionProjectService,
    private readonly copilotRepositoryService: ICopilotRepositoryService,
    private readonly eventBus: IDomainEventBus,
  ) {}

  private onMessageSent = (
    copilotSessionExId: string,
    copilotNetwork: NetworkClient,
    messageEventListener: (event: CopilotInputEvent) => Promise<void>,
  ) => {
    return async (event: CopilotInputEvent) => {
      await this.copilotNetwork.sendMessageToSession(
        copilotSessionExId,
        copilotNetwork,
        event,
      );
      return messageEventListener(event);
    };
  };

  private onExecutionLogUpdated = (copilotSessionExId: string) => {
    return async (log: CopilotExecutionLog) => {
      return this.copilotRepositoryService.saveLog(copilotSessionExId, log);
    };
  };

  async onCopilotSessionCreated(event: CopilotSessionCreatedEvent) {
    const copilotExecutionEventBus = new CopilotExecutionEventBus();
    copilotExecutionEventBus.subscribeToMessageSentEvent(
      this.onMessageSent(
        event.copilotSessionExId,
        event.copilotNetwork,
        copilotExecutionEventBus.publishMessageSentEvent,
      ),
    );
    copilotExecutionEventBus.subscribeToExecutionLogUpdatedEvent(
      this.onExecutionLogUpdated(event.copilotSessionExId),
    );
    const handler = new CopilotMessageHandler(
      this.projectService,
      event.project,
      copilotExecutionEventBus.publishMessageSentEvent,
      copilotExecutionEventBus.publishExecutionLogUpdatedEvent,
    );
    const unsubscribe = this.copilotNetwork.subscribeToSessionUpdates(
      event.copilotSessionExId,
      event.copilotNetwork,
      handler.publish,
    );
    copilotExecutionEventBus.subscribeToMessageSentEvent(
      async (event: CopilotInputEvent) => {
        if (event.message.copilotMessageType === "TERMINATE") {
          unsubscribe();
        }
      },
    );
  }
}

class CopilotExecutionEventBus {
  private handlers: {
    messageSentEvent: ((event: CopilotInputEvent) => Promise<void>)[];
    executionLogUpdatedEvent: ((log: CopilotExecutionLog) => Promise<void>)[];
  } = { executionLogUpdatedEvent: [], messageSentEvent: [] };

  subscribeToMessageSentEvent = (
    handler: (event: CopilotInputEvent) => Promise<void>,
  ) => {
    this.handlers.messageSentEvent.push(handler);
  };

  subscribeToExecutionLogUpdatedEvent = (
    handler: (log: CopilotExecutionLog) => Promise<void>,
  ) => {
    this.handlers.executionLogUpdatedEvent.push(handler);
  };

  publishMessageSentEvent = async (event: CopilotInputEvent) => {
    await Promise.all(
      this.handlers.messageSentEvent.map((handler) => handler(event)),
    );
  };

  publishExecutionLogUpdatedEvent = async (log: CopilotExecutionLog) => {
    await Promise.all(
      this.handlers.executionLogUpdatedEvent.map((handler) => handler(log)),
    );
  };
}

class CopilotMessageHandler {
  private executionLog: CopilotExecutionLog = new CopilotExecutionLog(
    {} as CopilotExecutionLogType,
  );

  constructor(
    private readonly projectService: IZionProjectService,
    private readonly project: ProjectAggregate,
    private readonly sendMessage: (event: CopilotInputEvent) => Promise<void>,
    private readonly saveLog: (log: CopilotExecutionLog) => Promise<void>,
  ) {
    if (project.state.status !== "active") {
      throw new Error("Project must be active to handle copilot messages.");
    }
  }

  private getProjectExId = () =>
    this.project.state.status === "active"
      ? this.project.state.projectExId
      : undefined;

  publish = async (event: CopilotMessageEvent) => {
    const coreInfo = event.coreInfo;
    if (!coreInfo) return;
    if (coreInfo.type === "record") {
      this.executionLog = this.executionLog.log(coreInfo.content);
      return this.saveLog(this.executionLog);
    }
    if (coreInfo.type === "toolCallBatch") {
      const schemaGraph = await this.projectService.getSchemaGraph(
        this.getProjectExId()!,
        this.project.network,
      );
      const results = runCopilotToolCalls(coreInfo.toolCalls, schemaGraph);
      const response = new CopilotInputEvent(
        "CopilotToolCallBatchResponseMessage",
        {
          toolCallBatchId: coreInfo.id,
          schemaDiff: results.schemaDiff,
          responseByToolCallId: JSON.parse(results.data ?? "{}"),
        },
      );
      return this.sendMessage(response);
    }
    if (coreInfo.type === "stateChange") {
      if (!coreInfo.significance) {
        return;
      }
      switch (this.executionLog.messageForwardPolicy) {
        case "HumanInputMessage": {
          return this.sendMessage(
            new CopilotInputEvent("CopilotHumanInputMessage", {
              content: this.project.getEntity("copilotInput").userInput,
              context: null,
            }),
          );
        }
        case "OperationMessage": {
          return this.sendMessage(
            new CopilotInputEvent("CopilotHumanOperationMessage", {
              humanOperationType: "CONTINUE",
              optionalContent: null,
            }),
          );
        }
        case "TerminateMessage": {
          return this.sendMessage(
            new CopilotInputEvent("CopilotTerminateMessage", {
              reason: "Copilot execution log indicates termination.",
            }),
          );
        }
        default: {
          return;
        }
      }
    }
  };
}
