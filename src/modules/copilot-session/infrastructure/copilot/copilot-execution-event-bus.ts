import type { CopilotExecutionLog } from "../../domain/value-object/copilot-execution-log.ts";
import type { CopilotInputEvent } from "./copilot-event.ts";

export class CopilotExecutionEventBus {
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
