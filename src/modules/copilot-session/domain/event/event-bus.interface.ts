import type { IDomainEventBus } from "../../../shared/domain/event/domain-event.bus.ts";
import { copilotExecutionTaskCreatedEventService } from "./copilot-execution-task-created.event.ts";
import type {  copilotSessionCreatedEventService } from "./copilot-session-created.ts";
import { projectCreationTaskCreatedEventService } from "./project-created.event.ts";
import type {  projectDeletedEventService } from "./project-deleted.event.ts";

export type ICopilotSessionEventBus = IDomainEventBus<readonly [typeof copilotExecutionTaskCreatedEventService, typeof copilotSessionCreatedEventService, typeof projectCreationTaskCreatedEventService, typeof projectDeletedEventService]>;
