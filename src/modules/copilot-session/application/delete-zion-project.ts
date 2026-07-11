import type { Account } from "../../account/domain/entity/account.entity.ts";
import type { ProjectAggregate } from "../domain/aggregate/project.aggregate.ts";
import type { IProjectRepository } from "../domain/interface/project-repository.interface.ts";

export class DeleteZionProjectUseCase {
  constructor(private readonly projectRepository: IProjectRepository) {}

  async execute(project: ProjectAggregate, account: Account) {
    if (!project.delete(account)) {
      throw new Error(
        `Project with ID ${project.getData("id")} cannot be deleted because it is not in an active state.`,
      );
    }
    return this.projectRepository.save(project);
  }
}
