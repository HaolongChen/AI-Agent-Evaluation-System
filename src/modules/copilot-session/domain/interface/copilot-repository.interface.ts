import type { CopilotExecutionAggregate } from "../aggregate/copilot-execution.aggregate.ts";

export interface ICopilotRepository {
  save(copilotExecution: CopilotExecutionAggregate
  ): Promise<void>;

  getProjectExId ( projectId: string ): Promise<string>;

}
