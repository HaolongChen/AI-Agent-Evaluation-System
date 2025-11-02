import type { JobState, ToolResult } from "./graph-states.ts";

export type copilotType =
    | 'dataModel'
    | 'uiBuilder'
    | 'actionflow'
    | 'logAnalyzer'
    | 'agentBuilder';

export type expectedAnswerType = 
    | 'yes'
    | 'no';

export type rubricContentType = {
    content: string[],
    rubricType: string[],
    category: string[],
    expectedAnswer: expectedAnswerType[]
}

// --- COPY FROM COPILOT TYPES DEFINITION ---


export interface WithMessageId {
  messageId: string;
}

export interface AllowEvaluation extends WithMessageId {
  allowEvaluation: boolean;
  content: string;
}

export enum CopilotMessageType {
  INITIAL_STATE = 'initial_state',
  STATE_CHANGE = 'state_change',
  SYSTEM_STATUS = 'system_status',
  AI_RESPONSE = 'ai_response',
  TOOL_CALLS = 'tool_calls',
  EDITABLE_TEXT = 'editable_text',
  TASK = 'task',
  ERROR = 'error',

  STOP = 'stop',
  TERMINATE = 'terminate',
  HUMAN_INPUT = 'human_input',
  HUMAN_OPERATION = 'human_operation',
  TOOL_RESPONSE = 'tool_response',
  FEEDBACK = 'feedback',
  EXEC_ERROR = 'exec_error',
  TASK_REVERT_SUCCESS = 'task_revert_success',
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
  description?: string;
  diff?: unknown;
  isDiffReverted?: boolean;
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
  operation: 'continue' | 'edit';
  content?: string;
}
export interface ToolResponseMessage {
  type: CopilotMessageType.TOOL_RESPONSE;
  toolCallsId: ToolCallId;
  result: ToolResult;
}
export interface FeedbackMessage extends WithMessageId {
  type: CopilotMessageType.FEEDBACK;
  operation: 'good' | 'bad';
  content?: string;
}

export interface ExecErrorContext {
  schemaExId?: string;
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

const MESSAGE_TYPES_TO_SAVE = [
  CopilotMessageType.SYSTEM_STATUS,
  CopilotMessageType.AI_RESPONSE,
  CopilotMessageType.EDITABLE_TEXT,
  CopilotMessageType.TASK,
  CopilotMessageType.HUMAN_INPUT,
  CopilotMessageType.HUMAN_OPERATION,
  CopilotMessageType.FEEDBACK,
];

export const filterCopilotMessagesToSave = (
  copilotMessages: CopilotMessage[]
): CopilotMessage[] =>
  copilotMessages.filter(message =>
    MESSAGE_TYPES_TO_SAVE.includes(message.type)
  );

// ------------------------------------------------------------

export interface SessionState {
  sessionId: string;
  jobState: JobState;
  copilotMessages: CopilotMessage[];
  terminated: boolean;
}
