import type { ProjectEntity } from "../entity/project.entity.ts";
import type { ZionProjectEntity } from "../entity/zion-project.entity.ts";

export interface IZionProjectRepository<
  T extends ZionProjectEntity = ZionProjectEntity,
  P extends ProjectEntity = ProjectEntity,
> {
  createZionProject(project: T): Promise<P>;

  getTypeSystemStoreByProjectEntity(project: P): Promise<P>;

  deleteZionProject(project: P): Promise<void>;

  importSchemaToProject(schemaId: string, project: P): Promise<void>;
}
