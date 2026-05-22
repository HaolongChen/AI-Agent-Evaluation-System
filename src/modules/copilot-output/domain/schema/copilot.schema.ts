import z from "zod";
import {
  type CopilotFeedbackMessageInput,
  type CopilotHumanInputMessageInput,
  type CopilotHumanOperationMessageInput,
  CopilotMessageType,
  type CopilotStopMessageInput,
  type CopilotTaskRevertSuccessMessageInput,
  type CopilotTerminateMessageInput,
  type CopilotToolCallBatchExecErrorMessageInput,
  type CopilotToolCallBatchResponseMessageInput,
  type OnCopilotSessionUpdatesSubscription_onCopilotSessionUpdate_content,
} from "../../../../graphql/generated/types.ts";

export const copilotJobSchema = z.object({
  projectExId: z.string(),
  copilotSessionExId: z.string(),
  wsUrl: z.url(),
  query: z.string(),
  schemaGraph: z.any(),
});

export type CopilotMessageContent =
  OnCopilotSessionUpdatesSubscription_onCopilotSessionUpdate_content;

export type CopilotMessageContentMap = {
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

export const inputMessageTypeList: Record<keyof CopilotInputMessage, string> = {
  [CopilotMessageType.Feedback]: "feedbackMessage",
  [CopilotMessageType.HumanInput]: "humanInputMessage",
  [CopilotMessageType.HumanOperation]: "humanOperationMessage",
  [CopilotMessageType.Stop]: "stopMessage",
  [CopilotMessageType.ToolCallBatchResponse]: "toolCallBatchResponseMessage",
  [CopilotMessageType.ToolCallBatchExecError]: "toolCallBatchExecErrorMessage",
  [CopilotMessageType.Terminate]: "terminateMessage",
  [CopilotMessageType.TaskRevertSuccess]: "taskRevertSuccessMessage",
} as const;

export type TypeNameList = {
  [K in (typeof typeNameList)[number]]: K extends CopilotMessageContent["__typename"]
    ? K
    : never;
};
