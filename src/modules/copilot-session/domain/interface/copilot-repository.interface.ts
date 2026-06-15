import type { IRepository } from "../../../shared/domain/interface/repository.interface.ts";
import type { CopilotExecutionAggregate } from "../aggregate/copilot-execution.aggregate.ts";

export interface ICopilotRepository
{
  save(entity: CopilotExecutionAggregate): Promise<void>;
}
