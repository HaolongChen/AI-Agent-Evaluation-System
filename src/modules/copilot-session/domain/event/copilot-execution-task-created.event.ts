import type { IDomainEvent } from "../../../shared/domain/event/domain-event.interface.ts";
import type { CopilotExecutionTaskEntity } from "../entity/copilot-execution-task.entity.ts";

export class CopilotExecutionTaskCreatedEvent implements IDomainEvent {
  readonly name = "copilot.executionTask.created";
  readonly createdAt = new Date();

  constructor(readonly data: CopilotExecutionTaskEntity) {}
}
