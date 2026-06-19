/* eslint-disable unicorn/no-null */
import type { ProjectAggregate } from "../../domain/aggregate/project.aggregate.ts";
import type { IZionProjectService } from "../../domain/interface/project-service.interface.ts";
import type { CopilotExecutionLogType } from "../../domain/schema/copilot-execution-log.schema.ts";
import { CopilotExecutionLog } from "../../domain/value-object/copilot-execution-log.ts";
import {
  CopilotInputEvent,
  type CopilotMessageEvent,
} from "./copilot-event.ts";
import { runCopilotToolCalls } from "./copilot-tool-call-handler.ts";

export class CopilotMessageHandler {
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
