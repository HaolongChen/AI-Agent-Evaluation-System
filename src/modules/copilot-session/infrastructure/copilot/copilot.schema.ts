import {
  CopilotMessageType,
  type OnCopilotSessionUpdatesSubscription_onCopilotSessionUpdate_content,
} from "../../../../graphql/generated/types.ts";

type CopilotMessageContent =
  OnCopilotSessionUpdatesSubscription_onCopilotSessionUpdate_content;

export type CopilotMessageContentMap<E extends string | undefined = undefined> =
  {
    readonly [T in CopilotMessageContent as T["__typename"]]: {
      [K in Exclude<keyof T, E>]: T[K];
    };
  };

export const typeNameList = [
  "CopilotAiResponseMessage",
  "CopilotEditableTextMessage",
  "CopilotErrorMessage",
  "CopilotInitialStateMessage",
  "CopilotStateChangeMessage",
  "CopilotSystemStatusMessage",
  "CopilotTaskMessage",
  "CopilotToolCallBatchMessage",
] as const;
export const inputMessageTypeNameList = [
  "CopilotTaskRevertSuccessMessage",
  "CopilotTerminateMessage",
  "CopilotFeedbackMessage",
  "CopilotHumanInputMessage",
  "CopilotHumanOperationMessage",
  "CopilotStopMessage",
  "CopilotToolCallBatchResponseMessage",
  "CopilotToolCallBatchExecErrorMessage",
] as const;

type TypeNameList<T extends readonly string[]> = {
  [K in T[number]]: K extends CopilotMessageContent["__typename"] ? K : never;
};
export type CopilotResponseMessage = Pick<
  CopilotMessageContentMap,
  (typeof typeNameList)[number]
>;

export const inputMessageList: Record<
  keyof TypeNameList<typeof inputMessageTypeNameList>,
  {
    property: string;
    type: CopilotMessageType;
  }
> = {
  CopilotFeedbackMessage: {
    property: "feedbackMessage",
    type: CopilotMessageType.Feedback,
  },
  CopilotHumanInputMessage: {
    property: "humanInputMessage",
    type: CopilotMessageType.HumanInput,
  },
  CopilotHumanOperationMessage: {
    property: "humanOperationMessage",
    type: CopilotMessageType.HumanOperation,
  },
  CopilotStopMessage: {
    property: "stopMessage",
    type: CopilotMessageType.Stop,
  },
  CopilotToolCallBatchResponseMessage: {
    property: "toolCallBatchResponseMessage",
    type: CopilotMessageType.ToolCallBatchResponse,
  },
  CopilotToolCallBatchExecErrorMessage: {
    property: "toolCallBatchExecErrorMessage",
    type: CopilotMessageType.ToolCallBatchExecError,
  },
  CopilotTerminateMessage: {
    property: "terminateMessage",
    type: CopilotMessageType.Terminate,
  },
  CopilotTaskRevertSuccessMessage: {
    property: "taskRevertSuccessMessage",
    type: CopilotMessageType.TaskRevertSuccess,
  },
} as const;

export type CopilotInputMessage = Pick<
  CopilotMessageContentMap<"__typename" | "messageType">,
  (typeof inputMessageTypeNameList)[number]
>;
