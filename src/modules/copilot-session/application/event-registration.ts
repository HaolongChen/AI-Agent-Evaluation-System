import type {
  CopilotSessionEventBus,
  CopilotSessionEventConsumer,
} from "../domain/event/event-map.ts";
import { CopilotExecutionTaskCreatedEventConsumer } from "../infrastructure/event-handler/copilot-execution-handler.ts";

export class CopilotSessionEventRegistrationService {
  constructor(
    private readonly copilotExecutionTaskCreatedEventConsumer: CopilotSessionEventConsumer<"copilot.executionTask.created">,
    private readonly copilotSessionCreatedEventConsumer: CopilotSessionEventConsumer<"copilot.session.started">,
    private readonly projectDeletedEventConsumer: CopilotSessionEventConsumer<"zionProject.deleted">,
  ) {}
  registerEventBus(eventBus: CopilotSessionEventBus) {
    const newCopilotExecutionTaskCreatedEventConsumer =
      CopilotExecutionTaskCreatedEventConsumer.enableSubscription(
        this
          .copilotExecutionTaskCreatedEventConsumer as CopilotExecutionTaskCreatedEventConsumer,
        (eventConsumer: CopilotSessionEventConsumer<"zionProject.created">) => {
          eventBus.subscribe(eventConsumer);
        },
      );
    eventBus.subscribe(newCopilotExecutionTaskCreatedEventConsumer);
    eventBus.subscribe(this.copilotSessionCreatedEventConsumer);
    eventBus.subscribe(this.projectDeletedEventConsumer);
    return eventBus;
  }
}
