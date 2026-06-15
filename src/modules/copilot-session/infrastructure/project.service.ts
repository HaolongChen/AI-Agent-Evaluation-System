import { z } from "zod";
import type {
  GetCopilotSubscriptionCountQuery,
  GetLatestSessionMutation,
  GetLatestSessionMutationVariables,
  GetCopilotSubscriptionCountQueryVariables,
  DeleteProjectMutation,
  DeleteProjectMutationVariables,
} from "../../../graphql/generated/types.ts";
import type { ZionProject } from "../domain/entity/zion-project.entity.ts";
import type { IZionProjectService } from "../domain/interface/project-service.interface.ts";
import {
  GET_COPILOT_SUBSCRIPTION_COUNT,
  GET_LATEST_SESSION,
} from "./copilot-network.ts";
import { createZionProject, GQL_DELETE_PROJECT } from "./project-manager.ts";
import type { IGQLClient } from "../../account/domain/interface/graphql-client.interface.ts";
import type { Account } from "../../account/domain/aggregate/account.aggregate.ts";
import type { INetworkService } from "../../account/domain/interface/network-service.interface.ts";
import type { NetworkClientEntity } from "../../account/domain/entity/network-client.entity.ts";

export class ZionProjectService implements IZionProjectService
{

  constructor ( private readonly networkService: INetworkService ) {}

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
    account: Account
  ): Promise<string>
  {
    const gqlClient = this.networkService.gqlClient(account.getEntity("networkClient"));
    const wsClient = this.networkService.wsClient(account.getEntity("networkClient"));
    const organizationExId = account.getData("organizationExId");
    return createZionProject(gqlClient, wsClient, organizationExId, project);
  }
  async deleteProjectInZion(
    projectExId: string,
    networkClient: NetworkClientEntity
  ): Promise<void> {
    const gqlClient = this.networkService.gqlClient(networkClient);
    const isDeleted = await gqlClient.gqlRequest<
      DeleteProjectMutation,
      DeleteProjectMutationVariables
    >(GQL_DELETE_PROJECT, {
      projectExId,
    });
    if (!isDeleted.deleteProject) {
      throw new Error(
        `Failed to delete project with exId ${projectExId}`,
      );
    }
  }
}
