import type { CopilotExecutionAggregate } from "../aggregate/copilot-execution.aggregate.ts";
import type { ProjectAggregate } from "../aggregate/project.aggregate.ts";

export class CopilotProjectMatchingService
{
  isHealthyMatch ( copilotExecution: CopilotExecutionAggregate, project: ProjectAggregate ): boolean
  {
    if(copilotExecution.state.status !== "pending" || project.state.status !== "active")
    {
      return false;
    }
    return true;
  }
  isIdentifierMatched ( copilotExecution: CopilotExecutionAggregate, project: ProjectAggregate ): boolean
  {
    return copilotExecution.copilotInputId === project.getData("copilotInputId");
  }
  match ( copilotExecution: CopilotExecutionAggregate, project: ProjectAggregate ): boolean
  {

  }
}