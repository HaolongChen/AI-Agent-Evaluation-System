import type { ProjectEntity } from "../domain/entity/project.entity.ts";
import type { IZionProjectService } from "../domain/interface/zion-project.interface.ts";

export class DeleteZionProjectUseCase {
  constructor(private zionProjectService: IZionProjectService) {}

  async execute(projectEntity: ProjectEntity) {
    return this.zionProjectService.deleteZionProject(projectEntity);
  }
}
