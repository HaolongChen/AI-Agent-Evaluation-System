import type { IDomainEventBus } from "../../../shared/domain/event/domain-event.bus.ts";
import { CopilotSessionCreatedEvent } from "../../domain/event/copilot-session-created.ts";
import type { ICopilotNetworkService } from "../interface/copilot-network.interface.ts";
import type { ICopilotRepository } from "../../domain/interface/copilot-repository.interface.ts";
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
    private readonly copilotRepository: ICopilotRepository,
    private readonly eventBus: IDomainEventBus,
  ) {}

  private buildCopilotMessageHandler(event: CopilotSessionCreatedEvent) {}

  async onCopilotSessionCreated(event: CopilotSessionCreatedEvent) {}
}

class CopilotMessageHandler {
  private executionLog: CopilotExecutionLog = new CopilotExecutionLog(
    {} as CopilotExecutionLogType,
  );

  private publishMessageSentEvent: (event: CopilotInputEvent) => Promise<void>;

  constructor(
    private readonly copilotRepositoryService: ICopilotRepositoryService,
    private readonly projectService: IZionProjectService,
    copilotNetworkService: ICopilotNetworkService["sendMessageToSession"],
    private readonly copilotSessionExId: string,
    private readonly network: NetworkClient,
    private readonly project: ProjectAggregate,
  ) {
    if (project.state.status !== "active") {
      throw new Error("Project must be active to handle copilot messages.");
    }
    this.publishMessageSentEvent = async (event: CopilotInputEvent) => {
      return copilotNetworkService(
        this.copilotSessionExId,
        this.network,
        event,
      );
    };
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
      return this.copilotRepositoryService.saveLog(
        this.copilotSessionExId,
        this.executionLog,
      );
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
      return this.publishMessageSentEvent(response);
    }
  };
}
