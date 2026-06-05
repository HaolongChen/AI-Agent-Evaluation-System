import type { OnlineAccount } from "../../account/domain/service/online-account.service.ts";
import { ProjectEntity } from "../domain/entity/project.entity.ts";
import type { ZionProjectEntity } from "../domain/entity/zion-project.entity.ts";
import type { IZionProjectService } from "../domain/interface/zion-project.interface.ts";

import { createZionProject, deleteProjectInZion } from "./project-manager.ts";

export class ZionProjectService implements IZionProjectService {
  constructor(private myAccount: OnlineAccount) {}
  async createZionProject(project: ZionProjectEntity): Promise<ProjectEntity> {
    const createdProject = await createZionProject(
      this.myAccount.gqlClient,
      this.myAccount.wsClient,
      this.myAccount.getOrganizationExId(),
      project,
    );
    project.setData({ projectExId: createdProject });
    return new ProjectEntity({
      ...project.getData(),
      projectExId: createdProject,
    });
  }
  async deleteZionProject(project: ProjectEntity): Promise<void> {
    const projectExId = project.getData("projectExId");
    await deleteProjectInZion(this.myAccount.gqlClient, projectExId);
  }
}
