import { z } from "zod";
import type {
  CreateCopilotSessionMutation,
  CreateCopilotSessionMutationVariables,
  GetCopilotSubscriptionCountQuery,
  GetCopilotSubscriptionCountQueryVariables,
  GetLatestSessionMutation,
  GetLatestSessionMutationVariables,
} from "../../../graphql/generated/types.ts";
import type { IGQLClient } from "../../shared/domain/interface/graphql-client.interface.ts";
import type { ICopilotSessionSetup } from "../domain/interface/copilot-session-setup.interface.ts";
import {
  CopilotNetworkService,
  CREATE_COPILOT_SESSION,
  GET_COPILOT_SUBSCRIPTION_COUNT,
  GET_LATEST_SESSION,
} from "./copilot-network.ts";
import type { IWebSocketClient } from "../../shared/domain/interface/websocket-client.interface.ts";
import type { ICopilotNetworkService } from "../domain/interface/copilot-network.interface.ts";
import type { ProjectEntity } from "../domain/entity/project.entity.ts";
import type { ICrdtSchemaLifecycle } from "../domain/interface/crdt-schema-lifecycle.interface.ts";

export class CopilotSessionSetup implements ICopilotSessionSetup {
  constructor(
    private gqlClient: IGQLClient,
    private wsClient: IWebSocketClient,
    private crdtSchemaLifecycleFactory: ICrdtSchemaLifecycle,
  ) {}

  async createNewSession(project: ProjectEntity): Promise<ICopilotNetworkService> {
    const result = await this.gqlClient.gqlRequest<
      CreateCopilotSessionMutation,
      CreateCopilotSessionMutationVariables
    >(CREATE_COPILOT_SESSION, {
      projectExId: project.getData("projectExId"),
      sessionType: "COPILOT",
    });
    return new CopilotNetworkService(
      this.gqlClient,
      this.wsClient,
      result.createCopilotSession,
      await this.crdtSchemaLifecycleFactory(project).schemaGraph(),
    );
  }
  private async getLatestSession(project: ProjectEntity): Promise<ICopilotNetworkService> {
    const latestSessionResult = await this.gqlClient.gqlRequest<
      GetLatestSessionMutation,
      GetLatestSessionMutationVariables
    >(GET_LATEST_SESSION, {
      projectExId: project.getData("projectExId"),
      sessionType: "COPILOT",
    });
    return latestSessionResult.latestSession
      ? new CopilotNetworkService(
          this.gqlClient,
          this.wsClient,
          latestSessionResult.latestSession,
          await this.crdtSchemaLifecycleFactory.create(project).schemaGraph(),
        )
      : this.createNewSession(project);
  }
  private async getSubscriptionCount(project: ProjectEntity): Promise<number> {
    const copilotSubscriptionCount = await this.gqlClient.gqlRequest<
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
}
