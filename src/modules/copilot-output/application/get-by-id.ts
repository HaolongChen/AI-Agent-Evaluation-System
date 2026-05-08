import type { ICopilotOutputRepository } from "../domain/interface/copilot-output.interface.ts";

export class GetCopilotOutputByIdUseCase {
  constructor(private copilotOutputRepository: ICopilotOutputRepository) {}

  async execute(id: string) {
    const copilotOutput = await this.copilotOutputRepository.findById(id);
    if (!copilotOutput) {
      throw new Error(`CopilotOutput with ID ${id} not found`);
    }
    return copilotOutput.toJSON();
  }
}
