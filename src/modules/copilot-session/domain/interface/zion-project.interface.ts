import type { ProjectEntity } from "../entity/project.entity.ts";
import type { ZionProjectEntity } from "../entity/zion-project.entity.ts";

export interface IZionProjectService<
  T extends ZionProjectEntity = ZionProjectEntity,
  P extends ProjectEntity = ProjectEntity,
> {
  createZionProject(project: T): Promise<P>;

  deleteZionProject(project: P): Promise<void>;
}
