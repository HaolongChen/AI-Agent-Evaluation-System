import { z } from "zod";
import type {
  CreateCopilotSessionMutation,
  CreateCopilotSessionMutationVariables,
  GetCopilotSubscriptionCountQuery,
  GetLatestSessionMutation,
  GetLatestSessionMutationVariables,
  GetCopilotSubscriptionCountQueryVariables,
} from "../../../graphql/generated/types.ts";
import { ProjectEntity } from "../domain/entity/project.entity.ts";
import type { ZionProjectEntity } from "../domain/entity/zion-project.entity.ts";
import type { ICrdtSchemaLifecycle } from "../domain/interface/crdt-schema-lifecycle.interface.ts";
import type { IProjectService } from "../domain/interface/project-service.interface.ts";
import {
  CopilotNetworkService,
  CREATE_COPILOT_SESSION,
  GET_COPILOT_SUBSCRIPTION_COUNT,
  GET_LATEST_SESSION,
} from "./copilot-network.ts";
import { TypeSystemStore } from "./crdt-schema-manager.ts";
import { createZionProject, deleteProjectInZion } from "./project-manager.ts";
import type { NetworkAccount } from "../../account/domain/service/account.service.ts";
import type { ICopilotNetworkService } from "../domain/interface/copilot-network.interface.ts";
import type { OpaqueSchemaGraph } from "../../shared/domain/interface/type-system.ts";

export class ProjectService implements IProjectService {
  constructor(
    private myAccount: NetworkAccount,
    private dangerousAccount: NetworkAccount,
  ) {}
  getCopilotNetworkService(
    copilotSessionExId: string,
    userInput: string,
    schemaGraph: OpaqueSchemaGraph,
  ): ICopilotNetworkService {
    return new CopilotNetworkService(
      this.myAccount.gqlClient,
      this.myAccount.wsClient,
      copilotSessionExId,
      userInput,
      schemaGraph,
    );
  }

  private async createNewSession(project: ProjectEntity): Promise<string> {
    const result = await this.myAccount.gqlClient.gqlRequest<
      CreateCopilotSessionMutation,
      CreateCopilotSessionMutationVariables
    >(CREATE_COPILOT_SESSION, {
      projectExId: project.getData("projectExId"),
      sessionType: "COPILOT",
    });
    return result.createCopilotSession;
  }
  private async getLatestSession(
    project: ProjectEntity,
  ): Promise<string | null> {
    const latestSessionResult = await this.myAccount.gqlClient.gqlRequest<
      GetLatestSessionMutation,
      GetLatestSessionMutationVariables
    >(GET_LATEST_SESSION, {
      projectExId: project.getData("projectExId"),
      sessionType: "COPILOT",
    });
    return latestSessionResult.latestSession;
  }
  private async getSubscriptionCount(project: ProjectEntity): Promise<number> {
    const copilotSubscriptionCount = await this.myAccount.gqlClient.gqlRequest<
      GetCopilotSubscriptionCountQuery,
      GetCopilotSubscriptionCountQueryVariables
    >(GET_COPILOT_SUBSCRIPTION_COUNT, {
      projectExId: project.getData("projectExId"),
      sessionType: "COPILOT",
    });
    const count = z.coerce
      .number()
      .safeParse(copilotSubscriptionCount.copilotSubscriptionCount);
    if (!count.success) {
      throw new Error(count.error.message);
    }
    return count.data;
  }

  async createProjectInZion(
    project: ZionProjectEntity,
  ): Promise<ProjectEntity> {
    const createdProject = await createZionProject(
      this.myAccount.gqlClient,
      this.myAccount.wsClient,
      this.myAccount.account.getOrganizationExId(),
      project,
    );
    return new ProjectEntity(
      {
        ...project.getData(),
        projectExId: createdProject,
      },
      {},
    );
  }

  async createCopilotSession(project: ProjectEntity): Promise<string> {
    return this.createNewSession(project);
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
