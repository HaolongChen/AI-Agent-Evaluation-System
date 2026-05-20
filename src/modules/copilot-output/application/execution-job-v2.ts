import type {
  GQLClient,
  SubscriptionHandlers,
  WebSocketClient,
} from "../../shared/application/graphql-client.ts";
import {
  type OnCopilotSessionUpdatesSubscription_onCopilotSessionUpdate_content,
  type OnCopilotSessionUpdatesSubscriptionVariables,
  type SendMessageToSessionMutation,
  type SendMessageToSessionMutationVariables,
  type OnCopilotSessionUpdatesSubscription,
  CopilotMessageType,
  type CopilotFeedbackMessageInput,
  type CopilotHumanInputMessageInput,
  type CopilotHumanOperationMessageInput,
  type CopilotStopMessageInput,
  type CopilotToolCallBatchResponseMessageInput,
  type CopilotToolCallBatchExecErrorMessageInput,
  type CopilotTerminateMessageInput,
  type CopilotTaskRevertSuccessMessageInput,
} from "../../../graphql/generated/types.ts";
import {
  ON_COPILOT_SESSION_UPDATES,
  SEND_MESSAGE_TO_SESSION,
} from "../infrastructure/copilot-network.ts";
import { Event, EventTarget } from "ts-event-target";

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

export type CopilotInputMessage = {
  [CopilotMessageType.Feedback]: CopilotFeedbackMessageInput;
  [CopilotMessageType.HumanInput]: CopilotHumanInputMessageInput;
  [CopilotMessageType.HumanOperation]: CopilotHumanOperationMessageInput;
  [CopilotMessageType.Stop]: CopilotStopMessageInput;
  [CopilotMessageType.ToolCallBatchResponse]: CopilotToolCallBatchResponseMessageInput;
  [CopilotMessageType.ToolCallBatchExecError]: CopilotToolCallBatchExecErrorMessageInput;
  [CopilotMessageType.Terminate]: CopilotTerminateMessageInput;
  [CopilotMessageType.TaskRevertSuccess]: CopilotTaskRevertSuccessMessageInput;
};

const inputMessageTypeList: Record<keyof CopilotInputMessage, string> = {
  [CopilotMessageType.Feedback]: "feedbackMessage",
  [CopilotMessageType.HumanInput]: "humanInputMessage",
  [CopilotMessageType.HumanOperation]: "humanOperationMessage",
  [CopilotMessageType.Stop]: "stopMessage",
  [CopilotMessageType.ToolCallBatchResponse]: "toolCallBatchResponseMessage",
  [CopilotMessageType.ToolCallBatchExecError]: "toolCallBatchExecErrorMessage",
  [CopilotMessageType.Terminate]: "terminateMessage",
  [CopilotMessageType.TaskRevertSuccess]: "taskRevertSuccessMessage",
} as const;

export class CopilotEvent<T extends keyof TypeNameList> extends Event<T> {
  constructor(
    type: T,
    readonly data: CopilotMessageContentMap[T],
  ) {
    super(type);
  }
}

export class CopilotInputEvent<
  T extends keyof CopilotInputMessage,
> extends Event<T> {
  constructor(
    type: T,
    readonly data: CopilotInputMessage[T],
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
export type CopilotInputEventsList = {
  [K in keyof CopilotInputMessage]: CopilotInputEvent<K>;
};

export class ExecutionJobRunnerV2 {
  private copilotInputEvent: EventTarget<
    [CopilotInputEventsList[keyof CopilotInputEventsList], Event<"unsubscribe">]
  >;
  private copilotEvent: EventTarget<
    [CopilotEventsList[keyof CopilotEventsList]]
  >;
  constructor(
    private sessionExId: string,
    private wsClient: WebSocketClient,
    private gqlClient: GQLClient,
  ) {
    this.copilotInputEvent = new EventTarget<
      [
        CopilotInputEventsList[keyof CopilotInputEventsList],
        Event<"unsubscribe">,
      ]
    >();
    this.copilotEvent = new EventTarget<
      [CopilotEventsList[keyof CopilotEventsList]]
    >();
  }

  sendMessageToSession = async <T extends keyof CopilotInputMessage>(
    type: T,
    message: CopilotInputMessage[T],
  ) => {
    const response = await this.gqlClient.gqlRequest<
      SendMessageToSessionMutation,
      SendMessageToSessionMutationVariables
    >(SEND_MESSAGE_TO_SESSION, {
      sessionExId: this.sessionExId,
      argsInput: {
        copilotArgs: {
          [inputMessageTypeList[type]]: message,
          copilotMessageType: type,
        },
      },
    });
    if (!response.sendMessageToSession) {
      throw new Error("Failed to send message to session");
    }
  };

  private handler(
    publish: (event: CopilotEventsList[keyof CopilotEventsList]) => void,
  ): SubscriptionHandlers<OnCopilotSessionUpdatesSubscription> {
    return {
      next: (data) => {
        console.log("Received subscription data:", data);
        const content = data?.onCopilotSessionUpdate?.content;

        if (!content) {
          console.warn("Received session update without content", { data });
          return;
        }
        console.log(
          "🚀 ---------------------------------------------------------------------------------🚀",
        );
        console.log(
          "🚀 ~ execution-job-v2.ts:140 ~ ExecutionJobRunnerV2 ~ handler ~ content:",
          content,
        );
        console.log(
          "🚀 ---------------------------------------------------------------------------------🚀",
        );

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

  execute() {
    const observer = this.wsClient.gqlSubscribe<
      OnCopilotSessionUpdatesSubscription,
      OnCopilotSessionUpdatesSubscriptionVariables
    >(ON_COPILOT_SESSION_UPDATES, { sessionExId: this.sessionExId });
    const unsubscribe = observer(
      this.handler(this.copilotEvent.dispatchEvent.bind(this.copilotEvent)),
    );
    this.copilotInputEvent.addEventListener("unsubscribe", () => {
      unsubscribe();
      for (const copilotEventName of typeNameList) {
        this.copilotEvent.removeAllEventListeners(copilotEventName);
      }
    });
    this.copilotInputEvent.addEventListener("TERMINATE", (event) => {
      this.sendMessageToSession(event.type, event.data);
      this.copilotInputEvent.dispatchEvent(new Event("unsubscribe"));
    });
    this.copilotInputEvent.addEventListener(
      "TOOL_CALL_BATCH_RESPONSE",
      (event) => {
        this.sendMessageToSession(event.type, event.data);
      },
    );

    this.copilotInputEvent.addEventListener("HUMAN_INPUT", (event) => {
      this.sendMessageToSession(event.type, event.data);
    });
    return {
      publish: this.copilotInputEvent.dispatchEvent.bind(
        this.copilotInputEvent,
      ),
      listen: this.copilotEvent.addEventListener.bind(this.copilotEvent),
    };
  }
}
