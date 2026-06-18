import type { NetworkAccount } from "../../../account/domain/service/account.service.ts";
import type { CopilotExecutionLogType } from "../schema/copilot-output.schema.ts";
import { CopilotInputEvent } from "../entity/copilot-job.entity.ts";

export class CopilotExecutionService {
  constructor(private readonly networkAccount: NetworkAccount) {}

  executionLogFinalizationPolicy(log: CopilotExecutionLogType): boolean {
    if (log.aiResponse && !log.editableText) throw new Error("incorrect order");
    return !!(log.aiResponse && log.editableText);
  }

  responseToSend(log: CopilotExecutionLogType): CopilotInputEvent {
    if (this.executionLogFinalizationPolicy(log)) {
      return new CopilotInputEvent("TERMINATE", { log });
    }
    if (log.editableText) {
      return new CopilotInputEvent("HUMAN_OPERATION", {
        log,
        humanOperationType: "CONTINUE",
      });
    }
    return new CopilotInputEvent("HUMAN_INPUT", {
      log,
      content: log.userInput,
    });
  }
}
