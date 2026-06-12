import { z } from "zod";
import type {
  GetCopilotSubscriptionCountQuery,
  GetLatestSessionMutation,
  GetLatestSessionMutationVariables,
  GetCopilotSubscriptionCountQueryVariables,
  DeleteProjectMutation,
  DeleteProjectMutationVariables,
} from "../../../graphql/generated/types.ts";
import { ProjectEntity } from "../domain/entity/project.entity.ts";
import type { ZionProjectEntity } from "../domain/entity/zion-project.entity.ts";
import type { IZionProjectService } from "../domain/interface/project-service.interface.ts";
import {
  GET_COPILOT_SUBSCRIPTION_COUNT,
  GET_LATEST_SESSION,
} from "./copilot-network.ts";
import { createZionProject, GQL_DELETE_PROJECT } from "./project-manager.ts";
import type { IGQLClient } from "../../account/domain/interface/graphql-client.interface.ts";
import type { IWebSocketClient } from "../../account/domain/interface/websocket-client.interface.ts";

export class ZionProjectService implements IZionProjectService {
  private async getLatestSession(
    project: ProjectEntity,
    gqlClient: IGQLClient,
  ): Promise<string | null> {
    const latestSessionResult = await gqlClient.gqlRequest<
      GetLatestSessionMutation,
      GetLatestSessionMutationVariables
    >(GET_LATEST_SESSION, {
      projectExId: project.getData("projectExId"),
      sessionType: "COPILOT",
    });
    return latestSessionResult.latestSession;
  }
  private async getSubscriptionCount(
    project: ProjectEntity,
    gqlClient: IGQLClient,
  ): Promise<number> {
    const copilotSubscriptionCount = await gqlClient.gqlRequest<
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
    gqlClient: IGQLClient,
    wsClient: IWebSocketClient,
    organizationExId: string,
  ): Promise<string> {
    return createZionProject(gqlClient, wsClient, organizationExId, project);
  }
  async deleteProjectInZion(
    project: ProjectEntity,
    gqlClient: IGQLClient,
  ): Promise<void> {
    const isDeleted = await gqlClient.gqlRequest<
      DeleteProjectMutation,
      DeleteProjectMutationVariables
    >(GQL_DELETE_PROJECT, {
      projectExId: project.getData("projectExId"),
    });
    if (!isDeleted.deleteProject) {
      throw new Error(
        `Failed to delete project with exId ${project.getData("projectExId")}`,
      );
    }
  }
}
