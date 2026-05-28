import type { OpaqueSchemaGraph } from "../../../shared/domain/interface/type-system.ts";
import type { ProjectEntity } from "../entity/project.entity.ts";

export interface IZionProjectRepository<T extends ProjectEntity = ProjectEntity> {
  createZionProject(
    projectName: string,
    initialSchemaId?: string,
  ): Promise<T>;

  getByProjectExId(
    projectExId: string,
  ): Promise<T>;

  deleteTemporaryProject ( project: T ): Promise<void>;

  importSchemaToProject ( schemaId: string, project: T ): Promise<void>;
}
