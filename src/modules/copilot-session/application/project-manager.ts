import type { CopilotExecutionAggregate } from "../domain/aggregate/copilot-execution.aggregate.ts";
import type { ProjectAggregate } from "../domain/aggregate/project.aggregate.ts";
import type { ICopilotRepository } from "../domain/interface/copilot-repository.interface.ts";
import type { IZionProjectService } from "../domain/interface/project-service.interface.ts";

export class ProjectApplicationService {
  constructor(
    private readonly projectService: IZionProjectService,
    private readonly copilotRepository: ICopilotRepository,
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
}
