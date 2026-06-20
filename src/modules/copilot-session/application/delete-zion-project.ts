import type { ProjectAggregate } from "../domain/aggregate/project.aggregate.ts";
import type { IProjectRepository } from "../domain/interface/project-repository.interface.ts";

export class DeleteZionProjectUseCase {
  constructor(private readonly projectRepository: IProjectRepository) {}

  async execute(project: ProjectAggregate) {
    project.delete();
    return this.projectRepository.save(project);
  }
}
