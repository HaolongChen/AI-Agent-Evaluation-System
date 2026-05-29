import { CopilotInputAggregate } from "../domain/aggregate/copilot-input.aggregate.ts";
import { GoldenSetEntity } from "../domain/entity/golden-set.entity.ts";
import { UserInputEntity } from "../domain/entity/user-input.entity.ts";
import type { ICopilotInputRepository } from "../domain/interface/copilot-input.interface.ts";
import type { IGoldenSetRepository } from "../domain/interface/golden-set.interface.ts";
import type { IUserInputRepository } from "../domain/interface/user-input.interface.ts";

export class BuildCopilotInputUseCase {
  constructor(
    private repository: {
      copilotInputRepository: ICopilotInputRepository;
      goldenSetRepository: IGoldenSetRepository;
      userInputRepository: IUserInputRepository;
    },
  ) {}

  async execute(
    goldenSetEntity: GoldenSetEntity,
    userInputEntities: UserInputEntity[],
  ): Promise<CopilotInputAggregate[]>;
  async execute(
    goldenSetId: string,
    userInputId: string[],
  ): Promise<CopilotInputAggregate[]>;
  async execute(
    goldenSet: GoldenSetEntity | string,
    userInput: UserInputEntity[] | string[],
  ) {
    if (userInput.length === 0) {
      throw new Error("User input cannot be empty");
    }
    const goldenSetEntity =
      goldenSet instanceof GoldenSetEntity
        ? goldenSet
        : await this.repository.goldenSetRepository.findById(goldenSet);
    const userInputEntities = await Promise.all(
      userInput.map(async (input) => {
        return input instanceof UserInputEntity
          ? input
          : this.repository.userInputRepository.findById(input);
      }),
    );
    const copilotInputs =
      await this.repository.copilotInputRepository.addUserInput(
        goldenSetEntity,
        userInputEntities,
      );
    return copilotInputs;
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
