import type { IRepository } from "../../../shared/domain/interface/repository.interface.ts";
import type { CopilotInputEntity } from "../entity/copilot-input.entity.ts";

export interface ICopilotInputRepository extends IRepository<CopilotInputEntity> {}
