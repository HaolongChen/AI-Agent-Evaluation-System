import type { ICopilotInputRepository } from "../domain/interface/copilot-input.interface.ts";
import type { IGoldenSetRepository } from "../domain/interface/golden-set.interface.ts";

export class FormCopilotInputUseCase {
  constructor(
    private repository: {
      copilotInputRepository: ICopilotInputRepository;
      goldenSetRepository: IGoldenSetRepository;
    },
  ) {}

  async execute(goldenSetId: string, userInputId: string) {
    const { goldenSetEntity: existingGoldenSetEntities, userInputEntity } =
      await this.repository.copilotInputRepository.getByFilters({
        userInputId,
      });
    const linkedGoldenSet = existingGoldenSetEntities.find(
      (goldenSetEntity) => goldenSetEntity.getData("id") === goldenSetId,
    );
    if (!linkedGoldenSet) {
      const goldenSetEntity =
        await this.repository.goldenSetRepository.findById(goldenSetId);
      const copilotInput = await this.repository.copilotInputRepository.create(
        goldenSetEntity,
        userInputEntity[0],
      );
      return copilotInput;
    }
    throw new Error(
      `UserInput ID ${userInputId} is already associated with GoldenSet ID ${goldenSetId}`,
    );
  }
}
