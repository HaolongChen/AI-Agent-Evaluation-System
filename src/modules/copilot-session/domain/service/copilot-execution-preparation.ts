import type { CopilotInputAggregate } from "../../../dataset/domain/aggregate/copilot-input.aggregate.ts";
import type { CopilotServerEntity } from "../../../dataset/domain/entity/copilot-server.entity.ts";
import { ProjectNameServiceFactory } from "../../../dataset/domain/service/generate-project-name.service.ts";
import { ProjectEntity } from "../entity/project.entity.ts";
import { ZionProjectEntity } from "../entity/zion-project.entity.ts";
import type { IZionProjectService } from "../interface/zion-project.interface.ts";

export class CopilotExecutionPreparationService {
  constructor(private zionProjectService: IZionProjectService) {}

  zionProjectToProject(zionProject: ZionProjectEntity): ProjectEntity {
    const projectExId = zionProject.getData("projectExId");
    if (!projectExId) {
      throw new Error(
        "projectExId is required in ZionProjectEntity to transform to ProjectEntity",
      );
    }
    return new ProjectEntity({ ...zionProject.getData(), projectExId });
  }

  async createZionProject(
    copilotInput: CopilotInputAggregate,
    copilotServer: CopilotServerEntity,
    projectNameServiceFactory: ProjectNameServiceFactory = new ProjectNameServiceFactory(),
  ): Promise<ProjectEntity> {
    const projectNameService =
      projectNameServiceFactory.initializeByCopilotInput(copilotInput);
    const zionProject = new ZionProjectEntity({
      projectName: projectNameService.generateProjectName(),
    });
    const project = this.zionProjectToProject(
      await this.zionProjectService.createZionProject(zionProject),
    );
    return project;
  }
}
