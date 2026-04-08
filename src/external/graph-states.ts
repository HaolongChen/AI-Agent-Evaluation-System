import { BaseMessage } from '@langchain/core/messages';

export interface SessionData {
  projectExId: string;
  sessionId: string;
  userExId: string;
}

export interface UserContext {
  conversationSummaryHistory?: string[];
  currentConversationSummary?: string;
  tableNames?: string[];
}

export enum JobStateType {
  AWAITING_INITIAL_REQUIREMENT = 'AWAITING_INITIAL_REQUIREMENT',
  AWAITING_INTERPRETER_ANSWER = 'AWAITING_INTERPRETER_ANSWER',
  AWAITING_PLAN_CONFIRMATION = 'AWAITING_PLAN_CONFIRMATION',
  AWAITING_TASK_EXECUTION = 'AWAITING_TASK_EXECUTION',
}

export interface JobNextStepData {
  nextNode: string;
}
export interface ToolResult {
  data: string;
  schemaDiff?: Record<string, unknown>;
}
export interface RuntimeToolCallInfo {
  nodeName: string;
  messages: BaseMessage[];
  toolResult?: ToolResult;
}

export interface RuntimeContext {
  jobState?: JobStateType;
  nextStep?: JobNextStepData;
  toolCallInfo?: RuntimeToolCallInfo;
}

export interface VersionedText {
  revisions?: string[];
}

export enum TaskStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface Task {
  id: string;
  name: string;
  description: string;
  status: TaskStatus;
  input?: unknown;
  output?: unknown;
  diff?: unknown;
  isDiffApplied?: boolean;
  isDiffReverted?: boolean;
  worker?: string;
}

export interface JobState {
  sessionData: SessionData;
  messages: BaseMessage[];
  userContext?: UserContext;
  runtimeContext?: RuntimeContext;
  plan?: VersionedText;
  tasks?: Task[];
  dynamicOutput?: Record<string, unknown>;
}


// ------------------------------------------------------------

const jobStateDescriptionMap: Record<JobStateType, string> = {
  [JobStateType.AWAITING_INITIAL_REQUIREMENT]:
    'The default initial state of the system. It will also return to this state after all tasks are completed. At this time, the system is waiting for the user to propose requirements to determine the next action.',
  [JobStateType.AWAITING_INTERPRETER_ANSWER]:
    "The system is calling tools or large models to answer the user's questions.",
  [JobStateType.AWAITING_PLAN_CONFIRMATION]:
    'The system is calling tools or large models to generate a development plan, or a development plan has been generated and is waiting for the user to confirm or propose modifications.',
  [JobStateType.AWAITING_TASK_EXECUTION]:
    'The user has confirmed the development plan, and the system is calling tools or large models to execute the development plan.',
};

export const JOB_STATE_DESCRIPTION = Object.entries(jobStateDescriptionMap)
  .map(([key, value]) => `* ${key}: ${value}`)
  .join('\n');

export const DYNAMIC_OUTPUT_KEY_COMPLETION_MESSAGES_TO_CLIENT =
  'completionMessagesToClient';
