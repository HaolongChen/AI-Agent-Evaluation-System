import type { IRubricRepository } from "../domain/interface/rubric.interface.ts";

export class GetRubricByIdUseCase {
  constructor(private rubricRepository: IRubricRepository) {}

  async execute(id: string) {
    const rubric = await this.rubricRepository.findById(id);
    if (!rubric) {
      throw new Error(`Rubric with ID ${id} not found`);
    }
    return rubric.toJSON();
  }
}
