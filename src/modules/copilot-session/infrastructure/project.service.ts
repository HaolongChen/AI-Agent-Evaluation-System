import type { OnlineAccount } from "../../account/domain/service/online-account.service.ts";
import type { ProjectBeforeCopilotSession } from "../domain/aggregate/project.aggregate.ts";
import type { ProjectEntity } from "../domain/entity/project.entity.ts";
import type { ICopilotNetworkService } from "../domain/interface/copilot-network.interface.ts";
import type { ICopilotSessionSetup } from "../domain/interface/copilot-session-setup.interface.ts";
import type { ICrdtSchemaLifecycle } from "../domain/interface/crdt-schema-lifecycle.interface.ts";
import type { IProjectService } from "../domain/interface/project-service.interface.ts";
import { CopilotNetworkService } from "./copilot-network.ts";
import { TypeSystemStore } from "./crdt-schema-manager.ts";
import { deleteProjectInZion } from "./project-manager.ts";

export class ProjectService implements IProjectService {
  constructor(
    private myAccount: OnlineAccount,
    private dangerousAccount: OnlineAccount,
    private copilotSessionSetup: ICopilotSessionSetup,
  ) {}

  async createCopilotSession(
    project: ProjectBeforeCopilotSession,
  ): Promise<ICopilotNetworkService> {
    const sessionExId =
      await this.copilotSessionSetup.createNewSession(project);
    return new CopilotNetworkService(
      this.myAccount.gqlClient,
      this.myAccount.wsClient,
      sessionExId,
      project.userInput,
      await this.getCrdtSchemaLifecycle(project).schemaGraph(),
    );
  }
  async deleteProjectInZion(project: ProjectEntity): Promise<void> {
    const projectExId = project.getData("projectExId");
    await deleteProjectInZion(this.myAccount.gqlClient, projectExId);
  }
  getCrdtSchemaLifecycle(projectEntity: ProjectEntity): ICrdtSchemaLifecycle {
    return new TypeSystemStore(
      projectEntity.getData("projectExId"),
      this.myAccount.gqlClient,
      this.dangerousAccount.gqlClient,
    );
  }
}
