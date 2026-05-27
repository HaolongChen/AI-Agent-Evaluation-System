import type { ICopilotSessionRepository } from "../domain/interface/copilot-session.interface.ts";

export class GetCopilotOutputUseCase {
  constructor(private repository: ICopilotSessionRepository) {}

  async execute(copilotSessionId: string) {
    const result = await this.repository.findById(copilotSessionId);
    return result.getEntity("copilotOutput")[0];
  }
}
