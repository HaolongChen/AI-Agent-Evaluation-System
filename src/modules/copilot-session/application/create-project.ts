import type { CopilotInputAggregate } from "../../dataset/domain/aggregate/copilot-input.aggregate.ts";
import type { CopilotServerEntity } from "../../dataset/domain/entity/copilot-server.entity.ts";
import { generateProjectName } from "../../dataset/domain/service/generate-project-name.service.ts";
import { ProjectAggregate } from "../domain/aggregate/project.aggregate.ts";
import { ZionProjectEntity } from "../domain/entity/zion-project.entity.ts";
import type { IProjectRepository } from "../domain/interface/project.interface.ts";
import type { IZionProjectService } from "../domain/interface/zion-project.interface.ts";

export class CreateProjectUseCase {
  constructor(
    private repository: {
      projectRepository: IProjectRepository;
      ZionProjectService: IZionProjectService;
    },
  ) {}

  async execute(
    copilotInput: CopilotInputAggregate,
    copilotServer: CopilotServerEntity,
  ) {
    const zionProject = new ZionProjectEntity({
      projectName: generateProjectName(
        copilotInput.getEntity("goldenSet").getData("id"),
        copilotInput.getEntity("userInput").getData("id"),
      ),
    });
    const projectEntity =
      await this.repository.ZionProjectService.createZionProject(zionProject);
    const projectAggregate = new ProjectAggregate(
      copilotInput,
      copilotServer.getData("id"),
      projectEntity,
    );
    await this.repository.projectRepository.save(projectAggregate);
    return projectAggregate;
  }
}
