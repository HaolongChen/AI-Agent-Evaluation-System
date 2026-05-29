import type { ProjectEntity } from "../entity/project.entity.ts";

export interface IZionProjectRepository<
  T extends ProjectEntity = ProjectEntity,
> {
  createZionProject(project: T): Promise<void>;

  getByProjectExId(projectExId: string): Promise<T>;

  deleteZionProject(project: T): Promise<void>;

  importSchemaToProject(schemaId: string, project: T): Promise<void>;
}
