import type { ICopilotOutputRepository } from "../domain/interface/copilot-output.interface.ts";

export class GetCopilotOutputsByCopilotInputUseCase {
  constructor(private copilotOutputRepository: ICopilotOutputRepository) {}

  async execute(goldenSetId: string, userInputId: string) {
    const copilotOutputs =
      await this.copilotOutputRepository.getByGoldenSetIdAndUserInputId(
        goldenSetId,
        userInputId,
      );
    return copilotOutputs.map((output) => output.toJSON());
  }
}
