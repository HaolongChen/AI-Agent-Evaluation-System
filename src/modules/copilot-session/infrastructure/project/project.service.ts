import { z } from "zod";
import type {
  GetCopilotSubscriptionCountQuery,
  GetLatestSessionMutation,
  GetLatestSessionMutationVariables,
  GetCopilotSubscriptionCountQueryVariables,
  DeleteProjectMutation,
  DeleteProjectMutationVariables,
  CreateCopilotSessionMutation,
  CreateCopilotSessionMutationVariables,
} from "../../../../graphql/generated/types.ts";
import type { ZionProject } from "../../domain/entity/zion-project.entity.ts";
import type { IZionProjectService } from "../../domain/interface/project-service.interface.ts";
import {
  CREATE_COPILOT_SESSION,
  GET_COPILOT_SUBSCRIPTION_COUNT,
  GET_LATEST_SESSION,
} from "../copilot/copilot-network.ts";
import { createZionProject, GQL_DELETE_PROJECT } from "./project-manager.ts";
import type { IGQLClient } from "../../../account/domain/interface/graphql-client.interface.ts";
import type { INetworkService } from "../../../account/domain/interface/network-service.interface.ts";
import type { NetworkClient } from "../../../account/domain/entity/network-client.entity.ts";
import type { Account } from "../../../account/domain/entity/account.entity.ts";
import type { ICrdtSchemaService } from "../interface/crdt-schema.interface.ts";
import type { CopilotExecutionAggregate } from "../../domain/aggregate/copilot-execution.aggregate.ts";
import type { ProjectAggregate } from "../../domain/aggregate/project.aggregate.ts";

export class ZionProjectService implements IZionProjectService {
  constructor(
    private readonly networkService: INetworkService,
    private readonly crdtSchemaService: ICrdtSchemaService,
  ) {}
  async createSafeCopilotSession(
    project: ProjectAggregate,
    copilotExecutionAggregate: CopilotExecutionAggregate,
  ): Promise<void> {
    const projectExId =
      copilotExecutionAggregate.verifyActivatedProject(project);
    const copilotSessionExId = await this.createCopilotSession(
      projectExId,
      copilotExecutionAggregate.network,
    );
    copilotExecutionAggregate.start(copilotSessionExId);
  }
  async importSchemaById(
    schemaId: string,
    projectExId: string,
    dangerousNetworkClient: NetworkClient,
  ): Promise<void> {
    return this.crdtSchemaService.importSchema(
      schemaId,
      projectExId,
      dangerousNetworkClient,
    );
  }
  async getSchemaGraph(
    projectExId: string,
    networkClient: NetworkClient,
  ): Promise<unknown> {
    const schemaId = await this.crdtSchemaService.getSchemaIdByProjectExId(
      projectExId,
      networkClient,
    );
    return this.crdtSchemaService.getSchemaGraph(schemaId, networkClient);
  }

  private async getLatestSession(
    projectExId: string,
    gqlClient: IGQLClient,
  ): Promise<string | null> {
    const latestSessionResult = await gqlClient.gqlRequest<
      GetLatestSessionMutation,
      GetLatestSessionMutationVariables
    >(GET_LATEST_SESSION, {
      projectExId,
      sessionType: "COPILOT",
    });
    return latestSessionResult.latestSession;
  }
  private async getSubscriptionCount(
    projectExId: string,
    gqlClient: IGQLClient,
  ): Promise<number> {
    const copilotSubscriptionCount = await gqlClient.gqlRequest<
      GetCopilotSubscriptionCountQuery,
      GetCopilotSubscriptionCountQueryVariables
    >(GET_COPILOT_SUBSCRIPTION_COUNT, {
      projectExId,
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
    project: ZionProject,
    account: Account,
    networkClient: NetworkClient,
  ): Promise<string> {
    const gqlClient = this.networkService.gqlClient(networkClient);
    const wsClient = this.networkService.wsClient(networkClient);
    const organizationExId = account.getData("organizationExId");
    return createZionProject(gqlClient, wsClient, organizationExId, project);
  }
  async deleteProjectInZion(
    projectExId: string,
    networkClient: NetworkClient,
  ): Promise<void> {
    const gqlClient = this.networkService.gqlClient(networkClient);
    const isDeleted = await gqlClient.gqlRequest<
      DeleteProjectMutation,
      DeleteProjectMutationVariables
    >(GQL_DELETE_PROJECT, {
      projectExId,
    });
    if (!isDeleted.deleteProject) {
      throw new Error(`Failed to delete project with exId ${projectExId}`);
    }
  }

  async createCopilotSession(
    projectExId: string,
    networkClient: NetworkClient,
  ): Promise<string> {
    const gqlClient = this.networkService.gqlClient(networkClient);
    const result = await gqlClient.gqlRequest<
      CreateCopilotSessionMutation,
      CreateCopilotSessionMutationVariables
    >(CREATE_COPILOT_SESSION, {
      projectExId,
      sessionType: "COPILOT",
    });
    return result.createCopilotSession;
  }
}
