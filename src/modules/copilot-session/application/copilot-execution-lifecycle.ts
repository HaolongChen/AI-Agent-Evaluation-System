import type { Account } from "../../account/domain/entity/account.entity.ts";
import type { CopilotInputAggregate } from "../../dataset/domain/aggregate/copilot-input.aggregate.ts";
import type { CopilotServerEntity } from "../../dataset/domain/entity/copilot-server.entity.ts";
import { CopilotExecutionAggregate } from "../domain/aggregate/copilot-execution.aggregate.ts";
import { ProjectAggregate } from "../domain/aggregate/project.aggregate.ts";
import type { ICopilotRepository } from "../domain/interface/copilot-repository.interface.ts";
import type { IProjectRepository } from "../domain/interface/project-repository.interface.ts";

export class CopilotExecutionUseCase {
  constructor(
    private readonly projectRepository: IProjectRepository,
    private readonly copilotRepository: ICopilotRepository,
  ) {}

  async execute(
    copilotInput: CopilotInputAggregate,
    copilotServer: CopilotServerEntity,
    account: Account,
  ) {
    await this.copilotRepository.save(
      CopilotExecutionAggregate.createExecutionTask(
        copilotServer,
        copilotInput.getData("id"),
      ),
    );
    const activeProjects =
      await this.projectRepository.getExistingIdleProjectsOfCopilotInput(
        copilotInput.getData("id"),
      );
    const project =
      activeProjects.length > 0
        ? ProjectAggregate.complete(
            activeProjects[0].projectExId,
            activeProjects[0].id,
            copilotInput,
            account,
          )
        : new ProjectAggregate(copilotInput, account);
    if (project.state.status === "pending") {
      project.createProject({});
    }
    await this.projectRepository.save(project);
  }
}
