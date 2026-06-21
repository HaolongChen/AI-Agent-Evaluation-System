import type { IDomainEvent } from "../../../shared/domain/event/domain-event.interface.ts";
import type { CopilotExecutionAggregate } from "../aggregate/copilot-execution.aggregate.ts";

export class CopilotExecutionTaskCreatedEvent implements IDomainEvent {
  readonly name = "copilot.executionTask.created";
  readonly createdAt = new Date();

  constructor(
    public readonly copilotExecution: CopilotExecutionAggregate,
    public readonly projectId: string,
  ) {}
}
