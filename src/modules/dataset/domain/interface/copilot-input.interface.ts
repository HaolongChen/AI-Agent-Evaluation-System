import type { IRepository } from "../../../shared/domain/interface/repository.interface.ts";
import type { CopilotInputAggregate } from "../aggregate/copilot-input.aggregate.ts";

export interface ICopilotInputRepository extends IRepository<CopilotInputAggregate> {}
