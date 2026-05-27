import type { IRepository } from "../../../shared/domain/interface/repository.interface.ts";
import type { CopilotOutputEntity } from "../entity/copilot-output.entity.ts";

export interface ICopilotOutputRepository extends IRepository<CopilotOutputEntity> {}
