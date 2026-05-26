import type { ICopilotInputRepository } from "../domain/interface/copilot-input.interface.ts";

export class FormCopilotInputUseCase {
  constructor(
    private repository: {
      copilotInputRepository: ICopilotInputRepository;
    },
  ) {}

  async execute(goldenSetId: string, userInputId: string) {
    const existingGoldenSetEntities =
      await this.repository.copilotInputRepository.getByUserInputId(
        userInputId,
      );
    const linkedGoldenSet = existingGoldenSetEntities.find(
      (goldenSetEntity) => goldenSetEntity.getData("id") === goldenSetId,
    );
    if (!linkedGoldenSet) {
      const copilotInput =
        await this.repository.copilotInputRepository.addGoldenSetAssociation(
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
