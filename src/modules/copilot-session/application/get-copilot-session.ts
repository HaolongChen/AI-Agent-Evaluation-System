import type { CopilotInputAggregate } from "../../dataset/domain/aggregate/copilot-input.aggregate.ts";
import type { CopilotServerEntity } from "../../dataset/domain/entity/copilot-server.entity.ts";
import type { CopilotOutputEntity } from "../domain/entity/copilot-output.entity.ts";
import type {
  IProjectRepository,
  ResumeProjectInfo,
} from "../domain/interface/project-repository.interface.ts";

export class GetCopilotSessionUseCase {
  constructor(
    private repository: {
      projectRepository: IProjectRepository;
    },
  ) {}

  async execute(
    copilotInput: CopilotInputAggregate,
    copilotServer: CopilotServerEntity,
  ): Promise<ResumeProjectInfo[]> {
    return this.repository.projectRepository.getAllProjectsOfCopilotInput(
      copilotInput.getData("id"),
    );
  }
}
