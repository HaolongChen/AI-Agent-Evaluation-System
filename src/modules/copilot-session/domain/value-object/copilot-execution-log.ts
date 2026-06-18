import type { CopilotExecutionLogType } from "../schema/copilot-execution-log.schema.ts";

export class CopilotExecutionLog {
  constructor(public readonly data: CopilotExecutionLogType) {}

  extend(newData: Partial<CopilotExecutionLogType>): CopilotExecutionLog {
    if (!this.data.editableText && newData.aiResponse)
      throw new Error("incorrect order");
    return new CopilotExecutionLog({
      ...this.data,
      ...newData,
      tasks: [...this.data.tasks, ...(newData.tasks ?? [])],
    });
  }
}
