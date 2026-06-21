import { AggregateRoot } from "../../../shared/domain/aggregate/aggregate-root.ts";
import { copilotOutputSchema } from "../schema/copilot-output.schema.ts";
import {
  Entity,
  type EntityMetadata,
} from "../../../shared/domain/entity/entity.ts";
import type { ProjectAggregate } from "./project.aggregate.ts";
import type { CopilotExecutionAggregate } from "./copilot-execution.aggregate.ts";
import type { CopilotExecutionLog } from "../value-object/copilot-execution-log.ts";

export class CopilotOutputAggregate extends AggregateRoot<
  typeof copilotOutputSchema,
  EntityMetadata,
  { project: ProjectAggregate }
> {
  constructor(
    copilotExecution: CopilotExecutionAggregate,
    executionLog: CopilotExecutionLog,
  ) {
    if (copilotExecution.state.status === "pending") {
      throw new Error(
        "Cannot create CopilotOutputAggregate for a pending execution.",
      );
    }
    const project = copilotExecution.project;
    const copilotSessionExId = copilotExecution.state.copilotSessionExId;
    if (!copilotSessionExId || !project) {
      throw new Error("Invalid copilot execution data.");
    }
    super(
      new Entity<typeof copilotOutputSchema>(
        {
          copilotSessionExId,
          ...executionLog.data,
        },
        copilotOutputSchema,
        { id: copilotExecution.getData("id") },
      ),
      { project: copilotExecution.project! },
    );
  }
}
