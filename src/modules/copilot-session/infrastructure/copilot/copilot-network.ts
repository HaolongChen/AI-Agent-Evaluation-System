import { gql } from "graphql-tag";
import type {
  OnCopilotSessionUpdatesSubscription,
  OnCopilotSessionUpdatesSubscriptionVariables,
  SendMessageToSessionMutation,
  SendMessageToSessionMutationVariables,
} from "../../../../graphql/generated/types.ts";
import type { ICopilotNetworkService } from "../interface/copilot-network.interface.ts";

import type { INetworkService } from "../../../account/domain/interface/network-service.interface.ts";
import type { NetworkClient } from "../../../account/domain/entity/network-client.entity.ts";
import {
  inputMessageList,
  typeNameList,
  type CopilotInputMessage,
} from "./copilot.schema.ts";
import { logger } from "../../../shared/infrastructure/logger.ts";
import { CopilotResponseEvent } from "./copilot-event.schema.ts";

export const GET_COPILOT_SUBSCRIPTION_COUNT = gql`
  query GetCopilotSubscriptionCount(
    $projectExId: String!
    $sessionType: CopilotSessionType!
  ) {
    copilotSubscriptionCount(
      projectExId: $projectExId
      sessionType: $sessionType
    )
  }
`;

export const CREATE_COPILOT_SESSION = gql`
  mutation CreateCopilotSession(
    $projectExId: String!
    $sessionType: CopilotSessionType!
  ) {
    createCopilotSession(projectExId: $projectExId, sessionType: $sessionType)
  }
`;

export const GET_LATEST_SESSION = gql`
  mutation GetLatestSession(
    $projectExId: String!
    $sessionType: CopilotSessionType!
  ) {
    latestSession(projectExId: $projectExId, sessionType: $sessionType)
  }
`;

export const SEND_MESSAGE_TO_SESSION = gql`
  mutation SendMessageToSession(
    $sessionExId: String!
    $argsInput: MessageArgsInputInput!
  ) {
    sendMessageToSession(sessionExId: $sessionExId, argsInput: $argsInput)
  }
`;

export const COPILOT_AI_RESPONSE_MESSAGE_FRAGMENT = gql`
  fragment CopilotAIResponseMessage on CopilotAiResponseMessage {
    __typename
    content
    allowEvaluation
    messageType
  }
`;

export const COPILOT_ERROR_MESSAGE_FRAGMENT = gql`
  fragment CopilotErrorMessage on CopilotErrorMessage {
    __typename
    content
    messageType
  }
`;

export const COPILOT_EDITABLE_TEXT_MESSAGE_FRAGMENT = gql`
  fragment CopilotEditableTextMessage on CopilotEditableTextMessage {
    __typename
    content
    allowEvaluation
    title
    messageType
  }
`;

export const COPILOT_FEEDBACK_MESSAGE_FRAGMENT = gql`
  fragment CopilotFeedbackMessage on CopilotFeedbackMessage {
    __typename
    feedbackCategory
    evaluatedMessageExId
    optionalContent
    messageType
  }
`;

export const COPILOT_HUMAN_INPUT_MESSAGE_FRAGMENT = gql`
  fragment CopilotHumanInputMessage on CopilotHumanInputMessage {
    __typename
    content
    messageType
    context {
      __typename
      tableNames
    }
  }
`;

export const COPILOT_HUMAN_OPERATION_MESSAGE_FRAGMENT = gql`
  fragment CopilotHumanOperationMessage on CopilotHumanOperationMessage {
    __typename
    optionalContent
    humanOperationType
    messageType
  }
`;

export const COPILOT_STATE_CHANGE_MESSAGE_FRAGMENT = gql`
  fragment CopilotStateChangeMessage on CopilotStateChangeMessage {
    __typename
    currentJobIsRunning
    messageType
  }
`;

export const COPILOT_STOP_MESSAGE_FRAGMENT = gql`
  fragment CopilotStopMessage on CopilotStopMessage {
    __typename
    reason
    messageType
  }
`;

export const COPILOT_SYSTEM_STATUS_MESSAGE_FRAGMENT = gql`
  fragment CopilotSystemStatusMessage on CopilotSystemStatusMessage {
    __typename
    content
    messageType
  }
`;

export const COPILOT_TASK_MESSAGE_FRAGMENT = gql`
  fragment CopilotTaskMessage on CopilotTaskMessage {
    __typename
    taskId
    name
    description
    diff
    isDiffReverted
    messageType
  }
`;

export const COPILOT_TASK_REVERT_SUCCESS_MESSAGE_FRAGMENT = gql`
  fragment CopilotTaskRevertSuccessMessage on CopilotTaskRevertSuccessMessage {
    __typename
    taskIds
    messageType
  }
`;

export const COPILOT_TERMINATE_MESSAGE_FRAGMENT = gql`
  fragment CopilotTerminateMessage on CopilotTerminateMessage {
    __typename
    reason
    messageType
  }
`;

export const COPILOT_TOOL_CALL_BATCH_EXEC_ERROR_MESSAGE_FRAGMENT = gql`
  fragment CopilotToolCallBatchExecErrorMessage on CopilotToolCallBatchExecErrorMessage {
    __typename
    toolCallBatchId
    messageType
    error
    context {
      __typename
      toolCalls
      result
      schemaExId
      lastPatchExId
    }
  }
`;

export const COPILOT_TOOL_CALL_BATCH_MESSAGE_FRAGMENT = gql`
  fragment CopilotToolCallBatchMessage on CopilotToolCallBatchMessage {
    __typename
    toolCallBatchId
    messageType
    toolCalls {
      __typename
      id
      name
      args
    }
  }
`;

export const COPILOT_TOOL_CALL_BATCH_RESPONSE_MESSAGE_FRAGMENT = gql`
  fragment CopilotToolCallBatchResponseMessage on CopilotToolCallBatchResponseMessage {
    __typename
    toolCallBatchId
    responseByToolCallId
    messageType
    schemaDiff
  }
`;
export const COPILOT_MESSAGE_CONTENT_FRAGMENT = gql`
  fragment CopilotMessageContent on CopilotContentMessage {
    __typename
    messageType
    ...CopilotAIResponseMessage
    ...CopilotErrorMessage
    ...CopilotEditableTextMessage
    ...CopilotFeedbackMessage
    ...CopilotHumanInputMessage
    ...CopilotHumanOperationMessage
    ...CopilotStateChangeMessage
    ...CopilotStopMessage
    ...CopilotSystemStatusMessage
    ...CopilotTaskMessage
    ...CopilotTaskRevertSuccessMessage
    ...CopilotTerminateMessage
    ...CopilotToolCallBatchExecErrorMessage
    ...CopilotToolCallBatchMessage
    ...CopilotToolCallBatchResponseMessage
  }
  ${COPILOT_AI_RESPONSE_MESSAGE_FRAGMENT}
  ${COPILOT_ERROR_MESSAGE_FRAGMENT}
  ${COPILOT_EDITABLE_TEXT_MESSAGE_FRAGMENT}
  ${COPILOT_FEEDBACK_MESSAGE_FRAGMENT}
  ${COPILOT_HUMAN_INPUT_MESSAGE_FRAGMENT}
  ${COPILOT_HUMAN_OPERATION_MESSAGE_FRAGMENT}
  ${COPILOT_STATE_CHANGE_MESSAGE_FRAGMENT}
  ${COPILOT_STOP_MESSAGE_FRAGMENT}
  ${COPILOT_SYSTEM_STATUS_MESSAGE_FRAGMENT}
  ${COPILOT_TASK_MESSAGE_FRAGMENT}
  ${COPILOT_TASK_REVERT_SUCCESS_MESSAGE_FRAGMENT}
  ${COPILOT_TERMINATE_MESSAGE_FRAGMENT}
  ${COPILOT_TOOL_CALL_BATCH_EXEC_ERROR_MESSAGE_FRAGMENT}
  ${COPILOT_TOOL_CALL_BATCH_MESSAGE_FRAGMENT}
  ${COPILOT_TOOL_CALL_BATCH_RESPONSE_MESSAGE_FRAGMENT}
`;
export const COPILOT_INITIAL_STATE_MESSAGE_FRAGMENT = gql`
  fragment CopilotInitialStateMessage on CopilotInitialStateMessage {
    __typename
    currentJobIsRunning
    terminated
    messageType
    copilotMessages {
      exId
      type
      createdAt
    }
  }
`;
export const ON_COPILOT_SESSION_UPDATES = gql`
  subscription OnCopilotSessionUpdates($sessionExId: String!) {
    onCopilotSessionUpdate(sessionExId: $sessionExId) {
      __typename
      exId
      createdAt
      type
      content {
        __typename
        messageType
        ...CopilotMessageContent
        ...CopilotInitialStateMessage
      }
    }
  }
  ${COPILOT_MESSAGE_CONTENT_FRAGMENT}
  ${COPILOT_INITIAL_STATE_MESSAGE_FRAGMENT}
`;

export class CopilotNetworkService implements ICopilotNetworkService {
  constructor(private readonly networkService: INetworkService) {}

  async sendMessageToSession<T extends keyof CopilotInputMessage>(
    sessionExId: string,
    networkClient: NetworkClient,
    type: T,
    message: CopilotInputMessage[T],
  ): Promise<void> {
    const gqlClient = this.networkService.gqlClient(networkClient);
    const response = await gqlClient.gqlRequest<
      SendMessageToSessionMutation,
      SendMessageToSessionMutationVariables
    >(SEND_MESSAGE_TO_SESSION, {
      sessionExId,
      argsInput: {
        copilotArgs: {
          [inputMessageList[type].property]: message,
          copilotMessageType: inputMessageList[type].type,
        },
      },
    });
    if (!response.sendMessageToSession) {
      throw new Error("Failed to send message to session");
    }
  }
  subscribeToSessionUpdates(
    sessionExId: string,
    networkClient: NetworkClient,
    publish: (event: CopilotResponseEvent) => void,
  ): () => void {
    const wsClient = this.networkService.wsClient(networkClient);
    return wsClient.subscribe<
      OnCopilotSessionUpdatesSubscription,
      OnCopilotSessionUpdatesSubscriptionVariables
    >(
      ON_COPILOT_SESSION_UPDATES,
      {
        next: (data) => {
          const content = data?.onCopilotSessionUpdate?.content;

          if (!content) {
            throw new Error("Received subscription update without content");
          }

          logger.info("Received subscription update:", content);
          for (const typeName of typeNameList) {
            if (content.__typename === typeName) {
              return publish(new CopilotResponseEvent(content));
            }
          }
        },
        error: (error) => {
          logger.error("Subscription error:", error);
        },
        complete: () => {
          logger.info("Subscription completed");
        },
      },
      { sessionExId },
    );
  }
}
