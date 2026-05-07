import type { IGoldenSetRepository } from "../domain/interface/golden-set.interface.ts";
import type { IUserInputRepository } from "../domain/interface/user-input.interface.ts";

export class FormCopilotInputUseCase {
  constructor(
    private readonly repository: {
      goldenSetRepository: IGoldenSetRepository;
      userInputRepository: IUserInputRepository;
    },
  ) {}

  async execute(goldenSetId: string, userInputId: string) {
    const existingGoldenSetEntities =
      await this.repository.goldenSetRepository.getByUserInputId(userInputId);
    if (
      !existingGoldenSetEntities.some(
        (goldenSetEntity) => goldenSetEntity.id === goldenSetId,
      )
    ) {
      await this.repository.userInputRepository.addGoldenSetAssociation(
        userInputId,
        goldenSetId,
      );
    }
  }
}
