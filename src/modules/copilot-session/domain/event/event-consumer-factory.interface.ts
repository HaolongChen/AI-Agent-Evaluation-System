import type {
  CopilotSessionEventBus,
  CopilotSessionEventConsumer,
} from "./event-map.ts";

export interface IEventConsumerFactory {
  buildCopilotExecutionTaskCreatedEventConsumer(
    eventBus: CopilotSessionEventBus,
  ): CopilotSessionEventConsumer<"copilot.executionTask.created">;

  buildCopilotSessionCreatedEventConsumer(): CopilotSessionEventConsumer<"copilot.session.started">;

  buildProjectDeletedEventConsumer(): CopilotSessionEventConsumer<"zionProject.deleted">;
}
