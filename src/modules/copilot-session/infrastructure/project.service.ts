import type {
  CreateCopilotSessionMutation,
  CreateCopilotSessionMutationVariables,
} from "../../../graphql/generated/types.ts";
import type { OnlineAccount } from "../../account/domain/service/online-account.service.ts";
import type { ProjectEntity } from "../domain/entity/project.entity.ts";
import type { ICopilotNetworkService } from "../domain/interface/copilot-network.interface.ts";
import type { ICrdtSchemaLifecycle } from "../domain/interface/crdt-schema-lifecycle.interface.ts";
import type { IProjectService } from "../domain/interface/project-service.interface.ts";
import {
  CREATE_COPILOT_SESSION,
  CopilotNetworkService,
} from "./copilot-network.ts";
import { TypeSystemStore } from "./crdt-schema-manager.ts";
import { deleteProjectInZion } from "./project-manager.ts";

export class ProjectService implements IProjectService {
  constructor(
    private myAccount: OnlineAccount,
    private dangerousAccount: OnlineAccount,
  ) {}
  async createCopilotSession(
    project: ProjectEntity,
  ): Promise<ICopilotNetworkService> {
    const result = await this.myAccount.gqlClient.gqlRequest<
      CreateCopilotSessionMutation,
      CreateCopilotSessionMutationVariables
    >(CREATE_COPILOT_SESSION, {
      projectExId: project.getData("projectExId"),
      sessionType: "COPILOT",
    });
    return new CopilotNetworkService(
      this.myAccount.gqlClient,
      this.myAccount.wsClient,
      result.createCopilotSession,
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
