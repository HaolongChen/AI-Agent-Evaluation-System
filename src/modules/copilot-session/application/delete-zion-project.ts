import type { ProjectAggregate } from "../domain/aggregate/project.aggregate.ts";
import type { IProjectRepository } from "../domain/interface/project-repository.interface.ts";

export class DeleteZionProjectUseCase {
  constructor(private readonly projectRepository: IProjectRepository) {}

  async execute(project: ProjectAggregate) {
    if (!project.delete()) {
      throw new Error(
        `Project with ID ${project.getData("id")} cannot be deleted because it is not in an active state.`,
      );
    }
    return this.projectRepository.save(project);
  }
}
