import { AggregateRoot } from "../../../shared/domain/aggregate/aggregate-root.ts";
import { CopilotExecutionTaskEntity } from "../entity/copilot-execution-task.entity.ts";
import { CopilotExecutionTaskCreatedEvent } from "../event/copilot-execution-task-created.event.ts";
import { copilotExecutionTaskSchema } from "../schema/copilot-execution-task.schema.ts";

export class CopilotExecutionTaskAggregate extends AggregateRoot<
  typeof copilotExecutionTaskSchema
> {
  private constructor(entity: CopilotExecutionTaskEntity) {
    super(entity, {});
  }

  static reconcile(
    copilotInputId: string,
    copilotServerId: string,
    id: string,
  ) {
    const entity = new CopilotExecutionTaskEntity(
      { copilotInputId, copilotServerId },
      id,
    );
    return new CopilotExecutionTaskAggregate(entity);
  }

  static create(copilotInputId: string, copilotServerId: string) {
    const entity = new CopilotExecutionTaskEntity({
      copilotInputId,
      copilotServerId,
    });
    const task = new CopilotExecutionTaskAggregate(entity);
    task.addEvent(new CopilotExecutionTaskCreatedEvent(entity));
    return task;
  }
}
