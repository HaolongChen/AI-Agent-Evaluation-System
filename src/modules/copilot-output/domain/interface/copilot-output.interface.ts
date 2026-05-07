import type { IRepository } from "../../../shared/domain/interface/repository.interface.ts";
import type { CopilotOutputEntity } from "../entity/copilot-output.schema.ts";

export interface ICopilotOutputRepository extends IRepository<CopilotOutputEntity> {
  getByGoldenSetIdAndUserInputId(
    goldenSetId: string,
    userInputId: string,
  ): Promise<CopilotOutputEntity[]>;
}
