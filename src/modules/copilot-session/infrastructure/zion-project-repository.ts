import type { AccountEntity } from "../../account/domain/entity/account.entity.ts";
import type { IGQLClient } from "../../shared/domain/interface/graphql-client.interface.ts";
import type { IWebSocketClient } from "../../shared/domain/interface/websocket-client.interface.ts";
import { ProjectEntity } from "../domain/entity/project.entity.ts";
import type { ZionProjectEntity } from "../domain/entity/zion-project.entity.ts";
import type { IZionProjectService } from "../domain/interface/zion-project.interface.ts";

import { createZionProject, deleteProjectInZion } from "./project-manager.ts";

export class ZionProjectService implements IZionProjectService {
  constructor(
    private account: AccountEntity,
    private gqlClient: IGQLClient,
    private wsClient: IWebSocketClient,
  ) {}
  async createZionProject(project: ZionProjectEntity): Promise<ProjectEntity> {
    const createdProject = await createZionProject(
      this.gqlClient,
      this.wsClient,
      this.account.getOrganizationExId(),
      project,
    );
    const projectEntity = new ProjectEntity({
      projectExId: createdProject,
      projectName: project.getData("projectName"),
    });
    return projectEntity;
  }
  async deleteZionProject(project: ProjectEntity): Promise<void> {
    const projectExId = project.getData("projectExId");
    await deleteProjectInZion(this.gqlClient, projectExId);
  }
}
