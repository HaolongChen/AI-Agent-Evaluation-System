/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never;
    };
export type AfCodeTemplateStatus = "CREATED" | "PUBLISHED";

export type ColumnType =
  | "BIGINT"
  | "BIGSERIAL"
  | "BOOLEAN"
  | "DATE"
  | "DECIMAL"
  | "FILE"
  | "FLOAT8"
  | "GEO_POINT"
  | "IMAGE"
  | "IMAGE_LIST"
  | "INTEGER"
  | "INTERVAL"
  | "JSONB"
  | "LOCATION_INFO"
  | "TEXT"
  | "TIMESTAMPTZ"
  | "TIMETZ"
  | "UNKNOWN"
  | "VIDEO";

export type CopilotSessionType =
  | "AFCODE_TOOL"
  | "COPILOT"
  | "LOG_TOOL"
  | "PROMPT_OPTIMIZER"
  | "SET_DATA_BINDING";

export type Platform = "MOBILE" | "WEB" | "WECHAT";

export type ProjectContentCategory =
  | "AI"
  | "CMS"
  | "E_COMMERCE"
  | "FINTECH"
  | "HEALTH_CARE"
  | "LOGISTICS_AND_DELIVERY"
  | "ONLINE_EDUCATION"
  | "OTHERS"
  | "RESTAURANT_BOOKING"
  | "SOCIAL_MEDIA"
  | "TRAVEL_BOOKING"
  | "WEBSITE_HOMEPAGE";

export type ProjectCreationStatus = "COMPLETED" | "FAILED" | "PROCESSING";

export type ProjectSpaceType =
  | "JOINED_ORGANIZATION"
  | "PERSONAL"
  | "SHARE"
  | "TEAM";

export type LoginWithPhoneNumberMutation_loginWithPhoneNumber_account = {
  exId: string;
} & { __typename: "Account" };

export type LoginWithPhoneNumberMutation_loginWithPhoneNumber = {
  accessToken: string | null;
  account: LoginWithPhoneNumberMutation_loginWithPhoneNumber_account | null;
} & { __typename: "AccountInfo" };

export type LoginWithPhoneNumberMutation = {
  loginWithPhoneNumber: LoginWithPhoneNumberMutation_loginWithPhoneNumber | null;
} & { __typename: "Mutation" };

export type LoginWithPhoneNumberMutationVariables = Exact<{
  phoneNumber: string;
  password: string;
}>;

export type CheckProjectNameDuplicateQuery = {
  checkProjectNameDuplicate: boolean;
} & { __typename: "Query" };

export type CheckProjectNameDuplicateQueryVariables = Exact<{
  projectName: string;
}>;

export type CreateProjectInOrganizationAsyncMutation = {
  createProjectInOrganizationAsync: string | null;
} & { __typename: "Mutation" };

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
  { projectExId: string | null; status: ProjectCreationStatus | null } & {
    __typename: "ProjectCreationResult";
  };

export type OnProjectCreationStatusChangedSubscription = {
  onProjectCreationStatusChanged: OnProjectCreationStatusChangedSubscription_onProjectCreationStatusChanged | null;
} & { __typename: "Subscription" };

export type OnProjectCreationStatusChangedSubscriptionVariables = Exact<{
  uniqueId: string;
}>;

export type DeleteProjectMutation = { deleteProject: boolean } & {
  __typename: "Mutation";
};

export type DeleteProjectMutationVariables = Exact<{
  projectExId: string;
}>;

export type DeleteProjectByIdsMutation = { deleteProjectByIds: boolean } & {
  __typename: "Mutation";
};

export type DeleteProjectByIdsMutationVariables = Exact<{
  ids: Array<unknown> | unknown;
}>;

export type FixAliPayDataBindingMutation = { fixAliPayDataBinding: boolean } & {
  __typename: "Mutation";
};

export type FixAliPayDataBindingMutationVariables = Exact<{
  projectId: unknown;
}>;

export type FetchAppDetailByExIdQuery_fetchAppDetailByExId_latestSchema_crdtPatches_patches =
  { patchBase64: string } & { __typename: "SchemaCrdtPatch" };

export type FetchAppDetailByExIdQuery_fetchAppDetailByExId_latestSchema_crdtPatches =
  {
    lastPatchExId: string | null;
    patches: Array<FetchAppDetailByExIdQuery_fetchAppDetailByExId_latestSchema_crdtPatches_patches | null> | null;
  } & { __typename: "SchemaCrdtPatches" };

export type FetchAppDetailByExIdQuery_fetchAppDetailByExId_latestSchema = {
  crdtModelUrl: string | null;
  crdtPatches: FetchAppDetailByExIdQuery_fetchAppDetailByExId_latestSchema_crdtPatches | null;
} & { __typename: "CrdtSchema" };

export type FetchAppDetailByExIdQuery_fetchAppDetailByExId_Project_latestSchema_crdtPatches_patches =
  { patchBase64: string } & { __typename: "SchemaCrdtPatch" };

export type FetchAppDetailByExIdQuery_fetchAppDetailByExId_Project_latestSchema_crdtPatches =
  {
    lastPatchExId: string | null;
    patches: Array<FetchAppDetailByExIdQuery_fetchAppDetailByExId_Project_latestSchema_crdtPatches_patches | null> | null;
  } & { __typename: "SchemaCrdtPatches" };

export type FetchAppDetailByExIdQuery_fetchAppDetailByExId_Project_latestSchema =
  {
    crdtModelUrl: string | null;
    crdtPatches: FetchAppDetailByExIdQuery_fetchAppDetailByExId_Project_latestSchema_crdtPatches | null;
  } & { __typename: "CrdtSchema" };

export type FetchAppDetailByExIdQuery_fetchAppDetailByExId_WebApp_latestSchema_crdtPatches_patches =
  { patchBase64: string } & { __typename: "SchemaCrdtPatch" };

export type FetchAppDetailByExIdQuery_fetchAppDetailByExId_WebApp_latestSchema_crdtPatches =
  {
    lastPatchExId: string | null;
    patches: Array<FetchAppDetailByExIdQuery_fetchAppDetailByExId_WebApp_latestSchema_crdtPatches_patches | null> | null;
  } & { __typename: "SchemaCrdtPatches" };

export type FetchAppDetailByExIdQuery_fetchAppDetailByExId_WebApp_latestSchema =
  {
    crdtModelUrl: string | null;
    crdtPatches: FetchAppDetailByExIdQuery_fetchAppDetailByExId_WebApp_latestSchema_crdtPatches | null;
  } & { __typename: "CrdtSchema" };

export type FetchAppDetailByExIdQuery_fetchAppDetailByExId_WechatMiniProgramApp_latestSchema_crdtPatches_patches =
  { patchBase64: string } & { __typename: "SchemaCrdtPatch" };

export type FetchAppDetailByExIdQuery_fetchAppDetailByExId_WechatMiniProgramApp_latestSchema_crdtPatches =
  {
    lastPatchExId: string | null;
    patches: Array<FetchAppDetailByExIdQuery_fetchAppDetailByExId_WechatMiniProgramApp_latestSchema_crdtPatches_patches | null> | null;
  } & { __typename: "SchemaCrdtPatches" };

export type FetchAppDetailByExIdQuery_fetchAppDetailByExId_WechatMiniProgramApp_latestSchema =
  {
    crdtModelUrl: string | null;
    crdtPatches: FetchAppDetailByExIdQuery_fetchAppDetailByExId_WechatMiniProgramApp_latestSchema_crdtPatches | null;
  } & { __typename: "CrdtSchema" };

export type FetchAppDetailByExIdQuery_fetchAppDetailByExId_MobileApp = {
  latestSchema: FetchAppDetailByExIdQuery_fetchAppDetailByExId_latestSchema | null;
} & { __typename: "MobileApp" };

export type FetchAppDetailByExIdQuery_fetchAppDetailByExId_Project = {
  latestSchema: FetchAppDetailByExIdQuery_fetchAppDetailByExId_Project_latestSchema | null;
} & { __typename: "Project" };

export type FetchAppDetailByExIdQuery_fetchAppDetailByExId_WebApp = {
  latestSchema: FetchAppDetailByExIdQuery_fetchAppDetailByExId_WebApp_latestSchema | null;
} & { __typename: "WebApp" };

export type FetchAppDetailByExIdQuery_fetchAppDetailByExId_WechatMiniProgramApp =
  {
    latestSchema: FetchAppDetailByExIdQuery_fetchAppDetailByExId_WechatMiniProgramApp_latestSchema | null;
  } & { __typename: "WechatMiniProgramApp" };

export type FetchAppDetailByExIdQuery_fetchAppDetailByExId =
  | FetchAppDetailByExIdQuery_fetchAppDetailByExId_MobileApp
  | FetchAppDetailByExIdQuery_fetchAppDetailByExId_Project
  | FetchAppDetailByExIdQuery_fetchAppDetailByExId_WebApp
  | FetchAppDetailByExIdQuery_fetchAppDetailByExId_WechatMiniProgramApp;

export type FetchAppDetailByExIdQuery = {
  fetchAppDetailByExId: FetchAppDetailByExIdQuery_fetchAppDetailByExId | null;
} & { __typename: "Query" };

export type FetchAppDetailByExIdQueryVariables = Exact<{
  projectExId: string;
  appExId?: string | undefined;
  appVersionExId?: string | undefined;
}>;

export type AfCustomCodeTemplatesQuery_visibleAfCustomCodeTemplates_inputType =
  {
    name: string | null;
    type: ColumnType | null;
    defaultValue: unknown;
    required: boolean;
    description: string | null;
  } & { __typename: "NodeTemplateVariable" };

export type AfCustomCodeTemplatesQuery_visibleAfCustomCodeTemplates_outputType =
  {
    name: string | null;
    type: ColumnType | null;
    defaultValue: unknown;
    required: boolean;
    description: string | null;
  } & { __typename: "NodeTemplateVariable" };

export type AfCustomCodeTemplatesQuery_visibleAfCustomCodeTemplates = {
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
} & { __typename: "AfCodeTemplate" };

export type AfCustomCodeTemplatesQuery = {
  visibleAfCustomCodeTemplates: Array<AfCustomCodeTemplatesQuery_visibleAfCustomCodeTemplates | null> | null;
} & { __typename: "Query" };

export type AfCustomCodeTemplatesQueryVariables = Exact<{
  [key: string]: never;
}>;

export type SupportedCustomModelDescriptorQuery_supportedCustomModelDescriptor =
  {
    chatModelDescriptors: Array<unknown> | null;
    embeddingModelDescriptors: Array<unknown> | null;
  } & { __typename: "SupportedCustomModelDescriptor" };

export type SupportedCustomModelDescriptorQuery = {
  supportedCustomModelDescriptor: SupportedCustomModelDescriptorQuery_supportedCustomModelDescriptor | null;
} & { __typename: "Query" };

export type SupportedCustomModelDescriptorQueryVariables = Exact<{
  [key: string]: never;
}>;

export type GetCopilotSubscriptionCountQuery = {
  copilotSubscriptionCount: unknown;
} & { __typename: "Query" };

export type GetCopilotSubscriptionCountQueryVariables = Exact<{
  projectExId: string;
  sessionType: CopilotSessionType;
}>;
