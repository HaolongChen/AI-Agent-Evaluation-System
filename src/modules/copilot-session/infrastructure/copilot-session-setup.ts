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
import type { ICrdtSchemaLifecycleFactory } from "../domain/interface/crdt-schema-lifecycle.interface.ts";
import type { OpaqueSchemaGraph } from "../../shared/domain/interface/type-system.ts";

export class CopilotSessionSetupFactory {
  constructor(
    private gqlClient: IGQLClient,
    private wsClient: IWebSocketClient,
    private crdtSchemaLifecycleFactory: ICrdtSchemaLifecycleFactory,
  ) {}

  build(projectExId: string): ICopilotSessionSetup {
    return new CopilotSessionSetup(
      projectExId,
      this.gqlClient,
      this.wsClient,
      this.crdtSchemaLifecycleFactory.create(projectExId).schemaGraph(),
    );
  }
}

export class CopilotSessionSetup implements ICopilotSessionSetup {
  constructor(
    private projectExId: string,
    private gqlClient: IGQLClient,
    private wsClient: IWebSocketClient,
    private schemaGraph: Promise<OpaqueSchemaGraph>,
  ) {}

  async createNewSession(): Promise<ICopilotNetworkService> {
    const result = await this.gqlClient.gqlRequest<
      CreateCopilotSessionMutation,
      CreateCopilotSessionMutationVariables
    >(CREATE_COPILOT_SESSION, {
      projectExId: this.projectExId,
      sessionType: "COPILOT",
    });
    return new CopilotNetworkService(
      this.gqlClient,
      this.wsClient,
      result.createCopilotSession,
      await this.schemaGraph,
    );
  }
  private async getLatestSession(): Promise<ICopilotNetworkService> {
    const latestSessionResult = await this.gqlClient.gqlRequest<
      GetLatestSessionMutation,
      GetLatestSessionMutationVariables
    >(GET_LATEST_SESSION, {
      projectExId: this.projectExId,
      sessionType: "COPILOT",
    });
    return latestSessionResult.latestSession
      ? new CopilotNetworkService(
          this.gqlClient,
          this.wsClient,
          latestSessionResult.latestSession,
          await this.schemaGraph,
        )
      : this.createNewSession();
  }
  private async getSubscriptionCount(): Promise<number> {
    const copilotSubscriptionCount = await this.gqlClient.gqlRequest<
      GetCopilotSubscriptionCountQuery,
      GetCopilotSubscriptionCountQueryVariables
    >(GET_COPILOT_SUBSCRIPTION_COUNT, {
      projectExId: this.projectExId,
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
