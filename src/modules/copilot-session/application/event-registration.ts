import type { IDomainEventConsumer } from "../../shared/domain/event/domain-event.handler.ts";
import { EventBus } from "../../shared/infrastructure/event-bus.ts";
import type { CopilotExecutionTaskCreatedEvent } from "../domain/event/copilot-execution-task-created.event.ts";
import type { CopilotSessionCreatedEvent } from "../domain/event/copilot-session-created.ts";
import type { ProjectCreatedEvent } from "../domain/event/project-created.event.ts";
import type { ProjectDeletedEvent } from "../domain/event/project-deleted.event.ts";
import { CopilotExecutionTaskCreatedEventConsumer } from "../infrastructure/event-handler/copilot-execution-handler.ts";

export class CopilotSessionEventRegistrationService {
  constructor(
    private readonly copilotExecutionTaskCreatedEventConsumer: IDomainEventConsumer<CopilotExecutionTaskCreatedEvent>,
    private readonly copilotSessionCreatedEventConsumer: IDomainEventConsumer<CopilotSessionCreatedEvent>,
    private readonly projectDeletedEventConsumer: IDomainEventConsumer<ProjectDeletedEvent>,
  ) {}
  registerEventBus() {
    const eventBus = new EventBus(
      "copilot.executionTask.created",
      "copilot.session.started",
      "zionProject.created",
      "zionProject.deleted",
    );

    const newCopilotExecutionTaskCreatedEventConsumer =
      CopilotExecutionTaskCreatedEventConsumer.enableSubscription(
        this
          .copilotExecutionTaskCreatedEventConsumer as CopilotExecutionTaskCreatedEventConsumer,
        (eventConsumer: IDomainEventConsumer<ProjectCreatedEvent>) => {
          eventBus.subscribe(eventConsumer);
        },
      );
    eventBus.subscribe(newCopilotExecutionTaskCreatedEventConsumer);
    eventBus.subscribe(this.copilotSessionCreatedEventConsumer);
    eventBus.subscribe(this.projectDeletedEventConsumer);
    return eventBus;
  }
}
