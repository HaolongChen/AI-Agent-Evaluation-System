import type { Account } from "../../account/domain/entity/account.entity.ts";
import type { CopilotInputAggregate } from "../../dataset/domain/aggregate/copilot-input.aggregate.ts";
import type { CopilotServerEntity } from "../../dataset/domain/entity/copilot-server.entity.ts";
import { CopilotExecutionAggregate } from "../domain/aggregate/copilot-execution.aggregate.ts";
import { ProjectAggregate } from "../domain/aggregate/project.aggregate.ts";
import type { ICopilotRepository } from "../domain/interface/copilot-repository.interface.ts";
import type { IProjectRepository } from "../domain/interface/project-repository.interface.ts";
import type { IZionProjectService } from "../domain/interface/project-service.interface.ts";

export class CopilotExecutionUseCase {
  constructor(
    private readonly projectService: IZionProjectService,
    private readonly projectRepository: IProjectRepository,
    private readonly copilotRepository: ICopilotRepository,
  ) {}

  async execute(
    copilotInput: CopilotInputAggregate,
    copilotServer: CopilotServerEntity,
    account: Account,
  ) {
    const activeProjects =
      await this.projectRepository.getExistingIdleProjectsOfCopilotInput(
        copilotInput.getData("id"),
      );
    if (activeProjects.length > 0) {
      const activeProject = activeProjects[0];
      const projectAggregate = ProjectAggregate.complete(
        activeProject.projectExId,
        activeProject.id,
        copilotInput,
        account,
      );
      const copilotExecutionAggregate = new CopilotExecutionAggregate(
        copilotServer,
        activeProject.id,
      );
      await this.projectService.createSafeCopilotSession(
        projectAggregate,
        copilotExecutionAggregate,
      );
      return this.copilotRepository.save(copilotExecutionAggregate);
    } else {
      const projectAggregate = new ProjectAggregate(copilotInput, account);
      projectAggregate.createProject({});
      const copilotExecutionAggregate =
        CopilotExecutionAggregate.createExecutionTask(
          copilotServer,
          projectAggregate.getData("id"),
        );
      await this.copilotRepository.save(copilotExecutionAggregate);
      await this.projectRepository.save(projectAggregate);
    }
  }
}
