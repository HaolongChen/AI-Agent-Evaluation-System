import type { Account } from "../../account/domain/entity/account.entity.ts";
import { NetworkClient } from "../../account/domain/entity/network-client.entity.ts";
import type { CopilotInputAggregate } from "../../dataset/domain/aggregate/copilot-input.aggregate.ts";
import type { CopilotServerEntity } from "../../dataset/domain/entity/copilot-server.entity.ts";
import { CopilotExecutionTaskAggregate } from "../domain/aggregate/copilot-execution-task.aggregate.ts";
import { ProjectAggregate } from "../domain/aggregate/project.aggregate.ts";
import type { ICopilotExecutionTaskRepository } from "../domain/interface/copilot-execution-task.interface.ts";
import type { ICopilotRepository } from "../domain/interface/copilot-repository.interface.ts";
import type { IProjectRepository } from "../domain/interface/project-repository.interface.ts";
import { ProjectApplicationService } from "./project-service.ts";

export class CopilotExecutionUseCase {
  constructor(
    private readonly projectRepository: IProjectRepository,
    private readonly copilotRepository: ICopilotRepository,
    private readonly copilotExecutionTaskRepository: ICopilotExecutionTaskRepository,
    private readonly projectApplicationService: ProjectApplicationService,
  ) {}

  async execute(
    copilotInput: CopilotInputAggregate,
    copilotServer: CopilotServerEntity,
    account: Account,
  ) {
    await this.copilotExecutionTaskRepository.save(
      CopilotExecutionTaskAggregate.create(
        copilotInput.getData("id"),
        copilotServer.getData("id"),
      ),
    );
    const activeProjects =
      await this.projectRepository.getExistingIdleProjectsOfCopilotInput(
        copilotInput.getData("id"),
      );
    const project = new ProjectAggregate(copilotInput, activeProjects[0].id);
    if (activeProjects.length > 0) {
      const projectNetwork = NetworkClient.createDefault();
      account.acquireNetwork(projectNetwork);
      project.projectCreated(
        activeProjects[0].projectExId,
        account,
        projectNetwork,
      );
      await this.projectRepository.save(project);
    } else {
      await this.projectApplicationService.createProject(project, account);
    }
  }
}
