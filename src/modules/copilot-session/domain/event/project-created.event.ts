import type { IDomainEvent } from "../../../shared/domain/event/domain-event.interface.ts";
import type { ProjectTypeOfCopilotExecution } from "../schema/copilot.schema.ts";

export class ProjectCreatedEvent implements IDomainEvent {
  readonly name = "zionProject.created";
  readonly createdAt: Date = new Date();

  constructor(readonly data: ProjectTypeOfCopilotExecution) {}
}
