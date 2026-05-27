import { CopilotInputAggregate } from "../domain/aggregate/copilot-input.aggregate.ts";
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
        goldenSetId,
      });
    if (copilotInputs.length > 0) {
      throw new Error(
        `UserInput ID ${userInputId} is already associated with GoldenSet ID ${goldenSetId}`,
      );
    }
    const [goldenSetEntity, userInputEntity] = await Promise.all([
      this.repository.goldenSetRepository.findById(goldenSetId),
      this.repository.userInputRepository.findById(userInputId),
    ]);
    const copilotInputAggregate = new CopilotInputAggregate(
      goldenSetEntity,
      userInputEntity,
    );
    await this.repository.copilotInputRepository.save(copilotInputAggregate);
    return copilotInputAggregate;
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
