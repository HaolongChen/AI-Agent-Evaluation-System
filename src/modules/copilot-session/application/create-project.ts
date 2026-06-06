import type { CopilotInputAggregate } from "../../dataset/domain/aggregate/copilot-input.aggregate.ts";
import type { ProjectNameServiceFactory } from "../../dataset/domain/service/generate-project-name.service.ts";
import { ProjectBeforeCopilotSession } from "../domain/aggregate/project.aggregate.ts";
import { ZionProjectEntity } from "../domain/entity/zion-project.entity.ts";
import type { IProjectRepository } from "../domain/interface/project-repository.interface.ts";
import type { IProjectService } from "../domain/interface/project-service.interface.ts";

export class CreateProjectUseCase {
  constructor(
    private repository: {
      projectRepository: IProjectRepository;
    },
    private projectNameGenerationFactory: ProjectNameServiceFactory,
  ) {}

  async execute(
    copilotInput: CopilotInputAggregate,
    copilotServerId: string,
    projectService: IProjectService,
  ): Promise<ProjectBeforeCopilotSession> {
    const projectNameGenerator =
      this.projectNameGenerationFactory.initializeByCopilotInput(copilotInput);
    const zionProject = new ZionProjectEntity({
      projectName: projectNameGenerator.generateProjectName(),
    });
    const project = await projectService.createProjectInZion(zionProject);
    const projectAggregate = new ProjectBeforeCopilotSession(
      copilotInput.getData("id"),
      copilotServerId,
      project,
    );
    await this.repository.projectRepository.save(projectAggregate);
    return projectAggregate;
  }
}
