import type { CopilotInputAggregate } from "../../dataset/domain/aggregate/copilot-input.aggregate.ts";
import type { CopilotServerEntity } from "../../dataset/domain/entity/copilot-server.entity.ts";
import type { ProjectNameServiceFactory } from "../../dataset/domain/service/generate-project-name.service.ts";
import { ProjectAggregate } from "../domain/aggregate/project.aggregate.ts";
import type { IZionProjectService } from "../domain/interface/project-service.interface.ts";
import type { CreateProjectUseCase } from "./create-project.ts";
import type { DeleteZionProjectUseCase } from "./delete-zion-project.ts";
import type { ExecuteCopilotUseCase } from "./execution-service.ts";

export class CopilotExecutionLifecycle {
  constructor(
    private createProjectUseCase: CreateProjectUseCase,
    private executeCopilotUseCase: ExecuteCopilotUseCase,
    private deleteZionProjectUseCase: DeleteZionProjectUseCase,
  ) {}

  async execute(
    copilotInput: CopilotInputAggregate,
    copilotServer: CopilotServerEntity,
  ) {
    try {
      const projectEntity =
        await this.createProjectUseCase.execute(copilotInput);
      const projectAggregate = new ProjectAggregate(
        copilotInput,
        copilotServer,
        projectEntity,
      );
      this.executeCopilotUseCase.setProject(projectAggregate);
      await this.executeCopilotUseCase.executeV2();
      await this.deleteZionProjectUseCase.execute(projectAggregate);
      return projectAggregate;
    } catch (error) {
      console.error("Error in CopilotExecutionLifecycle:", error);
      throw error;
    }
  }
}

export class CopilotExecutionUseCase {
  constructor(
    private readonly projectService: IZionProjectService,
    private readonly projectNameServiceFactory: ProjectNameServiceFactory,
  ) {}

  async execute(
    copilotInput: CopilotInputAggregate,
    copilotServer: CopilotServerEntity,
  ) {
    const projectNameService =
      this.projectNameServiceFactory.initializeByCopilotInput(copilotInput);
    const projectName = projectNameService.generateProjectName();
  }
}
