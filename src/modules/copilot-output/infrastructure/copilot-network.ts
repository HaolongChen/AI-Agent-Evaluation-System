import { gql } from "graphql-request";

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
      content {
        __typename
        ...CopilotMessageContent
      }
    }
  }
  ${COPILOT_MESSAGE_CONTENT_FRAGMENT}
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
`;

/**
 *
*
*{
"id": "20",
"type": "start",
"payload": {
    "variables": {
        "sessionExId": "<SESSION_EX_ID>"
    },
    "extensions": {},
    "operationName": "OnCopilotSessionUpdates",
    "query": "subscription OnCopilotSessionUpdates($sessionExId: String!) {\n  onCopilotSessionUpdate(sessionExId: $sessionExId) {\n    exId\n    createdAt\n    type\n    content {\n      __typename\n      messageType\n      ... on CopilotAiResponseMessage {\n        content\n        allowEvaluation\n      }\n      ... on CopilotErrorMessage {\n        content\n      }\n      ... on CopilotEditableTextMessage {\n        content\n        allowEvaluation\n        title\n      }\n      ... on CopilotFeedbackMessage {\n        feedbackCategory\n        optionalContent\n        evaluatedMessageExId\n      }\n      ... on CopilotHumanInputMessage {\n        content\n        context {\n          tableNames\n        }\n      }\n      ... on CopilotHumanOperationMessage {\n        humanOperationType\n        optionalContent\n      }\n      ... on CopilotInitialStateMessage {\n        currentJobIsRunning\n        terminated\n        copilotMessages {\n          exId\n          createdAt\n          type\n          content {\n            __typename\n            messageType\n            ... on CopilotAiResponseMessage {\n              content\n              allowEvaluation\n            }\n            ... on CopilotErrorMessage {\n              content\n            }\n            ... on CopilotEditableTextMessage {\n              content\n              allowEvaluation\n              title\n            }\n            ... on CopilotFeedbackMessage {\n              feedbackCategory\n              optionalContent\n              evaluatedMessageExId\n            }\n            ... on CopilotHumanInputMessage {\n              content\n              context {\n                tableNames\n              }\n            }\n            ... on CopilotHumanOperationMessage {\n              humanOperationType\n              optionalContent\n            }\n            ... on CopilotStateChangeMessage {\n              currentJobIsRunning\n            }\n            ... on CopilotStopMessage {\n              reason\n            }\n            ... on CopilotSystemStatusMessage {\n              content\n            }\n            ... on CopilotTaskMessage {\n              taskId\n              name\n              description\n              diff\n              isDiffReverted\n            }\n            ... on CopilotTaskRevertSuccessMessage {\n              taskIds\n            }\n            ... on CopilotTerminateMessage {\n              reason\n            }\n            ... on CopilotToolCallBatchExecErrorMessage {\n              toolCallBatchId\n              error\n              context {\n                toolCalls\n                result\n                schemaExId\n                lastPatchExId\n              }\n            }\n            ... on CopilotToolCallBatchMessage {\n              toolCallBatchId\n              toolCalls {\n                id\n                name\n                args\n              }\n            }\n            ... on CopilotToolCallBatchResponseMessage {\n              toolCallBatchId\n              responseByToolCallId\n              schemaDiff\n            }\n          }\n        }\n      }\n      ... on CopilotStateChangeMessage {\n        currentJobIsRunning\n      }\n      ... on CopilotStopMessage {\n        reason\n      }\n      ... on CopilotSystemStatusMessage {\n        content\n      }\n      ... on CopilotTaskMessage {\n        taskId\n        name\n        description\n        diff\n        isDiffReverted\n      }\n      ... on CopilotTaskRevertSuccessMessage {\n        taskIds\n      }\n      ... on CopilotTerminateMessage {\n        reason\n      }\n      ... on CopilotToolCallBatchExecErrorMessage {\n        toolCallBatchId\n        error\n        context {\n          toolCalls\n          result\n          schemaExId\n          lastPatchExId\n        }\n      }\n      ... on CopilotToolCallBatchMessage {\n        toolCallBatchId\n        toolCalls {\n          id\n          name\n          args\n        }\n      }\n      ... on CopilotToolCallBatchResponseMessage {\n        toolCallBatchId\n        responseByToolCallId\n        schemaDiff\n      }\n    }\n  }\n}\n"
}
}
 *
 */
