import type {
  GQLClient,
  SubscriptionHandlers,
  WebSocketClient,
} from "../../shared/application/graphql-client.ts";
import {
  type OnCopilotSessionUpdatesSubscriptionVariables,
  type SendMessageToSessionMutation,
  type SendMessageToSessionMutationVariables,
  type OnCopilotSessionUpdatesSubscription,
} from "../../../graphql/generated/types.ts";
import {
  ON_COPILOT_SESSION_UPDATES,
  SEND_MESSAGE_TO_SESSION,
} from "../infrastructure/copilot-network.ts";
import { Event, EventTarget } from "ts-event-target";
import { logger } from "../../shared/infrastructure/logger.ts";
import {
  type CopilotInputMessage,
  inputMessageTypeList,
  typeNameList,
} from "../domain/schema/copilot.schema.ts";
import {
  CopilotEvent,
  type CopilotEventsList,
  type CopilotEventType,
  type CopilotInputEventType,
} from "../domain/entity/copilot-job.entity.ts";
export class ExecutionJobRunnerV2 {
  private copilotInputEvent: EventTarget<CopilotInputEventType> =
    new EventTarget();
  private copilotEvent: EventTarget<CopilotEventType> = new EventTarget();
  constructor(
    private sessionExId: string,
    private wsClient: WebSocketClient,
    private gqlClient: GQLClient,
  ) {}

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
        const content = data?.onCopilotSessionUpdate?.content;

        if (!content) {
          throw new Error("Received subscription update without content");
        }

        logger.info("Received subscription update:", content);

        const event = new CopilotEvent(
          content.__typename,
          content,
        ) as CopilotEventsList[keyof CopilotEventsList];
        publish(event);
      },
      error: (error) => {
        logger.error("Subscription error:", error);
      },
      complete: () => {
        logger.info("Subscription completed");
      },
    };
  }

  execute() {
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
    this.copilotInputEvent.addEventListener("HUMAN_OPERATION", (event) => {
      this.sendMessageToSession(event.type, event.data);
    });
    const observer = this.wsClient.gqlSubscribe<
      OnCopilotSessionUpdatesSubscription,
      OnCopilotSessionUpdatesSubscriptionVariables
    >(ON_COPILOT_SESSION_UPDATES, { sessionExId: this.sessionExId });
    const unsubscribe = observer(
      this.handler(this.copilotEvent.dispatchEvent.bind(this.copilotEvent)),
    );
    return {
      publish: this.copilotInputEvent.dispatchEvent.bind(
        this.copilotInputEvent,
      ),
      listen: this.copilotEvent.addEventListener.bind(this.copilotEvent),
    };
  }
}
