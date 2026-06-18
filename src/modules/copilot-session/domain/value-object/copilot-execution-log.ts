import type {
  CopilotExecutionLogType,
  ResponsePolicyEnum,
} from "../schema/copilot-execution-log.schema.ts";

export class CopilotExecutionLog {
  constructor(public readonly data: CopilotExecutionLogType) {}

  log(newData: Partial<CopilotExecutionLogType>): CopilotExecutionLog {
    if (!this.data.editableText && newData.aiResponse)
      throw new Error("incorrect order");
    return new CopilotExecutionLog({
      ...this.data,
      ...newData,
      tasks: [...this.data.tasks, ...(newData.tasks ?? [])],
    });
  }

  get messageForwardPolicy(): ResponsePolicyEnum {
    if (!this.data.editableText) {
      return "HumanInputMessage";
    }
    if (!this.data.aiResponse) {
      return "OperationMessage";
    }
    return "TerminateMessage";
  }
}
