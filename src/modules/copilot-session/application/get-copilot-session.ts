import type { CopilotInputAggregate } from "../../dataset/domain/aggregate/copilot-input.aggregate.ts";
import type { CopilotOutputEntity } from "../domain/entity/copilot-output.entity.ts";
import type { IProjectRepository } from "../domain/interface/project-repository.interface.ts";

export class GetCopilotSessionUseCase {
  constructor(
    private repository: {
      projectRepository: IProjectRepository;
    },
  ) {}

  async execute(
    copilotInput: CopilotInputAggregate,
  ): Promise<CopilotOutputEntity[]> {
    const outputs =
      await this.repository.projectRepository.getByCopilotInput(copilotInput);
    return outputs
      .map((output) => output.getEntity("copilotOutput"))
      .filter((output): output is CopilotOutputEntity => output !== undefined);
  }
}
