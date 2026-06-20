import type { CopilotExecutionAggregate } from "../../domain/aggregate/copilot-execution.aggregate.ts";
import type { ProjectAggregate } from "../../domain/aggregate/project.aggregate.ts";
import type { ICopilotRepository } from "../../domain/interface/copilot-repository.interface.ts";
import type { IZionProjectService } from "../../domain/interface/project-service.interface.ts";

export class CopilotExecutionPool {
  private pool: Map<string, CopilotExecutionAggregate> = new Map();

  constructor(
    private readonly projectService: IZionProjectService,
    private readonly copilotRepository: ICopilotRepository,
  ) {}

  register(copilotExecutionAggregate: CopilotExecutionAggregate) {
    if (this.pool.has(copilotExecutionAggregate.getData("projectId"))) {
      throw new Error(
        "CopilotExecutionAggregate for this project already exists in the pool.",
      );
    }
    this.pool.set(
      copilotExecutionAggregate.getData("projectId"),
      copilotExecutionAggregate,
    );
  }

  async publish(project: ProjectAggregate) {
    const copilotExecutionAggregate = this.pool.get(project.getData("id"));
    if (copilotExecutionAggregate) {
      this.pool.delete(project.getData("id"));
      await this.projectService.createSafeCopilotSession(
        project,
        copilotExecutionAggregate,
      );
      return this.copilotRepository.save(copilotExecutionAggregate);
    }
  }
}
