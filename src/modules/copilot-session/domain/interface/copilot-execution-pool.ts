import type { CopilotExecutionAggregate } from "../aggregate/copilot-execution.aggregate.ts";
import type { ProjectAggregate } from "../aggregate/project.aggregate.ts";

export interface ICopilotExecutionPool {
  register(
    id: string,
    copilotExecutionAggregate: CopilotExecutionAggregate,
  ): void;

  publish(id: string, project: ProjectAggregate): Promise<void>;
}
