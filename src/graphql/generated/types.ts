/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never;
    };
export const AfCodeTemplateStatus = {
  Created: "CREATED",
  Published: "PUBLISHED",
} as const;

export type AfCodeTemplateStatus =
  (typeof AfCodeTemplateStatus)[keyof typeof AfCodeTemplateStatus];
export type AfCodeToolArgsInput = {
  actionFlowId: string;
  codeBlockInput: unknown;
  codeBlockNodeId: string;
  codeBlockOutput: unknown;
  humanInputMessage?: CopilotHumanInputMessageInput | undefined;
  toolCallBatchExecErrorMessage?:
    | CopilotToolCallBatchExecErrorMessageInput
    | undefined;
  toolCallBatchResponseMessage?:
    | CopilotToolCallBatchResponseMessageInput
    | undefined;
};

export const ColumnType = {
  Bigint: "BIGINT",
  Bigserial: "BIGSERIAL",
  Boolean: "BOOLEAN",
  Date: "DATE",
  Decimal: "DECIMAL",
  File: "FILE",
  Float8: "FLOAT8",
  GeoPoint: "GEO_POINT",
  Image: "IMAGE",
  ImageList: "IMAGE_LIST",
  Integer: "INTEGER",
  Interval: "INTERVAL",
  Jsonb: "JSONB",
  LocationInfo: "LOCATION_INFO",
  Text: "TEXT",
  Timestamptz: "TIMESTAMPTZ",
  Timetz: "TIMETZ",
  Unknown: "UNKNOWN",
  Video: "VIDEO",
} as const;

export type ColumnType = (typeof ColumnType)[keyof typeof ColumnType];
export type CopilotArgsInput = {
  copilotMessageType: CopilotMessageType;
  feedbackMessage?: CopilotFeedbackMessageInput | undefined;
  humanInputMessage?: CopilotHumanInputMessageInput | undefined;
  humanOperationMessage?: CopilotHumanOperationMessageInput | undefined;
  stopMessage?: CopilotStopMessageInput | undefined;
  taskRevertSuccessMessage?: CopilotTaskRevertSuccessMessageInput | undefined;
  terminateMessage?: CopilotTerminateMessageInput | undefined;
  toolCallBatchExecErrorMessage?:
    | CopilotToolCallBatchExecErrorMessageInput
    | undefined;
  toolCallBatchResponseMessage?:
    | CopilotToolCallBatchResponseMessageInput
    | undefined;
};

export type CopilotFeedbackMessageInput = {
  evaluatedMessageExId: string;
  feedbackCategory: FeedbackCategory;
  optionalContent?: string | undefined;
};

export type CopilotHumanInputContextInput = {
  tableNames?: Array<string> | undefined;
  useLegacyTypeDefinition?: boolean | undefined;
};

export type CopilotHumanInputMessageInput = {
  content: string;
  context?: CopilotHumanInputContextInput | undefined;
};

export type CopilotHumanOperationMessageInput = {
  humanOperationType: HumanOperationType;
  optionalContent?: string | undefined;
};

export const CopilotMessageType = {
  AiResponse: "AI_RESPONSE",
  EditableText: "EDITABLE_TEXT",
  Error: "ERROR",
  Feedback: "FEEDBACK",
  HumanInput: "HUMAN_INPUT",
  HumanOperation: "HUMAN_OPERATION",
  InitialState: "INITIAL_STATE",
  StateChange: "STATE_CHANGE",
  Stop: "STOP",
  SystemStatus: "SYSTEM_STATUS",
  Task: "TASK",
  TaskRevertSuccess: "TASK_REVERT_SUCCESS",
  Terminate: "TERMINATE",
  ToolCallBatch: "TOOL_CALL_BATCH",
  ToolCallBatchExecError: "TOOL_CALL_BATCH_EXEC_ERROR",
  ToolCallBatchResponse: "TOOL_CALL_BATCH_RESPONSE",
} as const;

export type CopilotMessageType =
  (typeof CopilotMessageType)[keyof typeof CopilotMessageType];
export const CopilotSessionType = {
  AfcodeTool: "AFCODE_TOOL",
  Copilot: "COPILOT",
  LogTool: "LOG_TOOL",
  PromptOptimizer: "PROMPT_OPTIMIZER",
  SetDataBinding: "SET_DATA_BINDING",
} as const;

export type CopilotSessionType =
  (typeof CopilotSessionType)[keyof typeof CopilotSessionType];
export type CopilotStopMessageInput = {
  reason?: string | undefined;
};

export type CopilotTaskRevertSuccessMessageInput = {
  taskIds: Array<string | undefined>;
};

export type CopilotTerminateMessageInput = {
  reason?: string | undefined;
};

export type CopilotToolCallBatchExecErrorContextInput = {
  lastPatchExId?: string | undefined;
  result?: unknown;
  schemaExId: string;
  toolCalls: unknown;
};

export type CopilotToolCallBatchExecErrorMessageInput = {
  context?: CopilotToolCallBatchExecErrorContextInput | undefined;
  error?: string | undefined;
  toolCallBatchId: string;
};

export type CopilotToolCallBatchResponseMessageInput = {
  responseByToolCallId: unknown;
  schemaDiff?: unknown;
  toolCallBatchId: string;
};

export const FeedbackCategory = {
  Bad: "BAD",
  Good: "GOOD",
} as const;

export type FeedbackCategory =
  (typeof FeedbackCategory)[keyof typeof FeedbackCategory];
export const HumanOperationType = {
  Continue: "CONTINUE",
  Edit: "EDIT",
} as const;

export type HumanOperationType =
  (typeof HumanOperationType)[keyof typeof HumanOperationType];
export type LogToolArgsInput = {
  humanInputMessage?: CopilotHumanInputMessageInput | undefined;
  requestCreatedAt: string;
  toolCallBatchExecErrorMessage?:
    | CopilotToolCallBatchExecErrorMessageInput
    | undefined;
  toolCallBatchResponseMessage?:
    | CopilotToolCallBatchResponseMessageInput
    | undefined;
  traceId: string;
};

export type MessageArgsInputInput = {
  afCodeToolArgs?: AfCodeToolArgsInput | undefined;
  copilotArgs?: CopilotArgsInput | undefined;
  logToolArgs?: LogToolArgsInput | undefined;
  promptOptimizerToolArgs?: PromptOptimizerToolArgsInput | undefined;
  setDataBindingToolArgs?: SetDataBindingToolArgsInput | undefined;
};

export const Platform = {
  Mobile: "MOBILE",
  Web: "WEB",
  Wechat: "WECHAT",
} as const;

export type Platform = (typeof Platform)[keyof typeof Platform];
export const ProjectContentCategory = {
  Ai: "AI",
  Cms: "CMS",
  ECommerce: "E_COMMERCE",
  Fintech: "FINTECH",
  HealthCare: "HEALTH_CARE",
  LogisticsAndDelivery: "LOGISTICS_AND_DELIVERY",
  OnlineEducation: "ONLINE_EDUCATION",
  Others: "OTHERS",
  RestaurantBooking: "RESTAURANT_BOOKING",
  SocialMedia: "SOCIAL_MEDIA",
  TravelBooking: "TRAVEL_BOOKING",
  WebsiteHomepage: "WEBSITE_HOMEPAGE",
} as const;

export type ProjectContentCategory =
  (typeof ProjectContentCategory)[keyof typeof ProjectContentCategory];
export const ProjectCreationStatus = {
  Completed: "COMPLETED",
  Failed: "FAILED",
  Processing: "PROCESSING",
} as const;

export type ProjectCreationStatus =
  (typeof ProjectCreationStatus)[keyof typeof ProjectCreationStatus];
export const ProjectSpaceType = {
  JoinedOrganization: "JOINED_ORGANIZATION",
  Personal: "PERSONAL",
  Share: "SHARE",
  Team: "TEAM",
} as const;

export type ProjectSpaceType =
  (typeof ProjectSpaceType)[keyof typeof ProjectSpaceType];
export type PromptOptimizerToolArgsInput = {
  humanInputMessage?: CopilotHumanInputMessageInput | undefined;
  initUserPromptSchemaPath: Array<SchemaPathItemInput | undefined>;
  initUserPromptValueBindings: Array<unknown>;
  systemPromptSchemaPath: Array<SchemaPathItemInput | undefined>;
  systemPromptValueBindings: Array<unknown>;
  toolCallBatchExecErrorMessage?:
    | CopilotToolCallBatchExecErrorMessageInput
    | undefined;
  toolCallBatchResponseMessage?:
    | CopilotToolCallBatchResponseMessageInput
    | undefined;
};

export type SchemaPathItemInput = {
  index?: number | undefined;
  key?: string | undefined;
};

export type SetDataBindingToolArgsInput = {
  humanInputMessage?: CopilotHumanInputMessageInput | undefined;
  schemaPath: Array<SchemaPathItemInput | undefined>;
  toolCallBatchExecErrorMessage?:
    | CopilotToolCallBatchExecErrorMessageInput
    | undefined;
  toolCallBatchResponseMessage?:
    | CopilotToolCallBatchResponseMessageInput
    | undefined;
};

export type LoginWithPhoneNumberMutation_loginWithPhoneNumber_account = {
  __typename: "Account";
  exId: string;
};

export type LoginWithPhoneNumberMutation_loginWithPhoneNumber = {
  __typename: "AccountInfo";
  accessToken: string | null;
  account: LoginWithPhoneNumberMutation_loginWithPhoneNumber_account | null;
};

export type LoginWithPhoneNumberMutation = {
  __typename: "Mutation";
  loginWithPhoneNumber: LoginWithPhoneNumberMutation_loginWithPhoneNumber | null;
};

export type LoginWithPhoneNumberMutationVariables = Exact<{
  phoneNumber: string;
  password: string;
}>;

export type CheckProjectNameDuplicateQuery = {
  __typename: "Query";
  checkProjectNameDuplicate: boolean;
};

export type CheckProjectNameDuplicateQueryVariables = Exact<{
  projectName: string;
}>;

export type CreateProjectInOrganizationAsyncMutation = {
  __typename: "Mutation";
  createProjectInOrganizationAsync: string | null;
};

export type CreateProjectInOrganizationAsyncMutationVariables = Exact<{
  projectName: string;
  templateExId?: string | undefined;
  platform?: Platform | undefined;
  projectSpaceType: ProjectSpaceType;
  organizationExId: string;
  forBeginnerGuide?: boolean | undefined;
  category?: ProjectContentCategory | undefined;
  useRefactoredComponent?: boolean | undefined;
  useNewType?: boolean | undefined;
}>;

export type OnProjectCreationStatusChangedSubscription_onProjectCreationStatusChanged =
  {
    __typename: "ProjectCreationResult";
    projectExId: string | null;
    status: ProjectCreationStatus | null;
  };

export type OnProjectCreationStatusChangedSubscription = {
  __typename: "Subscription";
  onProjectCreationStatusChanged: OnProjectCreationStatusChangedSubscription_onProjectCreationStatusChanged | null;
};

export type OnProjectCreationStatusChangedSubscriptionVariables = Exact<{
  uniqueId: string;
}>;

export type DeleteProjectMutation = {
  __typename: "Mutation";
  deleteProject: boolean;
};

export type DeleteProjectMutationVariables = Exact<{
  projectExId: string;
}>;

export type DeleteProjectByIdsMutation = {
  __typename: "Mutation";
  deleteProjectByIds: boolean;
};

export type DeleteProjectByIdsMutationVariables = Exact<{
  ids: Array<unknown> | unknown;
}>;

export type FixAliPayDataBindingMutation = {
  __typename: "Mutation";
  fixAliPayDataBinding: boolean;
};

export type FixAliPayDataBindingMutationVariables = Exact<{
  projectId: unknown;
}>;

export type ImportProjectSchemaJsonManualMutation = {
  __typename: "Mutation";
  importProjectSchemaJsonManual: string | null;
};

export type ImportProjectSchemaJsonManualMutationVariables = Exact<{
  schema: unknown;
  projectExId: string;
  appExId?: string | undefined;
  versionExId?: string | undefined;
}>;

export type FetchAppDetailByExIdQuery_fetchAppDetailByExId_latestSchema_crdtPatches_patches =
  { __typename: "SchemaCrdtPatch"; patchBase64: string };

export type FetchAppDetailByExIdQuery_fetchAppDetailByExId_latestSchema_crdtPatches =
  {
    __typename: "SchemaCrdtPatches";
    lastPatchExId: string | null;
    patches: Array<FetchAppDetailByExIdQuery_fetchAppDetailByExId_latestSchema_crdtPatches_patches | null> | null;
  };

export type FetchAppDetailByExIdQuery_fetchAppDetailByExId_latestSchema = {
  __typename: "CrdtSchema";
  crdtModelUrl: string | null;
  crdtPatches: FetchAppDetailByExIdQuery_fetchAppDetailByExId_latestSchema_crdtPatches | null;
};

export type FetchAppDetailByExIdQuery_fetchAppDetailByExId_Project_latestSchema_crdtPatches_patches =
  { __typename: "SchemaCrdtPatch"; patchBase64: string };

export type FetchAppDetailByExIdQuery_fetchAppDetailByExId_Project_latestSchema_crdtPatches =
  {
    __typename: "SchemaCrdtPatches";
    lastPatchExId: string | null;
    patches: Array<FetchAppDetailByExIdQuery_fetchAppDetailByExId_Project_latestSchema_crdtPatches_patches | null> | null;
  };

export type FetchAppDetailByExIdQuery_fetchAppDetailByExId_Project_latestSchema =
  {
    __typename: "CrdtSchema";
    crdtModelUrl: string | null;
    crdtPatches: FetchAppDetailByExIdQuery_fetchAppDetailByExId_Project_latestSchema_crdtPatches | null;
  };

export type FetchAppDetailByExIdQuery_fetchAppDetailByExId_WebApp_latestSchema_crdtPatches_patches =
  { __typename: "SchemaCrdtPatch"; patchBase64: string };

export type FetchAppDetailByExIdQuery_fetchAppDetailByExId_WebApp_latestSchema_crdtPatches =
  {
    __typename: "SchemaCrdtPatches";
    lastPatchExId: string | null;
    patches: Array<FetchAppDetailByExIdQuery_fetchAppDetailByExId_WebApp_latestSchema_crdtPatches_patches | null> | null;
  };

export type FetchAppDetailByExIdQuery_fetchAppDetailByExId_WebApp_latestSchema =
  {
    __typename: "CrdtSchema";
    crdtModelUrl: string | null;
    crdtPatches: FetchAppDetailByExIdQuery_fetchAppDetailByExId_WebApp_latestSchema_crdtPatches | null;
  };

export type FetchAppDetailByExIdQuery_fetchAppDetailByExId_WechatMiniProgramApp_latestSchema_crdtPatches_patches =
  { __typename: "SchemaCrdtPatch"; patchBase64: string };

export type FetchAppDetailByExIdQuery_fetchAppDetailByExId_WechatMiniProgramApp_latestSchema_crdtPatches =
  {
    __typename: "SchemaCrdtPatches";
    lastPatchExId: string | null;
    patches: Array<FetchAppDetailByExIdQuery_fetchAppDetailByExId_WechatMiniProgramApp_latestSchema_crdtPatches_patches | null> | null;
  };

export type FetchAppDetailByExIdQuery_fetchAppDetailByExId_WechatMiniProgramApp_latestSchema =
  {
    __typename: "CrdtSchema";
    crdtModelUrl: string | null;
    crdtPatches: FetchAppDetailByExIdQuery_fetchAppDetailByExId_WechatMiniProgramApp_latestSchema_crdtPatches | null;
  };

export type FetchAppDetailByExIdQuery_fetchAppDetailByExId_MobileApp = {
  __typename: "MobileApp";
  latestSchema: FetchAppDetailByExIdQuery_fetchAppDetailByExId_latestSchema | null;
};

export type FetchAppDetailByExIdQuery_fetchAppDetailByExId_Project = {
  __typename: "Project";
  latestSchema: FetchAppDetailByExIdQuery_fetchAppDetailByExId_Project_latestSchema | null;
};

export type FetchAppDetailByExIdQuery_fetchAppDetailByExId_WebApp = {
  __typename: "WebApp";
  latestSchema: FetchAppDetailByExIdQuery_fetchAppDetailByExId_WebApp_latestSchema | null;
};

export type FetchAppDetailByExIdQuery_fetchAppDetailByExId_WechatMiniProgramApp =
  {
    __typename: "WechatMiniProgramApp";
    latestSchema: FetchAppDetailByExIdQuery_fetchAppDetailByExId_WechatMiniProgramApp_latestSchema | null;
  };

export type FetchAppDetailByExIdQuery_fetchAppDetailByExId =
  | FetchAppDetailByExIdQuery_fetchAppDetailByExId_MobileApp
  | FetchAppDetailByExIdQuery_fetchAppDetailByExId_Project
  | FetchAppDetailByExIdQuery_fetchAppDetailByExId_WebApp
  | FetchAppDetailByExIdQuery_fetchAppDetailByExId_WechatMiniProgramApp;

export type FetchAppDetailByExIdQuery = {
  __typename: "Query";
  fetchAppDetailByExId: FetchAppDetailByExIdQuery_fetchAppDetailByExId | null;
};

export type FetchAppDetailByExIdQueryVariables = Exact<{
  projectExId: string;
  appExId?: string | undefined;
  appVersionExId?: string | undefined;
}>;

export type AfCustomCodeTemplatesQuery_visibleAfCustomCodeTemplates_inputType =
  {
    __typename: "NodeTemplateVariable";
    name: string | null;
    type: ColumnType | null;
    defaultValue: unknown;
    required: boolean;
    description: string | null;
  };

export type AfCustomCodeTemplatesQuery_visibleAfCustomCodeTemplates_outputType =
  {
    __typename: "NodeTemplateVariable";
    name: string | null;
    type: ColumnType | null;
    defaultValue: unknown;
    required: boolean;
    description: string | null;
  };

export type AfCustomCodeTemplatesQuery_visibleAfCustomCodeTemplates = {
  __typename: "AfCodeTemplate";
  async: boolean;
  exId: string;
  author: unknown;
  displayName: string;
  logoUrl: string;
  status: AfCodeTemplateStatus | null;
  templateGroup: string;
  updatedAt: unknown;
  version: string | null;
  inputType: Array<AfCustomCodeTemplatesQuery_visibleAfCustomCodeTemplates_inputType | null>;
  outputType: Array<AfCustomCodeTemplatesQuery_visibleAfCustomCodeTemplates_outputType | null>;
};

export type AfCustomCodeTemplatesQuery = {
  __typename: "Query";
  visibleAfCustomCodeTemplates: Array<AfCustomCodeTemplatesQuery_visibleAfCustomCodeTemplates | null> | null;
};

export type AfCustomCodeTemplatesQueryVariables = Exact<{
  [key: string]: never;
}>;

export type SupportedCustomModelDescriptorQuery_supportedCustomModelDescriptor =
  {
    __typename: "SupportedCustomModelDescriptor";
    chatModelDescriptors: Array<unknown> | null;
    embeddingModelDescriptors: Array<unknown> | null;
  };

export type SupportedCustomModelDescriptorQuery = {
  __typename: "Query";
  supportedCustomModelDescriptor: SupportedCustomModelDescriptorQuery_supportedCustomModelDescriptor | null;
};

export type SupportedCustomModelDescriptorQueryVariables = Exact<{
  [key: string]: never;
}>;

export type ImportProjectSchemaManualMutation = {
  __typename: "Mutation";
  importProjectSchemaManual: string | null;
};

export type ImportProjectSchemaManualMutationVariables = Exact<{
  projectExId: string;
  crdtModel: unknown;
  appExId?: string | undefined;
  versionExId?: string | undefined;
}>;

export type GetCopilotSubscriptionCountQuery = {
  __typename: "Query";
  copilotSubscriptionCount: unknown;
};

export type GetCopilotSubscriptionCountQueryVariables = Exact<{
  projectExId: string;
  sessionType: CopilotSessionType;
}>;

export type CreateCopilotSessionMutation = {
  __typename: "Mutation";
  createCopilotSession: string;
};

export type CreateCopilotSessionMutationVariables = Exact<{
  projectExId: string;
  sessionType: CopilotSessionType;
}>;

export type GetLatestSessionMutation = {
  __typename: "Mutation";
  latestSession: string | null;
};

export type GetLatestSessionMutationVariables = Exact<{
  projectExId: string;
  sessionType: CopilotSessionType;
}>;

export type SendMessageToSessionMutation = {
  __typename: "Mutation";
  sendMessageToSession: boolean;
};

export type SendMessageToSessionMutationVariables = Exact<{
  sessionExId: string;
  argsInput: MessageArgsInputInput;
}>;

export type CopilotAiResponseMessageFragment = {
  __typename: "CopilotAiResponseMessage";
  content: string;
  allowEvaluation: boolean;
  messageType: CopilotMessageType;
};

export type CopilotAiResponseMessageFragmentVariables = Exact<{
  [key: string]: never;
}>;

export type CopilotErrorMessageFragment = {
  __typename: "CopilotErrorMessage";
  content: string;
  messageType: CopilotMessageType;
};

export type CopilotErrorMessageFragmentVariables = Exact<{
  [key: string]: never;
}>;

export type CopilotEditableTextMessageFragment = {
  __typename: "CopilotEditableTextMessage";
  content: string;
  allowEvaluation: boolean;
  title: string | null;
  messageType: CopilotMessageType;
};

export type CopilotEditableTextMessageFragmentVariables = Exact<{
  [key: string]: never;
}>;

export type CopilotFeedbackMessageFragment = {
  __typename: "CopilotFeedbackMessage";
  feedbackCategory: FeedbackCategory;
  evaluatedMessageExId: string;
  optionalContent: string | null;
  messageType: CopilotMessageType;
};

export type CopilotFeedbackMessageFragmentVariables = Exact<{
  [key: string]: never;
}>;

export type CopilotHumanInputMessageFragment_context = {
  __typename: "CopilotHumanInputContext";
  tableNames: Array<string> | null;
};

export type CopilotHumanInputMessageFragment = {
  __typename: "CopilotHumanInputMessage";
  content: string;
  messageType: CopilotMessageType;
  context: CopilotHumanInputMessageFragment_context | null;
};

export type CopilotHumanInputMessageFragmentVariables = Exact<{
  [key: string]: never;
}>;

export type CopilotHumanOperationMessageFragment = {
  __typename: "CopilotHumanOperationMessage";
  optionalContent: string | null;
  humanOperationType: HumanOperationType;
  messageType: CopilotMessageType;
};

export type CopilotHumanOperationMessageFragmentVariables = Exact<{
  [key: string]: never;
}>;

export type CopilotStateChangeMessageFragment = {
  __typename: "CopilotStateChangeMessage";
  currentJobIsRunning: boolean;
  messageType: CopilotMessageType;
};

export type CopilotStateChangeMessageFragmentVariables = Exact<{
  [key: string]: never;
}>;

export type CopilotStopMessageFragment = {
  __typename: "CopilotStopMessage";
  reason: string | null;
  messageType: CopilotMessageType;
};

export type CopilotStopMessageFragmentVariables = Exact<{
  [key: string]: never;
}>;

export type CopilotSystemStatusMessageFragment = {
  __typename: "CopilotSystemStatusMessage";
  content: string;
  messageType: CopilotMessageType;
};

export type CopilotSystemStatusMessageFragmentVariables = Exact<{
  [key: string]: never;
}>;

export type CopilotTaskMessageFragment = {
  __typename: "CopilotTaskMessage";
  taskId: string;
  name: string;
  description: string | null;
  diff: unknown;
  isDiffReverted: boolean | null;
  messageType: CopilotMessageType;
};

export type CopilotTaskMessageFragmentVariables = Exact<{
  [key: string]: never;
}>;

export type CopilotTaskRevertSuccessMessageFragment = {
  __typename: "CopilotTaskRevertSuccessMessage";
  taskIds: Array<string | null>;
  messageType: CopilotMessageType;
};

export type CopilotTaskRevertSuccessMessageFragmentVariables = Exact<{
  [key: string]: never;
}>;

export type CopilotTerminateMessageFragment = {
  __typename: "CopilotTerminateMessage";
  reason: string | null;
  messageType: CopilotMessageType;
};

export type CopilotTerminateMessageFragmentVariables = Exact<{
  [key: string]: never;
}>;

export type CopilotToolCallBatchExecErrorMessageFragment_context = {
  __typename: "CopilotToolCallBatchExecErrorContext";
  toolCalls: unknown;
  result: unknown;
  schemaExId: string;
  lastPatchExId: string | null;
};

export type CopilotToolCallBatchExecErrorMessageFragment = {
  __typename: "CopilotToolCallBatchExecErrorMessage";
  toolCallBatchId: string;
  messageType: CopilotMessageType;
  error: string | null;
  context: CopilotToolCallBatchExecErrorMessageFragment_context | null;
};

export type CopilotToolCallBatchExecErrorMessageFragmentVariables = Exact<{
  [key: string]: never;
}>;

export type CopilotToolCallBatchMessageFragment_toolCalls = {
  __typename: "CopilotToolCall";
  id: string;
  name: string;
  args: unknown;
};

export type CopilotToolCallBatchMessageFragment = {
  __typename: "CopilotToolCallBatchMessage";
  toolCallBatchId: string;
  messageType: CopilotMessageType;
  toolCalls: Array<CopilotToolCallBatchMessageFragment_toolCalls>;
};

export type CopilotToolCallBatchMessageFragmentVariables = Exact<{
  [key: string]: never;
}>;

export type CopilotToolCallBatchResponseMessageFragment = {
  __typename: "CopilotToolCallBatchResponseMessage";
  toolCallBatchId: string;
  responseByToolCallId: unknown;
  messageType: CopilotMessageType;
  schemaDiff: unknown;
};

export type CopilotToolCallBatchResponseMessageFragmentVariables = Exact<{
  [key: string]: never;
}>;

export type CopilotMessageContent_CopilotAiResponseMessage_Fragment = {
  __typename: "CopilotAiResponseMessage";
  messageType: CopilotMessageType;
  content: string;
  allowEvaluation: boolean;
};

export type CopilotMessageContent_CopilotEditableTextMessage_Fragment = {
  __typename: "CopilotEditableTextMessage";
  messageType: CopilotMessageType;
  content: string;
  allowEvaluation: boolean;
  title: string | null;
};

export type CopilotMessageContent_CopilotErrorMessage_Fragment = {
  __typename: "CopilotErrorMessage";
  messageType: CopilotMessageType;
  content: string;
};

export type CopilotMessageContent_CopilotFeedbackMessage_Fragment = {
  __typename: "CopilotFeedbackMessage";
  messageType: CopilotMessageType;
  feedbackCategory: FeedbackCategory;
  evaluatedMessageExId: string;
  optionalContent: string | null;
};

export type CopilotMessageContent_CopilotHumanInputMessage_Fragment = {
  __typename: "CopilotHumanInputMessage";
  messageType: CopilotMessageType;
  content: string;
  context: CopilotHumanInputMessageFragment_context | null;
};

export type CopilotMessageContent_CopilotHumanOperationMessage_Fragment = {
  __typename: "CopilotHumanOperationMessage";
  messageType: CopilotMessageType;
  optionalContent: string | null;
  humanOperationType: HumanOperationType;
};

export type CopilotMessageContent_CopilotInitialStateMessage_Fragment = {
  __typename: "CopilotInitialStateMessage";
  messageType: CopilotMessageType;
};

export type CopilotMessageContent_CopilotStateChangeMessage_Fragment = {
  __typename: "CopilotStateChangeMessage";
  messageType: CopilotMessageType;
  currentJobIsRunning: boolean;
};

export type CopilotMessageContent_CopilotStopMessage_Fragment = {
  __typename: "CopilotStopMessage";
  messageType: CopilotMessageType;
  reason: string | null;
};

export type CopilotMessageContent_CopilotSystemStatusMessage_Fragment = {
  __typename: "CopilotSystemStatusMessage";
  messageType: CopilotMessageType;
  content: string;
};

export type CopilotMessageContent_CopilotTaskMessage_Fragment = {
  __typename: "CopilotTaskMessage";
  messageType: CopilotMessageType;
  taskId: string;
  name: string;
  description: string | null;
  diff: unknown;
  isDiffReverted: boolean | null;
};

export type CopilotMessageContent_CopilotTaskRevertSuccessMessage_Fragment = {
  __typename: "CopilotTaskRevertSuccessMessage";
  messageType: CopilotMessageType;
  taskIds: Array<string | null>;
};

export type CopilotMessageContent_CopilotTerminateMessage_Fragment = {
  __typename: "CopilotTerminateMessage";
  messageType: CopilotMessageType;
  reason: string | null;
};

export type CopilotMessageContent_CopilotToolCallBatchExecErrorMessage_Fragment =
  {
    __typename: "CopilotToolCallBatchExecErrorMessage";
    messageType: CopilotMessageType;
    toolCallBatchId: string;
    error: string | null;
    context: CopilotToolCallBatchExecErrorMessageFragment_context | null;
  };

export type CopilotMessageContent_CopilotToolCallBatchMessage_Fragment = {
  __typename: "CopilotToolCallBatchMessage";
  messageType: CopilotMessageType;
  toolCallBatchId: string;
  toolCalls: Array<CopilotToolCallBatchMessageFragment_toolCalls>;
};

export type CopilotMessageContent_CopilotToolCallBatchResponseMessage_Fragment =
  {
    __typename: "CopilotToolCallBatchResponseMessage";
    messageType: CopilotMessageType;
    toolCallBatchId: string;
    responseByToolCallId: unknown;
    schemaDiff: unknown;
  };

export type CopilotMessageContentFragment =
  | CopilotMessageContent_CopilotAiResponseMessage_Fragment
  | CopilotMessageContent_CopilotEditableTextMessage_Fragment
  | CopilotMessageContent_CopilotErrorMessage_Fragment
  | CopilotMessageContent_CopilotFeedbackMessage_Fragment
  | CopilotMessageContent_CopilotHumanInputMessage_Fragment
  | CopilotMessageContent_CopilotHumanOperationMessage_Fragment
  | CopilotMessageContent_CopilotInitialStateMessage_Fragment
  | CopilotMessageContent_CopilotStateChangeMessage_Fragment
  | CopilotMessageContent_CopilotStopMessage_Fragment
  | CopilotMessageContent_CopilotSystemStatusMessage_Fragment
  | CopilotMessageContent_CopilotTaskMessage_Fragment
  | CopilotMessageContent_CopilotTaskRevertSuccessMessage_Fragment
  | CopilotMessageContent_CopilotTerminateMessage_Fragment
  | CopilotMessageContent_CopilotToolCallBatchExecErrorMessage_Fragment
  | CopilotMessageContent_CopilotToolCallBatchMessage_Fragment
  | CopilotMessageContent_CopilotToolCallBatchResponseMessage_Fragment;

export type CopilotMessageContentFragmentVariables = Exact<{
  [key: string]: never;
}>;

export type CopilotInitialStateMessageFragment_copilotMessages = {
  __typename: "CopilotMessage";
  exId: string;
  type: CopilotMessageType;
  createdAt: unknown;
};

export type CopilotInitialStateMessageFragment = {
  __typename: "CopilotInitialStateMessage";
  currentJobIsRunning: boolean;
  terminated: boolean | null;
  messageType: CopilotMessageType;
  copilotMessages: Array<CopilotInitialStateMessageFragment_copilotMessages>;
};

export type CopilotInitialStateMessageFragmentVariables = Exact<{
  [key: string]: never;
}>;

export type OnCopilotSessionUpdatesSubscription_onCopilotSessionUpdate_content_CopilotAiResponseMessage =
  {
    __typename: "CopilotAiResponseMessage";
    messageType: CopilotMessageType;
    content: string;
    allowEvaluation: boolean;
  };

export type OnCopilotSessionUpdatesSubscription_onCopilotSessionUpdate_content_CopilotEditableTextMessage =
  {
    __typename: "CopilotEditableTextMessage";
    messageType: CopilotMessageType;
    content: string;
    allowEvaluation: boolean;
    title: string | null;
  };

export type OnCopilotSessionUpdatesSubscription_onCopilotSessionUpdate_content_CopilotErrorMessage =
  {
    __typename: "CopilotErrorMessage";
    messageType: CopilotMessageType;
    content: string;
  };

export type OnCopilotSessionUpdatesSubscription_onCopilotSessionUpdate_content_CopilotFeedbackMessage =
  {
    __typename: "CopilotFeedbackMessage";
    messageType: CopilotMessageType;
    feedbackCategory: FeedbackCategory;
    evaluatedMessageExId: string;
    optionalContent: string | null;
  };

export type OnCopilotSessionUpdatesSubscription_onCopilotSessionUpdate_content_CopilotHumanInputMessage =
  {
    __typename: "CopilotHumanInputMessage";
    messageType: CopilotMessageType;
    content: string;
    context: CopilotHumanInputMessageFragment_context | null;
  };

export type OnCopilotSessionUpdatesSubscription_onCopilotSessionUpdate_content_CopilotHumanOperationMessage =
  {
    __typename: "CopilotHumanOperationMessage";
    messageType: CopilotMessageType;
    optionalContent: string | null;
    humanOperationType: HumanOperationType;
  };

export type OnCopilotSessionUpdatesSubscription_onCopilotSessionUpdate_content_CopilotInitialStateMessage =
  {
    __typename: "CopilotInitialStateMessage";
    messageType: CopilotMessageType;
    currentJobIsRunning: boolean;
    terminated: boolean | null;
    copilotMessages: Array<CopilotInitialStateMessageFragment_copilotMessages>;
  };

export type OnCopilotSessionUpdatesSubscription_onCopilotSessionUpdate_content_CopilotStateChangeMessage =
  {
    __typename: "CopilotStateChangeMessage";
    messageType: CopilotMessageType;
    currentJobIsRunning: boolean;
  };

export type OnCopilotSessionUpdatesSubscription_onCopilotSessionUpdate_content_CopilotStopMessage =
  {
    __typename: "CopilotStopMessage";
    messageType: CopilotMessageType;
    reason: string | null;
  };

export type OnCopilotSessionUpdatesSubscription_onCopilotSessionUpdate_content_CopilotSystemStatusMessage =
  {
    __typename: "CopilotSystemStatusMessage";
    messageType: CopilotMessageType;
    content: string;
  };

export type OnCopilotSessionUpdatesSubscription_onCopilotSessionUpdate_content_CopilotTaskMessage =
  {
    __typename: "CopilotTaskMessage";
    messageType: CopilotMessageType;
    taskId: string;
    name: string;
    description: string | null;
    diff: unknown;
    isDiffReverted: boolean | null;
  };

export type OnCopilotSessionUpdatesSubscription_onCopilotSessionUpdate_content_CopilotTaskRevertSuccessMessage =
  {
    __typename: "CopilotTaskRevertSuccessMessage";
    messageType: CopilotMessageType;
    taskIds: Array<string | null>;
  };

export type OnCopilotSessionUpdatesSubscription_onCopilotSessionUpdate_content_CopilotTerminateMessage =
  {
    __typename: "CopilotTerminateMessage";
    messageType: CopilotMessageType;
    reason: string | null;
  };

export type OnCopilotSessionUpdatesSubscription_onCopilotSessionUpdate_content_CopilotToolCallBatchExecErrorMessage =
  {
    __typename: "CopilotToolCallBatchExecErrorMessage";
    messageType: CopilotMessageType;
    toolCallBatchId: string;
    error: string | null;
    context: CopilotToolCallBatchExecErrorMessageFragment_context | null;
  };

export type OnCopilotSessionUpdatesSubscription_onCopilotSessionUpdate_content_CopilotToolCallBatchMessage =
  {
    __typename: "CopilotToolCallBatchMessage";
    messageType: CopilotMessageType;
    toolCallBatchId: string;
    toolCalls: Array<CopilotToolCallBatchMessageFragment_toolCalls>;
  };

export type OnCopilotSessionUpdatesSubscription_onCopilotSessionUpdate_content_CopilotToolCallBatchResponseMessage =
  {
    __typename: "CopilotToolCallBatchResponseMessage";
    messageType: CopilotMessageType;
    toolCallBatchId: string;
    responseByToolCallId: unknown;
    schemaDiff: unknown;
  };

export type OnCopilotSessionUpdatesSubscription_onCopilotSessionUpdate_content =
  | OnCopilotSessionUpdatesSubscription_onCopilotSessionUpdate_content_CopilotAiResponseMessage
  | OnCopilotSessionUpdatesSubscription_onCopilotSessionUpdate_content_CopilotEditableTextMessage
  | OnCopilotSessionUpdatesSubscription_onCopilotSessionUpdate_content_CopilotErrorMessage
  | OnCopilotSessionUpdatesSubscription_onCopilotSessionUpdate_content_CopilotFeedbackMessage
  | OnCopilotSessionUpdatesSubscription_onCopilotSessionUpdate_content_CopilotHumanInputMessage
  | OnCopilotSessionUpdatesSubscription_onCopilotSessionUpdate_content_CopilotHumanOperationMessage
  | OnCopilotSessionUpdatesSubscription_onCopilotSessionUpdate_content_CopilotInitialStateMessage
  | OnCopilotSessionUpdatesSubscription_onCopilotSessionUpdate_content_CopilotStateChangeMessage
  | OnCopilotSessionUpdatesSubscription_onCopilotSessionUpdate_content_CopilotStopMessage
  | OnCopilotSessionUpdatesSubscription_onCopilotSessionUpdate_content_CopilotSystemStatusMessage
  | OnCopilotSessionUpdatesSubscription_onCopilotSessionUpdate_content_CopilotTaskMessage
  | OnCopilotSessionUpdatesSubscription_onCopilotSessionUpdate_content_CopilotTaskRevertSuccessMessage
  | OnCopilotSessionUpdatesSubscription_onCopilotSessionUpdate_content_CopilotTerminateMessage
  | OnCopilotSessionUpdatesSubscription_onCopilotSessionUpdate_content_CopilotToolCallBatchExecErrorMessage
  | OnCopilotSessionUpdatesSubscription_onCopilotSessionUpdate_content_CopilotToolCallBatchMessage
  | OnCopilotSessionUpdatesSubscription_onCopilotSessionUpdate_content_CopilotToolCallBatchResponseMessage;

export type OnCopilotSessionUpdatesSubscription_onCopilotSessionUpdate = {
  __typename: "CopilotMessage";
  exId: string;
  createdAt: unknown;
  type: CopilotMessageType;
  content: OnCopilotSessionUpdatesSubscription_onCopilotSessionUpdate_content;
};

export type OnCopilotSessionUpdatesSubscription = {
  __typename: "Subscription";
  onCopilotSessionUpdate: OnCopilotSessionUpdatesSubscription_onCopilotSessionUpdate | null;
};

export type OnCopilotSessionUpdatesSubscriptionVariables = Exact<{
  sessionExId: string;
}>;
