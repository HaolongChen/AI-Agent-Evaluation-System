import type { Account } from "../../account/domain/entity/account.entity.ts";
import { NetworkClient } from "../../account/domain/entity/network-client.entity.ts";
import type { ICopilotInputRepository } from "../../dataset/domain/interface/copilot-input.interface.ts";
import type { ICopilotServerRepository } from "../../dataset/domain/interface/copilot-server.interface.ts";
import { CopilotExecutionAggregate } from "../domain/aggregate/copilot-execution.aggregate.ts";
import type { ProjectAggregate } from "../domain/aggregate/project.aggregate.ts";
import type { CopilotExecutionTaskEntity } from "../domain/entity/copilot-execution-task.entity.ts";
import type { ICopilotRepository } from "../domain/interface/copilot-repository.interface.ts";
import type { IProjectRepository } from "../domain/interface/project-repository.interface.ts";
import type { IZionProjectService } from "../domain/interface/project-service.interface.ts";
import type { ProjectTypeOfCopilotExecution } from "../domain/schema/copilot.schema.ts";

export class ProjectApplicationService {
  constructor(
    private readonly projectService: IZionProjectService,
    private readonly repository: {
      projectRepository: IProjectRepository;
      copilotRepository: ICopilotRepository;
      copilotServerRepository: ICopilotServerRepository;
      copilotInputRepository: ICopilotInputRepository;
    },
  ) {}

  async createProject(projectAggregate: ProjectAggregate, account: Account) {
    const projectNetwork = NetworkClient.createDefault();
    account.acquireNetwork(projectNetwork);
    const projectExId = await this.projectService.createProjectInZion(
      projectAggregate.configureZionProject({}),
      account.getData("organizationExId"),
      projectNetwork,
    );
    projectAggregate.projectCreated(projectExId, account, projectNetwork);
    return this.repository.projectRepository.save(projectAggregate);
  }

  async setupCopilotExecution(
    copilotExecutionTask: CopilotExecutionTaskEntity,
    projectACL: ProjectTypeOfCopilotExecution,
  ): Promise<CopilotExecutionAggregate | undefined> {
    if (
      projectACL.copilotInputId !==
      copilotExecutionTask.getData("copilotInputId")
    ) {
      return;
    }
    const copilotServer =
      await this.repository.copilotServerRepository.findById(
        copilotExecutionTask.getData("copilotServerId"),
      );
    const copilotInput = await this.repository.copilotInputRepository.findById(
      copilotExecutionTask.getData("copilotInputId"),
    );
    return new CopilotExecutionAggregate(
      copilotServer,
      copilotInput.userInput,
      projectACL.projectExId,
    );
  }

  async createCopilotSession(
    copilotExecutionTask: CopilotExecutionTaskEntity,
    projectACL: ProjectTypeOfCopilotExecution,
  ) {
    const copilotExecution = await this.setupCopilotExecution(
      copilotExecutionTask,
      projectACL,
    );
    if (!copilotExecution) {
      return;
    }
    const copilotNetwork = copilotExecution.configureNetwork(
      NetworkClient.createDefault(),
    );
    projectACL.account.acquireNetwork(copilotNetwork);
    const copilotSessionExId = await this.projectService.createCopilotSession(
      projectACL.projectExId,
      copilotNetwork,
    );
    copilotExecution.start(
      copilotSessionExId,
      projectACL.projectNetwork,
      copilotNetwork,
    );
    return this.repository.copilotRepository.save(copilotExecution);
  }
}
