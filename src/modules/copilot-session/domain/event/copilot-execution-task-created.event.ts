import { DomainEventService, type IDomainEvent } from "../../../shared/domain/event/domain-event.interface.ts";
import type { CopilotExecutionAggregate } from "../aggregate/copilot-execution.aggregate.ts";


export const copilotExecutionTaskCreatedEventService = new DomainEventService<
  {
    copilotExecution: CopilotExecutionAggregate;
    projectId: string;
  }
>("copilot.executionTask.created");

export class CopilotExecutionTaskCreatedEvent implements ICopilotExecutionTaskCreatedEvent {
  readonly name = "copilot.executionTask.created";
  readonly createdAt = new Date();

  constructor(
    readonly data: {
      copilotExecution: CopilotExecutionAggregate;
      projectId: string;
    },
  ) {}
}
