import type { CopilotExecutionAggregate } from "../aggregate/copilot-execution.aggregate.ts";

export interface IProjectManager {
  createProject(copilotExecution: CopilotExecutionAggregate): void;
}
