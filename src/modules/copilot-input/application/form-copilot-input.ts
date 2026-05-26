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
    const copilotInputs =
      await this.repository.copilotInputRepository.getByFilters({
        userInputId,
      });
    const linkedGoldenSet = copilotInputs.find(
      ({ goldenSetEntity }) => goldenSetEntity.getData("id") === goldenSetId,
    );
    if (!linkedGoldenSet) {
      const goldenSetEntity =
        await this.repository.goldenSetRepository.findById(goldenSetId);
      const copilotInput = await this.repository.copilotInputRepository.create(
        goldenSetEntity,
        copilotInputs[0].userInputEntity,
      );
      return copilotInput;
    }
    throw new Error(
      `UserInput ID ${userInputId} is already associated with GoldenSet ID ${goldenSetId}`,
    );
  }
}

export class GetCopilotInputByFiltersUseCase {
  constructor(
    private repository: {
      copilotInputRepository: ICopilotInputRepository;
    },
  ) {}

  async execute(data: { goldenSetId?: string; userInputId?: string }) {
    const copilotInputs =
      await this.repository.copilotInputRepository.getByFilters(data);
    return copilotInputs;
  }
}
