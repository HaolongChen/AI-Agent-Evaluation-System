import type { JobState, ToolResult } from "./graph-states.ts";

// --- COPY FROM COPILOT TYPES DEFINITION ---

export interface WithMessageId {
  messageId: string;
}

export interface AllowEvaluation extends WithMessageId {
  allowEvaluation: boolean;
  content: string;
}

export enum CopilotMessageType {
  INITIAL_STATE = "initial_state",
  STATE_CHANGE = "state_change",
  SYSTEM_STATUS = "system_status",
  AI_RESPONSE = "ai_response",
  TOOL_CALLS = "tool_calls",
  EDITABLE_TEXT = "editable_text",
  TASK = "task",
  ERROR = "error",

  STOP = "stop",
  TERMINATE = "terminate",
  HUMAN_INPUT = "human_input",
  HUMAN_OPERATION = "human_operation",
  TOOL_RESPONSE = "tool_response",
  FEEDBACK = "feedback",
  EXEC_ERROR = "exec_error",
  TASK_REVERT_SUCCESS = "task_revert_success",
}

export interface InitialStateMessage {
  type: CopilotMessageType.INITIAL_STATE;
  sessionId: string;
  copilotMessages: CopilotMessage[];
  currentJobIsRunning: boolean;
  terminated?: boolean;
}
export interface StateChangeMessage {
  type: CopilotMessageType.STATE_CHANGE;
  currentJobIsRunning: boolean;
}
export interface SystemStatusMessage extends WithMessageId {
  type: CopilotMessageType.SYSTEM_STATUS;
  content: string;
  timestamp: number;
}
export interface AIResponseMessage extends AllowEvaluation {
  type: CopilotMessageType.AI_RESPONSE;
  timestamp: number;
}

export type ToolCallId = string;
export interface ToolCall {
  toolCallId: ToolCallId;
  name: string;
  args: Record<string, unknown>;
}
export interface ToolCallsMessage {
  type: CopilotMessageType.TOOL_CALLS;
  toolCallsId: ToolCallId;
  toolCalls: ToolCall[];
}
export interface EditableTextMessage extends AllowEvaluation {
  type: CopilotMessageType.EDITABLE_TEXT;
  title?: string;
  timestamp: number;
}
export interface TaskMessage {
  type: CopilotMessageType.TASK;
  taskId: string;
  name: string;
  description?: string | null;
  diff?: unknown | null;
  isDiffReverted?: boolean | null;
  timestamp: number;
}
export interface ErrorMessage {
  type: CopilotMessageType.ERROR;
  content: string;
}

export interface StopMessage {
  type: CopilotMessageType.STOP;
}
export interface TerminateMessage {
  type: CopilotMessageType.TERMINATE;
}
export interface HumanInputContext {
  tableNames?: string[];
}
export interface HumanInputMessage {
  type: CopilotMessageType.HUMAN_INPUT;
  content: string;
  context?: HumanInputContext;
}
export interface HumanOperationMessage {
  type: CopilotMessageType.HUMAN_OPERATION;
  operation: "continue" | "edit";
  content?: string;
}
export interface ToolResponseMessage {
  type: CopilotMessageType.TOOL_RESPONSE;
  toolCallsId: ToolCallId;
  result: ToolResult;
}
export interface FeedbackMessage extends WithMessageId {
  type: CopilotMessageType.FEEDBACK;
  operation: "good" | "bad";
  content?: string;
}

export interface ExecErrorContext {
  schemaId?: string;
  lastPatchExId?: string;
  toolCalls?: unknown;
  result?: unknown;
}
export interface ExecErrorMessage {
  type: CopilotMessageType.EXEC_ERROR;
  error?: string;
  context?: ExecErrorContext;
}
export interface TaskRevertSuccessMessage {
  type: CopilotMessageType.TASK_REVERT_SUCCESS;
  taskIds: string[];
}

export type CopilotMessage =
  | InitialStateMessage
  | StateChangeMessage
  | SystemStatusMessage
  | AIResponseMessage
  | ToolCallsMessage
  | EditableTextMessage
  | TaskMessage
  | ErrorMessage
  | StopMessage
  | TerminateMessage
  | HumanInputMessage
  | HumanOperationMessage
  | ToolResponseMessage
  | FeedbackMessage
  | ExecErrorMessage
  | TaskRevertSuccessMessage;

const MESSAGE_TYPES_TO_SAVE = new Set([
  CopilotMessageType.SYSTEM_STATUS,
  CopilotMessageType.AI_RESPONSE,
  CopilotMessageType.EDITABLE_TEXT,
  CopilotMessageType.TASK,
  CopilotMessageType.HUMAN_INPUT,
  CopilotMessageType.HUMAN_OPERATION,
  CopilotMessageType.FEEDBACK,
]);

export const filterCopilotMessagesToSave = (
  copilotMessages: CopilotMessage[],
): CopilotMessage[] =>
  copilotMessages.filter((message) => MESSAGE_TYPES_TO_SAVE.has(message.type));

// ------------------------------------------------------------

export interface SessionState {
  sessionId: string;
  jobState: JobState;
  copilotMessages: CopilotMessage[];
  terminated: boolean;
}

export enum FeatureType {
  MALL_BOOK = "MALL_BOOK",
  LOG_ACTION = "LOG_ACTION",
  DEV_ENVIRONMENT = "DEV_ENVIRONMENT",
  HACK_SELECT_CUSTOM_TYPE_IN_LIST_MUTATION = "HACK_SELECT_CUSTOM_TYPE_IN_LIST_MUTATION",
  ZTYPE_DATA_BINDING_SELECTOR_REQUEST_FILTER_COLUMN_VALUE_SUPPORTS_CURRENT_ROW_DATA = "ZTYPE_DATA_BINDING_SELECTOR_REQUEST_FILTER_COLUMN_VALUE_SUPPORTS_CURRENT_ROW_DATA",
  MOMEN_SUBSCRIBE_COMPUTING_POWER_KIT = "MOMEN_SUBSCRIBE_COMPUTING_POWER_KIT",
  RUN_ACTION_FLOW_BY_ZVM = "RUN_ACTION_FLOW_BY_ZVM",
  COPILOT_DEMO = "COPILOT_DEMO",
  SQL_KEYWORDS_ITEM_AND_CHILDREN = "SQL_KEYWORDS_ITEM_AND_CHILDREN",
  MOBILE = "MOBILE",
  TEST_FLOW = "TEST_FLOW",
  NEW_ZUI_SHARE_MODAL = "NEW_ZUI_SHARE_MODAL",
  AWESOME_AF = "AWESOME_AF",
  NEW_LOADING_ANIMATION_2512 = "NEW_LOADING_ANIMATION_2512",
  USER_QUESTION_2601 = "USER_QUESTION_2601",
  SECRET_CONFIG_2602 = "SECRET_CONFIG_2602",
  OTP = "OTP",
  ENUM_VALUE_CONFIG = "ENUM_VALUE_CONFIG",
  AI_DATA_BINDING_TOOL_ACTION_FLOW = "AI_DATA_BINDING_TOOL_ACTION_FLOW",
}
