/* eslint-disable unicorn/no-null */
import type { CopilotApiResultJs } from "../../../shared/domain/interface/type-system.ts";
import type { CopilotExecutionLogType } from "../../domain/schema/copilot-execution-log.schema.ts";
import { CopilotExecutionLog } from "../../domain/value-object/copilot-execution-log.ts";
import {
  CopilotInputEvent,
  type CopilotMessageEvent,
} from "./copilot-event.ts";
import { type ToolCall } from "./copilot-tool-call-handler.ts";

export class CopilotMessageHandler {
  private executionLog: CopilotExecutionLog = new CopilotExecutionLog(
    {} as CopilotExecutionLogType,
  );

  private toolCallResponseTransform(
    results: CopilotApiResultJs,
    toolCallBatchId: string,
  ): {
    responseByToolCallId: unknown;
    toolCallBatchId: string;
    schemaDiff: unknown;
  } {
    return {
      schemaDiff: results.schemaDiff,
      responseByToolCallId: JSON.parse(results.data ?? "{}"),
      toolCallBatchId,
    };
  }

  constructor(
    private readonly humanInputMessageEvent: CopilotInputEvent,
    private readonly runToolCall: (
      toolCalls: ToolCall[],
    ) => Promise<CopilotApiResultJs>,
    private readonly sendMessage: (event: CopilotInputEvent) => Promise<void>,
    private readonly saveLog: (log: CopilotExecutionLog) => Promise<void>,
  ) {}
  publish = async (event: CopilotMessageEvent) => {
    const coreInfo = event.coreInfo;
    if (!coreInfo) return;
    if (coreInfo.type === "record") {
      this.executionLog = this.executionLog.log(coreInfo.content);
      return this.saveLog(this.executionLog);
    }
    if (coreInfo.type === "toolCallBatch") {
      const results = await this.runToolCall(coreInfo.toolCalls);
      const response = new CopilotInputEvent(
        "CopilotToolCallBatchResponseMessage",
        this.toolCallResponseTransform(results, coreInfo.id),
      );
      return this.sendMessage(response);
    }
    if (coreInfo.type === "stateChange") {
      if (!coreInfo.significance) {
        return;
      }
      switch (this.executionLog.messageForwardPolicy) {
        case "HumanInputMessage": {
          return this.sendMessage(this.humanInputMessageEvent);
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
