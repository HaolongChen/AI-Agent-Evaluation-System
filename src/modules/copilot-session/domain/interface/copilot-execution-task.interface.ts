import type { IRepository } from "../../../shared/domain/interface/repository.interface.ts";
import type { CopilotExecutionTaskAggregate } from "../aggregate/copilot-execution-task.aggregate.ts";

export type ICopilotExecutionTaskRepository =
  IRepository<CopilotExecutionTaskAggregate>;
