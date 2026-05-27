import type { IRepository } from "../../../shared/domain/interface/repository.interface.ts";
import type { CopilotServerEntity } from "../entity/copilot-server.entity.ts";

export interface ICopilotServerRepository extends IRepository<CopilotServerEntity> {
  getDefault(): Promise<CopilotServerEntity>;
}
