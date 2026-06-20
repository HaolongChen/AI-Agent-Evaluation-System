import type { Account } from "../../account/domain/entity/account.entity.ts";
import type { CopilotInputAggregate } from "../../dataset/domain/aggregate/copilot-input.aggregate.ts";
import type { CopilotExecutionAggregate } from "../domain/aggregate/copilot-execution.aggregate.ts";
import { ProjectAggregate } from "../domain/aggregate/project.aggregate.ts";
import type { ICopilotRepository } from "../domain/interface/copilot-repository.interface.ts";
import type { IProjectRepository } from "../domain/interface/project-repository.interface.ts";
import type { IZionProjectService } from "../domain/interface/project-service.interface.ts";

export class ProjectApplicationService {
  constructor(
    private readonly projectService: IZionProjectService,
    private readonly copilotRepository: ICopilotRepository,
    private readonly projectRepository: IProjectRepository,
  ) {}

  async startCopilotExecution(
    project: ProjectAggregate,
    copilotExecution: CopilotExecutionAggregate,
  ) {
    if (
      project.state.status !== "active" ||
      copilotExecution.state.status === "running"
    ) {
      throw new Error(
        "Project must be active and Copilot execution must not be already running.",
      );
    }
    const copilotSessionExId = await this.projectService.createCopilotSession(
      project.state.projectExId,
      copilotExecution.network,
    );
    copilotExecution.start(project, copilotSessionExId);
    return this.copilotRepository.save(copilotExecution);
  }

  async getExistingProjectOfCopilotInput(
    copilotInput: CopilotInputAggregate,
    copilotServerId: string,
  ) {
    const projects =
      await this.projectRepository.getExistingProjectsOfCopilotInput(
        copilotInput.getData("id"),
      );
    const matchedProjects = projects.map((project) => {
      const matchedOutputs = project.copilotOutputs.filter(
        (output) => output.copilotServerId === copilotServerId,
      );
      return { ...project, copilotOutputs: matchedOutputs };
    });
    return matchedProjects;
  }
}
