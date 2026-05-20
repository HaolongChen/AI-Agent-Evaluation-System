import type { IRepository } from "../../../shared/domain/interface/repository.interface.ts";
import type { ProjectEntity } from "../entity/project.entity.ts";

export const ProjectIdentifiers = {
  PROJECT_EX_ID: "projectExId",
  ID: "id",
  SCHEMA_ID: "schemaId",
  NAME: "name",
} as const;

export type ProjectIdentifiers =
  (typeof ProjectIdentifiers)[keyof typeof ProjectIdentifiers];

export interface IProjectRepository extends IRepository<ProjectEntity> {
  getByUniqueField<T extends ProjectIdentifiers>(
    field: T,
    value: string,
  ): Promise<ProjectEntity>;

  deleteById(id: string): Promise<void>;
}
