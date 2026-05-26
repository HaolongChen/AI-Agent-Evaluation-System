import type { ICopilotInputRepository } from "../domain/interface/copilot-input.interface.ts";
import type { IGoldenSetRepository } from "../domain/interface/golden-set.interface.ts";
import type { IUserInputRepository } from "../domain/interface/user-input.interface.ts";

export class FormCopilotInputUseCase {
  constructor(
    private repository: {
      copilotInputRepository: ICopilotInputRepository;
      goldenSetRepository: IGoldenSetRepository;
      userInputRepository: IUserInputRepository;
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
    if (linkedGoldenSet) {
      throw new Error(
        `UserInput ID ${userInputId} is already associated with GoldenSet ID ${goldenSetId}`,
      );
    }
    const [goldenSetEntity, userInputEntity] = await Promise.all([
      this.repository.goldenSetRepository.findById(goldenSetId),
      this.repository.userInputRepository.findById(userInputId),
    ]);
    const newCopilotInput = await this.repository.copilotInputRepository.create(
      goldenSetEntity,
      userInputEntity,
    );
    return newCopilotInput;
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
