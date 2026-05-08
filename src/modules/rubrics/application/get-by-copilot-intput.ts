import type { IRubricRepository } from "../domain/interface/rubric.interface.ts";

export class GetRubricsByCopilotInputUseCase {
  constructor(private rubricRepository: IRubricRepository) {}

  async execute(goldenSetId: string, userInputId: string) {
    const rubrics = await this.rubricRepository.getByGoldenSetIdAndUserInputId(
      goldenSetId,
      userInputId,
    );
    return rubrics.map((rubric) => rubric.toJSON());
  }
}
