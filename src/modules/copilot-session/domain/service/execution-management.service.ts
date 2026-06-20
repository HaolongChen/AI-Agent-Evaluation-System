import type { CopilotExecutionAggregate } from "../aggregate/copilot-execution.aggregate.ts";
import type { ProjectAggregate } from "../aggregate/project.aggregate.ts";

export class ExecutionManagementService {
  validateExecution(copilotExecution: CopilotExecutionAggregate);
}
