import type { IGoldenSetRepository } from "../domain/interface/golden-set.interface.ts";
import type { IUserInputRepository } from "../domain/interface/user-input.interface.ts";

export class FormCopilotInputUseCase {
	constructor(
		private repository: {
			goldenSetRepository: IGoldenSetRepository;
			userInputRepository: IUserInputRepository;
		},
	) {}

	async execute(goldenSetId: string, userInputId: string) {
		const existingGoldenSetEntities =
			await this.repository.goldenSetRepository.getByUserInputId(userInputId);
		const linkedGoldenSet = existingGoldenSetEntities.find(
			(goldenSetEntity) => goldenSetEntity.getData("id") === goldenSetId,
		);
		if (!linkedGoldenSet) {
			const copilotInput =
				await this.repository.userInputRepository.addGoldenSetAssociation(
					userInputId,
					goldenSetId,
				);
			return copilotInput;
		}
		throw new Error(
			`UserInput ID ${userInputId} is already associated with GoldenSet ID ${goldenSetId}`,
		);
	}
}
