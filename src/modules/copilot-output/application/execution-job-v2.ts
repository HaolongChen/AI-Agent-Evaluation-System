import type { Account } from "../../account/application/account-handler.ts";
import type { CopilotJobEntity } from "../domain/entity/copilot-job.entity.ts";
import type {
  GQLClient,
  SubscriptionHandlers,
  WebSocketClient,
} from "../../shared/application/graphql-client.ts";
import type {
  CreateCopilotSessionMutation,
  CreateCopilotSessionMutationVariables,
  GetCopilotSubscriptionCountQuery,
  GetCopilotSubscriptionCountQueryVariables,
  GetLatestSessionMutation,
  GetLatestSessionMutationVariables,
  OnCopilotSessionUpdatesSubscription,
  OnCopilotSessionUpdatesSubscription_onCopilotSessionUpdate_content,
  OnCopilotSessionUpdatesSubscriptionVariables,
} from "../../../graphql/generated/types.ts";
import {
  CREATE_COPILOT_SESSION,
  GET_COPILOT_SUBSCRIPTION_COUNT,
  GET_LATEST_SESSION,
  ON_COPILOT_SESSION_UPDATES,
} from "../infrastructure/copilot-network.ts";
import { z } from "zod";
import { Event } from "ts-event-target";

export type CopilotMessageContent =
  OnCopilotSessionUpdatesSubscription_onCopilotSessionUpdate_content;

type CopilotMessageContentMap = {
  [T in CopilotMessageContent as T["__typename"]]: {
    [K in Exclude<keyof T, "__typename" | "messageType">]: T[K];
  };
};

export const typeNameList = [
  "CopilotAiResponseMessage",
  "CopilotEditableTextMessage",
  "CopilotErrorMessage",
  "CopilotFeedbackMessage",
  "CopilotHumanInputMessage",
  "CopilotHumanOperationMessage",
  "CopilotInitialStateMessage",
  "CopilotStateChangeMessage",
  "CopilotStopMessage",
  "CopilotSystemStatusMessage",
  "CopilotTaskMessage",
  "CopilotTaskRevertSuccessMessage",
  "CopilotTerminateMessage",
  "CopilotToolCallBatchExecErrorMessage",
  "CopilotToolCallBatchMessage",
  "CopilotToolCallBatchResponseMessage",
] as const;

export class CopilotEvent<T extends keyof TypeNameList> extends Event<T> {
  constructor(
    type: T,
    readonly data: CopilotMessageContentMap[T],
  ) {
    super(type);
  }
}

export type TypeNameList = {
  [K in (typeof typeNameList)[number]]: K extends CopilotMessageContent["__typename"]
    ? K
    : never;
};

export type CopilotEventsList = { [K in keyof TypeNameList]: CopilotEvent<K> };

export class ExecutionJobRunnerV2 {
  private _gqlClient: GQLClient | undefined;
  private _wsClient: WebSocketClient | undefined;
  private unsubscribe: (() => void) | undefined;
  constructor(
    private copilotJobEntity: CopilotJobEntity,
    private account: Account,
    // private copilotEventTarget: EventTarget<
    // 	CopilotEvent<keyof CopilotMessageContentMap>[]
    // >,
    private _copilotEventPublisher: (
      event: CopilotEventsList[keyof CopilotEventsList],
    ) => void,
  ) {}

  async gqlClient(): Promise<GQLClient> {
    if (this._gqlClient) return this._gqlClient;
    await this.account.ensureLoggedIn();
    this._gqlClient = await this.account.getGQLClient();
    return this._gqlClient;
  }

  async wsClient(): Promise<WebSocketClient> {
    if (this._wsClient) return this._wsClient;
    await this.account.ensureLoggedIn();
    this._wsClient = await this.account.getWsClient();
    return this._wsClient;
  }

  async getSubscriptionCount(): Promise<number> {
    const gqlClient = await this.gqlClient();
    const copilotSubscriptionCount = await gqlClient.gqlRequest<
      GetCopilotSubscriptionCountQuery,
      GetCopilotSubscriptionCountQueryVariables
    >(GET_COPILOT_SUBSCRIPTION_COUNT, {
      projectExId: this.copilotJobEntity.data.projectExId,
      sessionType: "COPILOT",
    });
    const count = z.coerce
      .number()
      .safeParse(copilotSubscriptionCount.copilotSubscriptionCount);
    if (!count.success) {
      throw new Error(count.error.message);
    }
    return count.data;
    // TODO: get last session
  }

  async getLatestSession(): Promise<string | null> {
    const gqlClient = await this.gqlClient();
    const latestSessionResult = await gqlClient.gqlRequest<
      GetLatestSessionMutation,
      GetLatestSessionMutationVariables
    >(GET_LATEST_SESSION, {
      projectExId: this.copilotJobEntity.data.projectExId,
      sessionType: "COPILOT",
    });
    return latestSessionResult.latestSession;
  }

  async createNewSession() {
    const gqlClient = await this.gqlClient();
    const newCopilotSessionExId = await gqlClient.gqlRequest<
      CreateCopilotSessionMutation,
      CreateCopilotSessionMutationVariables
    >(CREATE_COPILOT_SESSION, {
      projectExId: this.copilotJobEntity.data.projectExId,
      sessionType: "COPILOT",
    });
    return newCopilotSessionExId.createCopilotSession;
  }

  private handler(
    publish: (event: CopilotEventsList[keyof CopilotEventsList]) => void,
  ): SubscriptionHandlers<OnCopilotSessionUpdatesSubscription> {
    return {
      next: (data) => {
        console.log("Received subscription data:", data);
        const content = data.onCopilotSessionUpdate?.content;
        if (!content) {
          console.warn("Received session update without content", { data });
          return;
        }
        const event = new CopilotEvent(
          content.__typename,
          content,
        ) as CopilotEventsList[keyof CopilotEventsList];
        publish(event);
      },
      error: (error) => {
        console.error("Subscription error:", error);
      },
      complete: () => {
        console.info("Subscription completed");
      },
    };
  }

  execute(sessionExId: string): () => void {
    if (!this._wsClient) {
      throw new Error("WebSocket client is not initialized");
    }
    return (this.unsubscribe = this._wsClient.gqlSubscribe<
      OnCopilotSessionUpdatesSubscription,
      OnCopilotSessionUpdatesSubscriptionVariables
    >(
      ON_COPILOT_SESSION_UPDATES,
      { sessionExId },
      this.handler(this._copilotEventPublisher),
    ));
  }
}
