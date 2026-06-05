import type { CopilotInputAggregate } from "../../../dataset/domain/aggregate/copilot-input.aggregate.ts";
import type { CopilotServerEntity } from "../../../dataset/domain/entity/copilot-server.entity.ts";
import { type CopilotServerClient } from "../../../dataset/domain/service/copilot-server-client.ts";
import { ProjectNameServiceFactory } from "../../../dataset/domain/service/generate-project-name.service.ts";
import { ProjectBeforeCopilotSession } from "../aggregate/project.aggregate.ts";
import { ZionProjectEntity } from "../entity/zion-project.entity.ts";
import type { ICopilotNetworkService } from "../interface/copilot-network.interface.ts";
import type { IProjectService } from "../interface/project-service.interface.ts";
import type { IZionProjectService } from "../interface/zion-project.interface.ts";

export class CopilotSessionSetupService {
  constructor(
    private zionProjectService: IZionProjectService,
    private projectService: IProjectService,
    private projectNameServiceFactory: ProjectNameServiceFactory,
    private copilotServerClient: CopilotServerClient,
  ) {}

  async execute(
    copilotInput: CopilotInputAggregate,
    copilotServer: CopilotServerEntity,
  ): Promise<ICopilotNetworkService> {
    this.setupCopilotServer(copilotServer);
    const projectNameService =
      this.projectNameServiceFactory.initializeByCopilotInput(copilotInput);
    const zionProject = new ZionProjectEntity({
      projectName: projectNameService.generateProjectName(),
    });
    const projectEntity =
      await this.zionProjectService.createZionProject(zionProject);
    const projectBeforeSession = new ProjectBeforeCopilotSession(
      copilotInput,
      copilotServer,
      projectEntity,
    );
    return this.projectService.createCopilotSession(projectBeforeSession);
  }

  private setupCopilotServer(copilotServerData: CopilotServerEntity) {
    this.copilotServerClient.acquire(copilotServerData);
  }
}
