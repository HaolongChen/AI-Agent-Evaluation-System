import type { IRepository } from "../../../shared/domain/interface/repository.interface.ts";
import type { ProjectAggregate } from "../aggregate/project.aggregate.ts";

export type IProjectRepository = IRepository<ProjectAggregate>;
