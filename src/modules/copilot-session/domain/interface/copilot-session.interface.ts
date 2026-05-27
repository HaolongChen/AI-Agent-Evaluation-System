import type { CopilotInputAggregate } from "../../../dataset/domain/aggregate/copilot-input.aggregate.ts";
import type { IRepository } from "../../../shared/domain/interface/repository.interface.ts";
import type { CopilotSessionAggregate } from "../aggregate/copilot-session.aggregate.ts";
import type { CopilotOutputEntity } from "../entity/copilot-output.entity.ts";
import type { CopilotServerEntity } from "../entity/copilot-server.entity.ts";

export interface ICopilotSessionRepository extends IRepository<CopilotSessionAggregate>
{
  getByCopilotInput ( copilotInput: CopilotInputAggregate ): Promise<CopilotSessionAggregate[]>;

  getByCopilotServer ( copilotServer: CopilotServerEntity ): Promise<Array<CopilotSessionAggregate>>;

  saveCopilotOutput ( copilotOutput: CopilotOutputEntity ): Promise<void>;
}