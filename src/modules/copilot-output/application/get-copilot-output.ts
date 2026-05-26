import type { CopilotOutputEntity } from "../domain/entity/copilot-output.entity.ts";
import type { ICopilotOutputRepository } from "../domain/interface/copilot-output.interface.ts";

export class GetCopilotOutputUseCase {
	constructor(
		private repository: { copilotOutputRepository: ICopilotOutputRepository },
	) {}

	async execute(copilotInputId: string): Promise<CopilotOutputEntity>;
	async execute(filters: { goldenSetId: string; userInputId: string }): Promise<CopilotOutputEntity[]>;
	async execute(
		arguments_: string | { goldenSetId: string; userInputId: string },
  )
  {
    if ( typeof arguments_ === "string" )
    {
      return await this.repository.copilotOutputRepository.findById( arguments_ );
    }
    else
    {
      const results = await this.repository.copilotOutputRepository.getByGoldenSetIdAndUserInputId(
        arguments_.goldenSetId,
        arguments_.userInputId,
      );
      return results;
    }
	}
}
