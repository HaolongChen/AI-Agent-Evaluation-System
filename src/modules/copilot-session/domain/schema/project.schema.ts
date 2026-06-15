import { z } from "zod";
import {
  CopilotMessageType,
  Platform,
  ProjectContentCategory,
  ProjectSpaceType,
  type CopilotFeedbackMessageInput,
  type CopilotHumanInputMessageInput,
  type CopilotHumanOperationMessageInput,
  type CopilotStopMessageInput,
  type CopilotTaskRevertSuccessMessageInput,
  type CopilotTerminateMessageInput,
  type CopilotToolCallBatchExecErrorMessageInput,
  type CopilotToolCallBatchResponseMessageInput,
} from "../../../../graphql/generated/types.ts";
import type { EntityMetadata } from "../../../shared/domain/entity/entity.ts";
import type { copilotOutputSchema } from "./copilot-output.schema.ts";
export const projectCreationRequiredSchema = z.object({
  projectName: z.string(),
  useNewType: z.boolean().default(true),
  useRefactoredComponent: z.boolean().default(true),
  projectSpaceType: z.enum(ProjectSpaceType).default("PERSONAL"),
  category: z.enum(ProjectContentCategory).default("OTHERS"),
  platform: z.enum(Platform).default("WEB"),
});

export const projectSchema = z.object({
  projectName: z.string(),
});

export type ProjectEntityMetadata = EntityMetadata & {
  copilotSessionExId?: string;
};

export type CopilotExecutionLogs = {
  [K in keyof Omit<
    z.infer<typeof copilotOutputSchema>,
    "copilotSessionExId"
  >]: z.infer<typeof copilotOutputSchema>[K] extends string
    ? z.infer<typeof copilotOutputSchema>[K] | undefined
    : z.infer<typeof copilotOutputSchema>[K];
};

export type ProjectAggregateMetadata = EntityMetadata & {
  copilotInputId: string;
  copilotServerId: string;
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
