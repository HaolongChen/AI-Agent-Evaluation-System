import type { IDomainEventBus } from "../../../shared/domain/event/domain-event.bus.ts";
import type { IDomainEventConsumer } from "../../../shared/domain/event/domain-event.handler.ts";
import type { EventMap } from "../../../shared/domain/event/domain-event.interface.ts";
import type { CopilotExecutionTaskCreatedEvent } from "./copilot-execution-task-created.event.ts";
import type { CopilotSessionCreatedEvent } from "./copilot-session-created.ts";
import type { ProjectCreatedEvent } from "./project-created.event.ts";
import type { ProjectDeletedEvent } from "./project-deleted.event.ts";

export type CopilotSessionEventMap = EventMap<
  [
    CopilotExecutionTaskCreatedEvent,
    CopilotSessionCreatedEvent,
    ProjectCreatedEvent,
    ProjectDeletedEvent,
  ]
>;

export type CopilotSessionEventConsumer<
  T extends keyof CopilotSessionEventMap,
> = IDomainEventConsumer<CopilotSessionEventMap, T>;
export type CopilotSessionEventBus = IDomainEventBus<CopilotSessionEventMap>;
