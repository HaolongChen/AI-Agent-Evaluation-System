import { z } from "zod";
import { CopilotMessageType, type CopilotFeedbackMessageInput, type CopilotHumanInputMessageInput, type CopilotHumanOperationMessageInput, type CopilotStopMessageInput, type CopilotTaskRevertSuccessMessageInput, type CopilotTerminateMessageInput, type CopilotToolCallBatchExecErrorMessageInput, type CopilotToolCallBatchResponseMessageInput, type OnCopilotSessionUpdatesSubscription_onCopilotSessionUpdate_content } from "../../../../graphql/generated/types.ts";
import type { copilotOutputSchema } from "./copilot-output.schema.ts";

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

export type TypeNameList = {
  [K in (typeof typeNameList)[number]]: K extends CopilotMessageContent["__typename"]
    ? K
    : never;
};

export const copilotExecutionSchema = z.object({
  copilotInputId: z.string(),
  copilotServerId: z.string(),
});



export type CopilotExecutionLogs = {
	[K in keyof Omit<
		z.infer<typeof copilotOutputSchema>,
		"copilotSessionExId"
	>]: z.infer<typeof copilotOutputSchema>[K] extends string ?
		z.infer<typeof copilotOutputSchema>[K] | undefined
	:	z.infer<typeof copilotOutputSchema>[K];
};

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
