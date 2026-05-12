export type Maybe<T> = T | undefined;
export type InputMaybe<T> = T | undefined;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T,
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never;
    };
export type LoginWithPhoneNumberMutationVariables = Exact<{
  phoneNumber: Scalars["String"]["input"];
  password: Scalars["String"]["input"];
}>;

export type LoginWithPhoneNumberMutation = {
  loginWithPhoneNumber?:
    | { __typename: "AccountInfo"; accessToken?: string | undefined }
    | undefined;
};

export type FetchAppDetailByExIdQueryVariables = Exact<{
  projectExId: Scalars["String"]["input"];
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  appVersionExId?: InputMaybe<Scalars["String"]["input"]>;
}>;

export type FetchAppDetailByExIdQuery = {
  fetchAppDetailByExId?:
    | { __typename: "MobileApp" }
    | {
        __typename: "Project";
        latestSchema?:
          | {
              __typename: "CrdtSchema";
              crdtModelUrl?: string | undefined;
              crdtPatches?:
                | {
                    __typename: "SchemaCrdtPatches";
                    lastPatchExId?: string | undefined;
                    patches?:
                      | Array<
                          | {
                              __typename: "SchemaCrdtPatch";
                              patchBase64: string;
                            }
                          | undefined
                        >
                      | undefined;
                  }
                | undefined;
            }
          | undefined;
      }
    | {
        __typename: "WebApp";
        latestSchema?:
          | {
              __typename: "CrdtSchema";
              crdtModelUrl?: string | undefined;
              crdtPatches?:
                | {
                    __typename: "SchemaCrdtPatches";
                    lastPatchExId?: string | undefined;
                    patches?:
                      | Array<
                          | {
                              __typename: "SchemaCrdtPatch";
                              patchBase64: string;
                            }
                          | undefined
                        >
                      | undefined;
                  }
                | undefined;
            }
          | undefined;
      }
    | {
        __typename: "WechatMiniProgramApp";
        latestSchema?:
          | {
              __typename: "CrdtSchema";
              crdtModelUrl?: string | undefined;
              crdtPatches?:
                | {
                    __typename: "SchemaCrdtPatches";
                    lastPatchExId?: string | undefined;
                    patches?:
                      | Array<
                          | {
                              __typename: "SchemaCrdtPatch";
                              patchBase64: string;
                            }
                          | undefined
                        >
                      | undefined;
                  }
                | undefined;
            }
          | undefined;
      }
    | undefined;
};

export type AfCustomCodeTemplatesQueryVariables = Exact<{
  [key: string]: never;
}>;

export type AfCustomCodeTemplatesQuery = {
  visibleAfCustomCodeTemplates?:
    | Array<
        | {
            __typename: "AfCodeTemplate";
            async: boolean;
            exId: string;
            author: any;
            displayName: string;
            logoUrl: string;
            status?: AfCodeTemplateStatus | undefined;
            templateGroup: string;
            updatedAt?: any | undefined;
            version?: string | undefined;
            inputType: Array<
              | {
                  __typename: "NodeTemplateVariable";
                  name?: string | undefined;
                  type?: ColumnType | undefined;
                  defaultValue?: any | undefined;
                  required: boolean;
                  description?: string | undefined;
                }
              | undefined
            >;
            outputType: Array<
              | {
                  __typename: "NodeTemplateVariable";
                  name?: string | undefined;
                  type?: ColumnType | undefined;
                  defaultValue?: any | undefined;
                  required: boolean;
                  description?: string | undefined;
                }
              | undefined
            >;
          }
        | undefined
      >
    | undefined;
};

export type SupportedCustomModelDescriptorQueryVariables = Exact<{
  [key: string]: never;
}>;

export type SupportedCustomModelDescriptorQuery = {
  supportedCustomModelDescriptor?:
    | {
        __typename: "SupportedCustomModelDescriptor";
        chatModelDescriptors?: Array<any | undefined> | undefined;
        embeddingModelDescriptors?: Array<any | undefined> | undefined;
      }
    | undefined;
};

export type CheckProjectNameDuplicateQueryVariables = Exact<{
  projectName: Scalars["String"]["input"];
}>;

export type CheckProjectNameDuplicateQuery = {
  checkProjectNameDuplicate: boolean;
};

export type CreateProjectInOrganizationMutationVariables = Exact<{
  projectName: Scalars["String"]["input"];
  templateExId?: InputMaybe<Scalars["String"]["input"]>;
  platform?: InputMaybe<Platform>;
  projectSpaceType: ProjectSpaceType;
  organizationExId: Scalars["String"]["input"];
  forBeginnerGuide?: InputMaybe<Scalars["Boolean"]["input"]>;
  category?: InputMaybe<ProjectContentCategory>;
  useRefactoredComponent?: InputMaybe<Scalars["Boolean"]["input"]>;
  useNewType?: InputMaybe<Scalars["Boolean"]["input"]>;
}>;

export type CreateProjectInOrganizationMutation = {
  createProjectInOrganizationAsync?: string | undefined;
};

export type OnProjectCreationStatusChangedSubscriptionVariables = Exact<{
  uniqueId: Scalars["String"]["input"];
}>;

export type OnProjectCreationStatusChangedSubscription = {
  onProjectCreationStatusChanged?:
    | {
        __typename: "ProjectCreationResult";
        projectExId?: string | undefined;
        status?: ProjectCreationStatus | undefined;
      }
    | undefined;
};

export type DeleteProjectMutationVariables = Exact<{
  projectExId: Scalars["String"]["input"];
}>;

export type DeleteProjectMutation = { deleteProject: boolean };

/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  /** Base64-encoded binary */
  Base64String: { input: any; output: any };
  /** An arbitrary precision signed decimal */
  BigDecimal: { input: any; output: any };
  /** Built-in scalar representing an amount of time */
  Duration: { input: any; output: any };
  /** Built-in scalar representing an instant in time */
  Instant: { input: any; output: any };
  /** Any JSON value */
  Json: { input: any; output: any };
  /** Built-in scalar for map-like structures */
  LinkedHashMap_String_StringScalar: { input: any; output: any };
  /** Built-in Locale */
  Locale: { input: any; output: any };
  /** A 64-bit signed integer */
  Long: { input: any; output: any };
  /** Built-in scalar for map-like structures */
  Map_BuildTarget_BuildTargetStatusScalar: { input: any; output: any };
  /** Built-in scalar for map-like structures */
  Map_CollaboratorLevel_CollaboratorTypeScalar: { input: any; output: any };
  /** Built-in scalar for map-like structures */
  Map_Locale_StringScalar: { input: any; output: any };
  /** Built-in scalar for map-like structures */
  Map_LogEventType_BooleanScalar: { input: any; output: any };
  /** Built-in scalar for map-like structures */
  Map_Long_IntegerScalar: { input: any; output: any };
  /** Built-in scalar for map-like structures */
  Map_Long_StringScalar: { input: any; output: any };
  /** Built-in scalar for map-like structures */
  Map_MarketRewardEventType_List_MarketRewardRuleScalar: {
    input: any;
    output: any;
  };
  /** Built-in scalar for map-like structures */
  Map_MergeTarget_MergeTargetStatusScalar: { input: any; output: any };
  /** Built-in scalar for map-like structures */
  Map_OffsetDateTime_DoubleScalar: { input: any; output: any };
  /** Built-in scalar for map-like structures */
  Map_Platform_JsonNodeScalar: { input: any; output: any };
  /** Built-in scalar for map-like structures */
  Map_PrefType_UserPreferenceScalar: { input: any; output: any };
  /** Built-in scalar for map-like structures */
  Map_ResourceType_DoubleScalar: { input: any; output: any };
  /** Built-in scalar for map-like structures */
  Map_ResourceType_LimitScalar: { input: any; output: any };
  /** Built-in scalar for map-like structures */
  Map_SeoRenderingMethod_RenderingMethodAvailableAndTagScalar: {
    input: any;
    output: any;
  };
  /** Built-in scalar for map-like structures */
  Map_String_JsonNodeScalar: { input: any; output: any };
  /** Built-in scalar for map-like structures */
  Map_String_List_CustomComponentScalar: { input: any; output: any };
  /** Built-in scalar for map-like structures */
  Map_String_ObjectScalar: { input: any; output: any };
  /** Built-in scalar for map-like structures */
  Map_String_StringScalar: { input: any; output: any };
  /** Built-in scalar for map-like structures */
  Map_String_TablePermissionScalar: { input: any; output: any };
  /** Built-in scalar for map-like structures */
  Map_String_VariableScalar: { input: any; output: any };
  /** Built-in scalar for map-like structures */
  Map_VerificationRecordType_BooleanScalar: { input: any; output: any };
  /** Built-in scalar representing a date-time with a UTC offset */
  OffsetDateTime: { input: any; output: any };
  /** Built-in scalar representing a period of time */
  Period: { input: any; output: any };
  /** UUID String */
  UUID: { input: any; output: any };
};

export type Account = {
  __typename: "Account";
  alipayAccount?: Maybe<AlipayAccount>;
  availableTechnicalSupportHours: Scalars["Float"]["output"];
  avatarUrl: Scalars["String"]["output"];
  cashableCommissionAmount?: Maybe<Scalars["BigDecimal"]["output"]>;
  commissionAmount?: Maybe<Scalars["BigDecimal"]["output"]>;
  commissionUserCount: Scalars["Int"]["output"];
  currentOrganization: Organization;
  daysSinceRegistration: Scalars["Long"]["output"];
  diffCount: Scalars["Long"]["output"];
  diffCountPercentageRanking?: Maybe<Scalars["BigDecimal"]["output"]>;
  displayName: Scalars["String"]["output"];
  email?: Maybe<Scalars["String"]["output"]>;
  employee: Scalars["Boolean"]["output"];
  exId: Scalars["String"]["output"];
  hasThirdPartyAccountBinding: Scalars["Boolean"]["output"];
  invitedUserCount: Scalars["Int"]["output"];
  involvedProjectCount: Scalars["Long"]["output"];
  joinedOrganizations?: Maybe<Array<Maybe<Organization>>>;
  maxLastOpenedAtInOrganization?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  mergingWithAnotherAccount: Scalars["Boolean"]["output"];
  organization?: Maybe<Organization>;
  organizations: Array<Organization>;
  ownedPromoCode: PromoCode;
  phoneNumber?: Maybe<Scalars["String"]["output"]>;
  phoneNumberBindingState?: Maybe<PhoneNumberBindingState>;
  profileImageUrl?: Maybe<Scalars["String"]["output"]>;
  projectCollaboratorType: CollaboratorType;
  referrerPromoCode?: Maybe<PromoCode>;
  registeredWithinLastMinute: Scalars["Boolean"]["output"];
  sourceChannel?: Maybe<Scalars["String"]["output"]>;
  stripeAccount?: Maybe<StripeAccount>;
  tags: AccountTags;
  userProfile: AccountProfile;
  username: Scalars["String"]["output"];
};

export type AccountCashableCommissionAmountArgs = {
  commissionRoles: Array<CommissionRole>;
};

export type AccountCommissionAmountArgs = {
  commissionRoles: Array<CommissionRole>;
};

export type AccountCommissionUserCountArgs = {
  commissionRoles: Array<CommissionRole>;
};

export type AccountHasThirdPartyAccountBindingArgs = {
  oAuth2Provider?: InputMaybe<OAuth2Provider>;
};

export type AccountMaxLastOpenedAtInOrganizationArgs = {
  orgExId: Scalars["String"]["input"];
};

export type AccountProjectCollaboratorTypeArgs = {
  projectExId: Scalars["String"]["input"];
};

export type AccountAndCollaborateType = {
  __typename: "AccountAndCollaborateType";
  account?: Maybe<Account>;
  collaboratorType?: Maybe<CollaboratorType>;
  joinCollaborationTime?: Maybe<Scalars["OffsetDateTime"]["output"]>;
};

export type AccountExIdAndName = {
  __typename: "AccountExIdAndName";
  accountExId?: Maybe<Scalars["String"]["output"]>;
  avatarUrl?: Maybe<Scalars["String"]["output"]>;
  displayName?: Maybe<Scalars["String"]["output"]>;
  userName?: Maybe<Scalars["String"]["output"]>;
};

export type AccountHasCoupon = {
  __typename: "AccountHasCoupon";
  chineseName: Scalars["String"]["output"];
  couponTemplate: CouponTemplate;
  createdAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  effectiveAt: Scalars["OffsetDateTime"]["output"];
  englishName: Scalars["String"]["output"];
  exId: Scalars["String"]["output"];
  expireAt: Scalars["OffsetDateTime"]["output"];
  status: CouponStatus;
  totalAmount: Scalars["Long"]["output"];
  updatedAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  usedAmount: Scalars["Long"]["output"];
};

export type AccountInfo = {
  __typename: "AccountInfo";
  accessToken?: Maybe<Scalars["String"]["output"]>;
  account?: Maybe<Account>;
  registeredWithinLastMinute: Scalars["Boolean"]["output"];
  roleNames?: Maybe<Array<Maybe<Scalars["String"]["output"]>>>;
};

export type AccountProfile = {
  __typename: "AccountProfile";
  ageRange?: Maybe<AgeRange>;
  industry?: Maybe<Scalars["String"]["output"]>;
  industryEnglish?: Maybe<Scalars["String"]["output"]>;
  preferences?: Maybe<Scalars["Map_PrefType_UserPreferenceScalar"]["output"]>;
  reasonToUseZion?: Maybe<ReasonToUseZion>;
  referralSource?: Maybe<Scalars["String"]["output"]>;
  title?: Maybe<Scalars["String"]["output"]>;
};

export type AccountProfileInput = {
  ageRange?: InputMaybe<AgeRange>;
  industry?: InputMaybe<Scalars["String"]["input"]>;
  industryEnglish?: InputMaybe<Scalars["String"]["input"]>;
  preferences?: InputMaybe<
    Scalars["Map_PrefType_UserPreferenceScalar"]["input"]
  >;
  reasonToUseZion?: InputMaybe<ReasonToUseZion>;
  referralSource?: InputMaybe<Scalars["String"]["input"]>;
  title?: InputMaybe<Scalars["String"]["input"]>;
};

export type AccountReadApp = {
  __typename: "AccountReadApp";
  mobileApp?: Maybe<MobileApp>;
  project?: Maybe<Project>;
  webApp?: Maybe<WebApp>;
  wechatMiniProgramApp?: Maybe<WechatMiniProgramApp>;
};

export type AccountTags = {
  __typename: "AccountTags";
  employee: Scalars["Boolean"]["output"];
  hasAttendedEducationProgram: Scalars["Boolean"]["output"];
  hasSeenGenerateFailedContactTab: Scalars["Boolean"]["output"];
  hasSeenGroupQrCode: Scalars["Boolean"]["output"];
  hasSeenIntro: Scalars["Boolean"]["output"];
  hasSeenNewDataModel: Scalars["Boolean"]["output"];
  hasSeenThirdPartyApiOperationIntro: Scalars["Boolean"]["output"];
  hasSetUserInfo: Scalars["Boolean"]["output"];
  hasUpdatedUserProfile: Scalars["Boolean"]["output"];
  role?: Maybe<Scalars["String"]["output"]>;
};

export type AccountTemplate = {
  __typename: "AccountTemplate";
  exId: Scalars["String"]["output"];
  template: ProjectTemplate;
};

export type AcquiredResourceRecord = {
  __typename: "AcquiredResourceRecord";
  expireAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  resourceAmount: Scalars["Float"]["output"];
  resourceType: ResourceType;
  startAt: Scalars["OffsetDateTime"]["output"];
};

export type AdditionalClientApp = ProductDetail & {
  __typename: "AdditionalClientApp";
  chineseName?: Maybe<Scalars["String"]["output"]>;
  currency?: Maybe<Currency>;
  englishName?: Maybe<Scalars["String"]["output"]>;
  paymentCycle?: Maybe<PaymentCycle>;
  price?: Maybe<Scalars["BigDecimal"]["output"]>;
};

export type AdditionalClientAppPriceInfo = {
  __typename: "AdditionalClientAppPriceInfo";
  currency: Currency;
  initialPaymentAmount: Scalars["BigDecimal"]["output"];
  paymentCycle: PaymentCycle;
  renewalAmount: Scalars["BigDecimal"]["output"];
};

export type AdditionalClientAppProductTypeDetail = ProductTypeDetail & {
  __typename: "AdditionalClientAppProductTypeDetail";
  paymentCycle?: Maybe<PaymentCycle>;
  productType?: Maybe<ProductType>;
};

export type AdditionalClientAppProductTypeDetailInput = {
  paymentCycle?: InputMaybe<PaymentCycle>;
};

export type AdditionalClientAppWithClonedSchema = ProductDetail & {
  __typename: "AdditionalClientAppWithClonedSchema";
  chineseName?: Maybe<Scalars["String"]["output"]>;
  currency?: Maybe<Currency>;
  englishName?: Maybe<Scalars["String"]["output"]>;
  paymentCycle?: Maybe<PaymentCycle>;
  price?: Maybe<Scalars["BigDecimal"]["output"]>;
};

export type AdditionalClientPurchaseItemDetailInput = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  appName?: InputMaybe<Scalars["String"]["input"]>;
  currency: Currency;
  projectExId: Scalars["String"]["input"];
  sourceAppExId?: InputMaybe<Scalars["String"]["input"]>;
};

export type AdvancedFunctionalityTutorial = {
  __typename: "AdvancedFunctionalityTutorial";
  chineseContent?: Maybe<Scalars["String"]["output"]>;
  chineseTitle?: Maybe<Scalars["String"]["output"]>;
  description?: Maybe<Scalars["String"]["output"]>;
  englishContent?: Maybe<Scalars["String"]["output"]>;
  englishTitle?: Maybe<Scalars["String"]["output"]>;
  functionality?: Maybe<Functionality>;
  tutorialDocumentUrl?: Maybe<Scalars["String"]["output"]>;
  tutorialVideoUrl?: Maybe<Scalars["String"]["output"]>;
};

export type AfCodeTemplate = {
  __typename: "AfCodeTemplate";
  async: Scalars["Boolean"]["output"];
  author: Scalars["Long"]["output"];
  displayName: Scalars["String"]["output"];
  exId: Scalars["String"]["output"];
  inputType: Array<Maybe<NodeTemplateVariable>>;
  logoUrl: Scalars["String"]["output"];
  outputType: Array<Maybe<NodeTemplateVariable>>;
  status?: Maybe<AfCodeTemplateStatus>;
  templateGroup: Scalars["String"]["output"];
  updatedAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  version?: Maybe<Scalars["String"]["output"]>;
};

export enum AfCodeTemplateStatus {
  Created = "CREATED",
  Published = "PUBLISHED",
}

export type AfCodeToolArgsInput = {
  actionFlowId: Scalars["String"]["input"];
  codeBlockInput: Scalars["Json"]["input"];
  codeBlockNodeId: Scalars["String"]["input"];
  codeBlockOutput: Scalars["Json"]["input"];
  humanInputMessage?: InputMaybe<CopilotHumanInputMessageInput>;
  toolCallBatchExecErrorMessage?: InputMaybe<CopilotToolCallBatchExecErrorMessageInput>;
  toolCallBatchResponseMessage?: InputMaybe<CopilotToolCallBatchResponseMessageInput>;
};

export enum AgeRange {
  Above_45 = "ABOVE_45",
  Age20_24 = "AGE20_24",
  Age25_34 = "AGE25_34",
  Age35_44 = "AGE35_44",
  Below_18 = "BELOW_18",
}

export type Agent = {
  __typename: "Agent";
  adminList?: Maybe<Array<Maybe<Scalars["String"]["output"]>>>;
  agentId: Scalars["Int"]["output"];
  agentName?: Maybe<Scalars["String"]["output"]>;
  appId: Scalars["Int"]["output"];
  logoUrl?: Maybe<Scalars["String"]["output"]>;
};

export enum AiModel {
  ChatGpt_3_5 = "CHAT_GPT_3_5",
  ChatGpt_4 = "CHAT_GPT_4",
  Gpt_4OMini = "GPT_4O_MINI",
  Gpt_4TurboVision = "GPT_4_TURBO_VISION",
  TextEmbeddingAda_002 = "TEXT_EMBEDDING_ADA_002",
  ZhipuTextEmbedding = "ZHIPU_TEXT_EMBEDDING",
}

export type AliPayConfig = {
  __typename: "AliPayConfig";
  alipayPublicKey: Scalars["String"]["output"];
  appId: Scalars["String"]["output"];
  charset?: Maybe<Scalars["String"]["output"]>;
  merchantPrivateKey: Scalars["String"]["output"];
  notifyUrl: Scalars["String"]["output"];
  paymentConfigVersion?: Maybe<PaymentConfigVersion>;
  returnUrl?: Maybe<Scalars["String"]["output"]>;
  signType?: Maybe<Scalars["String"]["output"]>;
};

export type AliPayConfigInput = {
  alipayPublicKey: Scalars["String"]["input"];
  appId: Scalars["String"]["input"];
  charset?: InputMaybe<Scalars["String"]["input"]>;
  merchantPrivateKey: Scalars["String"]["input"];
  notifyUrl: Scalars["String"]["input"];
  paymentConfigVersion?: InputMaybe<PaymentConfigVersion>;
  returnUrl?: InputMaybe<Scalars["String"]["input"]>;
  signType?: InputMaybe<Scalars["String"]["input"]>;
};

export type AlipayAccount = {
  __typename: "AlipayAccount";
  alipayAccountId?: Maybe<Scalars["String"]["output"]>;
  name?: Maybe<Scalars["String"]["output"]>;
  type?: Maybe<AlipayAccountIdType>;
};

export enum AlipayAccountIdType {
  LoginName = "LOGIN_NAME",
  UserId = "USER_ID",
}

export type AlipayResult = PaymentResult & {
  __typename: "AlipayResult";
  aliTradeNo?: Maybe<Scalars["String"]["output"]>;
  orderExId: Scalars["String"]["output"];
  paymentExId: Scalars["String"]["output"];
  paymentHtml?: Maybe<Scalars["String"]["output"]>;
  paymentId: Scalars["Long"]["output"];
  paymentPageType?: Maybe<PaymentPageType>;
  paymentType?: Maybe<PaymentType>;
  paymentUrl?: Maybe<Scalars["String"]["output"]>;
  status?: Maybe<SignStatus>;
};

export type AlipaySubscription = {
  __typename: "AlipaySubscription";
  currentPeriodEndAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  currentPeriodStartAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  status?: Maybe<AlipaySubscriptionStatus>;
};

export enum AlipaySubscriptionStatus {
  Normal = "NORMAL",
  Pending = "PENDING",
  Unsign = "UNSIGN",
}

export type AliyunSmsConfig = {
  __typename: "AliyunSmsConfig";
  powerOfAttorneyImageExId?: Maybe<Scalars["String"]["output"]>;
  signature?: Maybe<AliyunSmsSignature>;
};

export enum AliyunSmsSignSourceType {
  App = "APP",
  BrandName = "BRAND_NAME",
  EnterpriseOrInstitution = "ENTERPRISE_OR_INSTITUTION",
  ECommercePlatformStoreName = "E_COMMERCE_PLATFORM_STORE_NAME",
  OfficialAccountOrMiniprogram = "OFFICIAL_ACCOUNT_OR_MINIPROGRAM",
  Website = "WEBSITE",
}

export type AliyunSmsSignature = {
  __typename: "AliyunSmsSignature";
  description?: Maybe<Scalars["String"]["output"]>;
  qualificationId?: Maybe<Scalars["Long"]["output"]>;
  signSource?: Maybe<AliyunSmsSignSourceType>;
  signature?: Maybe<Scalars["String"]["output"]>;
};

export type AliyunSmsSignatureInput = {
  description?: InputMaybe<Scalars["String"]["input"]>;
  qualificationId?: InputMaybe<Scalars["Long"]["input"]>;
  signSource?: InputMaybe<AliyunSmsSignSourceType>;
  signature?: InputMaybe<Scalars["String"]["input"]>;
};

export type AliyunSmsSignatureResponse = {
  __typename: "AliyunSmsSignatureResponse";
  code: Scalars["String"]["output"];
  createdAt?: Maybe<Scalars["String"]["output"]>;
  message?: Maybe<Scalars["String"]["output"]>;
  reason?: Maybe<Scalars["String"]["output"]>;
  requestId?: Maybe<Scalars["String"]["output"]>;
  signStatus?: Maybe<AliyunSmsStatus>;
  signature: Scalars["String"]["output"];
};

export enum AliyunSmsStatus {
  Approved = "APPROVED",
  AuditCancelled = "AUDIT_CANCELLED",
  AuditFailed = "AUDIT_FAILED",
  InReview = "IN_REVIEW",
}

export type AliyunSmsTemplateParamsInput = {
  templateCode?: InputMaybe<Scalars["String"]["input"]>;
  templateContent: Scalars["String"]["input"];
  templateDescription: Scalars["String"]["input"];
  templateName: Scalars["String"]["input"];
  templateType: AliyunSmsTemplateType;
};

export type AliyunSmsTemplateResult = {
  __typename: "AliyunSmsTemplateResult";
  createdAt: Scalars["OffsetDateTime"]["output"];
  reason?: Maybe<Scalars["String"]["output"]>;
  templateCode: Scalars["String"]["output"];
  templateContent: Scalars["String"]["output"];
  templateDescription: Scalars["String"]["output"];
  templateName: Scalars["String"]["output"];
  templateStatus: AliyunSmsStatus;
  templateType: AliyunSmsTemplateType;
};

export enum AliyunSmsTemplateType {
  InternationalSms = "INTERNATIONAL_SMS",
  PromoteSms = "PROMOTE_SMS",
  SmsNontification = "SMS_NONTIFICATION",
  VerificationCode = "VERIFICATION_CODE",
}

export type ApiDebugResult = {
  __typename: "ApiDebugResult";
  api?: Maybe<Scalars["Json"]["output"]>;
  apiWorkSpace?: Maybe<Scalars["Json"]["output"]>;
  typeDefinitions?: Maybe<Scalars["Json"]["output"]>;
};

export type App = {
  additional: Scalars["Boolean"]["output"];
  appExId?: Maybe<Scalars["String"]["output"]>;
  appType?: Maybe<AppType>;
  collaboratorType: CollaboratorType;
  collaboratorTypeByLevel?: Maybe<
    Scalars["Map_CollaboratorLevel_CollaboratorTypeScalar"]["output"]
  >;
  collaboratorsAndType?: Maybe<Array<AccountAndCollaborateType>>;
  deleted: Scalars["Boolean"]["output"];
  expireAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  hasPublished: Scalars["Boolean"]["output"];
  isExpired: Scalars["Boolean"]["output"];
  isRenewable: Scalars["Boolean"]["output"];
  lastOpenedAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  name: Scalars["String"]["output"];
  projectExId: Scalars["String"]["output"];
  sharePermission: SharePermission;
};

export type AppConfig = {
  __typename: "AppConfig";
  appBackendAddr?: Maybe<Scalars["String"]["output"]>;
  appWebSocketServerAddr?: Maybe<Scalars["String"]["output"]>;
  language?: Maybe<LanguageType>;
  projectConfig?: Maybe<Scalars["Json"]["output"]>;
  projectExId?: Maybe<Scalars["String"]["output"]>;
  stripePublicKey?: Maybe<Scalars["String"]["output"]>;
};

export type AppConfigAndSchema = {
  __typename: "AppConfigAndSchema";
  appConfig?: Maybe<AppConfig>;
  runtimeSchemaJson?: Maybe<Scalars["Json"]["output"]>;
  schemaJson?: Maybe<Scalars["Json"]["output"]>;
};

export type AppCreationSourceDetail = {
  __typename: "AppCreationSourceDetail";
  type?: Maybe<AppCreationSourceType>;
};

export type AppCreationSourceInputInput = {
  clonedAppDetail?: InputMaybe<CreateAppFromClonedAppInputInput>;
  clonedSchemaDetail?: InputMaybe<CreateAppFromClonedSchemaInputInput>;
  type?: InputMaybe<AppCreationSourceType>;
};

export enum AppCreationSourceType {
  Blank = "BLANK",
  ClonedApp = "CLONED_APP",
  ClonedSchema = "CLONED_SCHEMA",
}

export enum AppType {
  BackendOnly = "BACKEND_ONLY",
  Combined = "COMBINED",
  Mobile = "MOBILE",
  Web = "WEB",
  WechatMiniProgram = "WECHAT_MINI_PROGRAM",
}

export type AppWithValidationErrorMessages = {
  __typename: "AppWithValidationErrorMessages";
  app: App;
  errorMessages: Array<Scalars["String"]["output"]>;
};

export enum ApplicationProductType {
  Momen = "MOMEN",
  Zion = "ZION",
}

export type ApplicationResult = {
  __typename: "ApplicationResult";
  errorMessage?: Maybe<ErrorMessage>;
  succeeded: Scalars["Boolean"]["output"];
};

export type ArtifactsInput = {
  android?: InputMaybe<Scalars["String"]["input"]>;
  androidApk?: InputMaybe<Scalars["String"]["input"]>;
  debugScriptUrl?: InputMaybe<Scalars["String"]["input"]>;
  h5?: InputMaybe<Scalars["String"]["input"]>;
  ionic?: InputMaybe<Scalars["String"]["input"]>;
  ios?: InputMaybe<Scalars["String"]["input"]>;
  iosIpa?: InputMaybe<Scalars["String"]["input"]>;
  mobileWeb?: InputMaybe<Scalars["String"]["input"]>;
  taro?: InputMaybe<Scalars["String"]["input"]>;
  web?: InputMaybe<Scalars["String"]["input"]>;
  webBetaQrCodeBase64?: InputMaybe<Scalars["String"]["input"]>;
  webBetaUrl?: InputMaybe<Scalars["String"]["input"]>;
  webQrCodeBase64?: InputMaybe<Scalars["String"]["input"]>;
  webUrl?: InputMaybe<Scalars["String"]["input"]>;
  wechatAppId?: InputMaybe<Scalars["String"]["input"]>;
  wechatMiniApp?: InputMaybe<Scalars["String"]["input"]>;
  wechatMiniAppPreviewTime?: InputMaybe<Scalars["OffsetDateTime"]["input"]>;
  wechatMiniAppPreviewVersion?: InputMaybe<Scalars["String"]["input"]>;
  wechatMiniAppQRcode?: InputMaybe<Scalars["String"]["input"]>;
  wechatMiniAppQRcodeBase64?: InputMaybe<Scalars["String"]["input"]>;
};

export enum Assessment {
  Bad = "BAD",
  Good = "GOOD",
}

export enum AuditPublishStatus {
  NotPublished = "NOT_PUBLISHED",
  PublishedFailed = "PUBLISHED_FAILED",
  PublishedSuccessfully = "PUBLISHED_SUCCESSFULLY",
}

export type AuditResponseForWechatMiniProgram = {
  __typename: "AuditResponseForWechatMiniProgram";
  pendingInternalReview: Scalars["Boolean"]["output"];
  wechatResponse?: Maybe<WechatApiSubmitAuditResponseEntity>;
};

export enum AuditStatus {
  InReview = "IN_REVIEW",
  Rejected = "REJECTED",
  Success = "SUCCESS",
  Withdrawn = "WITHDRAWN",
}

export type AuthenticationConfig = {
  __typename: "AuthenticationConfig";
  emailAuthConfig?: Maybe<EmailAuthConfig>;
  phoneNumberConfig?: Maybe<PhoneNumberAuthConfig>;
  shareWechatAccountByUnionId?: Maybe<Scalars["Boolean"]["output"]>;
  ssoConfigs?: Maybe<Array<Maybe<SsoConfig>>>;
  usernameConfig?: Maybe<UsernameAuthConfig>;
  wechatConfig?: Maybe<WechatAuthConfig>;
  wxworkAuthConfig?: Maybe<WxworkAuthConfig>;
};

export type Authority = {
  __typename: "Authority";
  betaHost?: Maybe<Scalars["String"]["output"]>;
  host?: Maybe<Scalars["String"]["output"]>;
  logHost?: Maybe<Scalars["String"]["output"]>;
  port?: Maybe<Scalars["String"]["output"]>;
  sslEnabled: Scalars["Boolean"]["output"];
};

export type AuthorityInput = {
  betaHost?: InputMaybe<Scalars["String"]["input"]>;
  host?: InputMaybe<Scalars["String"]["input"]>;
  logHost?: InputMaybe<Scalars["String"]["input"]>;
  port?: InputMaybe<Scalars["String"]["input"]>;
  sslEnabled: Scalars["Boolean"]["input"];
};

export type AuthorizeInfo = {
  __typename: "AuthorizeInfo";
  adminWechatId?: Maybe<Scalars["String"]["output"]>;
  appId?: Maybe<Scalars["String"]["output"]>;
  projectName?: Maybe<Scalars["String"]["output"]>;
};

export type Authorizer = {
  __typename: "Authorizer";
  authTimestamp: Scalars["Long"]["output"];
  authorizerAppId?: Maybe<Scalars["String"]["output"]>;
  refreshToken?: Maybe<Scalars["String"]["output"]>;
};

export type AzureOpenAiConfig = {
  __typename: "AzureOpenAiConfig";
  apiKey?: Maybe<Scalars["String"]["output"]>;
  deployment?: Maybe<Scalars["String"]["output"]>;
  endpoint?: Maybe<Scalars["String"]["output"]>;
  model?: Maybe<AiModel>;
  version?: Maybe<Scalars["String"]["output"]>;
};

export type BalancePayInfo = {
  __typename: "BalancePayInfo";
  orderProducts: Array<OrderProduct>;
};

export type BalancePayResult = PaymentResult & {
  __typename: "BalancePayResult";
  orderExId: Scalars["String"]["output"];
  paymentExId: Scalars["String"]["output"];
  paymentId: Scalars["Long"]["output"];
  paymentType?: Maybe<PaymentType>;
};

export type BalancePaySetting = {
  __typename: "BalancePaySetting";
  autoDeductionEnabled: Scalars["Boolean"]["output"];
};

export type BalancePaySettingInput = {
  autoDeductionEnabled: Scalars["Boolean"]["input"];
};

export type BalanceRecharge = {
  __typename: "BalanceRecharge";
  accountId: Scalars["Long"]["output"];
  allocatedAmount: Scalars["BigDecimal"]["output"];
  commissionId?: Maybe<Scalars["Long"]["output"]>;
  createdAt: Scalars["OffsetDateTime"]["output"];
  deductedAfterExpired: Scalars["Boolean"]["output"];
  depositPaymentId?: Maybe<Scalars["Long"]["output"]>;
  expireAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  rechargedAmount: Scalars["BigDecimal"]["output"];
  rewardRecordId?: Maybe<Scalars["Long"]["output"]>;
  type: BalanceRechargeType;
  updatedAt: Scalars["OffsetDateTime"]["output"];
};

export enum BalanceRechargeType {
  Commission = "COMMISSION",
  Deposit = "DEPOSIT",
  Issuance = "ISSUANCE",
}

export type BalanceTransactionRecord = {
  __typename: "BalanceTransactionRecord";
  balanceAfter: Scalars["BigDecimal"]["output"];
  balanceBefore: Scalars["BigDecimal"]["output"];
  balancePayInfo?: Maybe<BalancePayInfo>;
  balanceRecharge?: Maybe<BalanceRecharge>;
  createdAt: Scalars["OffsetDateTime"]["output"];
  status: BalanceTransactionStatus;
  transactionAmount: Scalars["BigDecimal"]["output"];
  transactionType: BalanceTransactionType;
  updatedAt: Scalars["OffsetDateTime"]["output"];
};

export enum BalanceTransactionStatus {
  Failed = "FAILED",
  Successful = "SUCCESSFUL",
}

export enum BalanceTransactionType {
  Pay = "PAY",
  Recharge = "RECHARGE",
  RechargeExpireDeduction = "RECHARGE_EXPIRE_DEDUCTION",
  Refund = "REFUND",
}

export type Banner = {
  __typename: "Banner";
  backgroundImgLink?: Maybe<Scalars["String"]["output"]>;
  backgroundImgUrl?: Maybe<Scalars["String"]["output"]>;
  qrCodeUrl?: Maybe<Scalars["String"]["output"]>;
  text?: Maybe<Scalars["String"]["output"]>;
};

export type BannerItem = {
  __typename: "BannerItem";
  description?: Maybe<Scalars["String"]["output"]>;
  effectiveAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  exId?: Maybe<Scalars["String"]["output"]>;
  expireAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  imageUrl?: Maybe<Scalars["String"]["output"]>;
  linkUrl?: Maybe<Scalars["String"]["output"]>;
};

export type BannerItemCreationDtoInput = {
  description?: InputMaybe<Scalars["String"]["input"]>;
  effectiveAt?: InputMaybe<Scalars["OffsetDateTime"]["input"]>;
  expireAt?: InputMaybe<Scalars["OffsetDateTime"]["input"]>;
  imageUrl: Scalars["String"]["input"];
  linkUrl: Scalars["String"]["input"];
};

export type BeginnerGuide = {
  __typename: "BeginnerGuide";
  lastStepId: Scalars["Int"]["output"];
  status?: Maybe<BeginnerGuideStatus>;
  tutorialVersion?: Maybe<BeginnerGuideTutorialVersion>;
};

export enum BeginnerGuideStatus {
  Completed = "COMPLETED",
  Creating = "CREATING",
  InProgress = "IN_PROGRESS",
  NotStarted = "NOT_STARTED",
  Skipped = "SKIPPED",
}

export enum BeginnerGuideTutorialVersion {
  V0 = "V0",
  V1 = "V1",
  V2 = "V2",
  V3 = "V3",
}

export type BetaWeappVerifyInfoInput = {
  code?: InputMaybe<Scalars["String"]["input"]>;
  code_type: Scalars["Int"]["input"];
  component_phone?: InputMaybe<Scalars["String"]["input"]>;
  enterprise_name?: InputMaybe<Scalars["String"]["input"]>;
  legal_persona_idcard?: InputMaybe<Scalars["String"]["input"]>;
  legal_persona_name?: InputMaybe<Scalars["String"]["input"]>;
  legal_persona_wechat?: InputMaybe<Scalars["String"]["input"]>;
};

export type BuildAppConfig = {
  __typename: "BuildAppConfig";
  clientId?: Maybe<Scalars["String"]["output"]>;
  deploymentEnvConfig?: Maybe<Scalars["Json"]["output"]>;
  genWaterMarkCode: Scalars["Boolean"]["output"];
  pipelinePlatforms?: Maybe<Array<Maybe<BuildTarget>>>;
  project?: Maybe<Scalars["Json"]["output"]>;
  schemaJson?: Maybe<Scalars["Json"]["output"]>;
  serverConfig?: Maybe<Scalars["Json"]["output"]>;
  wxworkLoginEnabled: Scalars["Boolean"]["output"];
};

export type BuildAppIcon = {
  __typename: "BuildAppIcon";
  exId?: Maybe<Scalars["String"]["output"]>;
  url?: Maybe<Scalars["String"]["output"]>;
};

export enum BuildStatus {
  Building = "BUILDING",
  BuildFailed = "BUILD_FAILED",
  BuildSuccessful = "BUILD_SUCCESSFUL",
  Created = "CREATED",
  Importing = "IMPORTING",
  ImportFailed = "IMPORT_FAILED",
  ImportSuccessful = "IMPORT_SUCCESSFUL",
}

export enum BuildTarget {
  Android = "ANDROID",
  Ios = "IOS",
  SupportService = "SUPPORT_SERVICE",
  WebZvmBeta = "WEB_ZVM_BETA",
  WebZvmProd = "WEB_ZVM_PROD",
  WechatMiniprogram = "WECHAT_MINIPROGRAM",
  /** @deprecated Deprecated */
  WechatMiniprogramGenCode = "WECHAT_MINIPROGRAM_GEN_CODE",
  WechatMiniprogramZvm = "WECHAT_MINIPROGRAM_ZVM",
  /** @deprecated Deprecated */
  WechatMiniprogramZvmGenCode = "WECHAT_MINIPROGRAM_ZVM_GEN_CODE",
}

export type BuildTargetAndDeploymentRecord = {
  __typename: "BuildTargetAndDeploymentRecord";
  buildTarget?: Maybe<BuildTarget>;
  deploymentRecord?: Maybe<DeploymentRecord>;
};

export type BuildTargetPipelineStatus = {
  __typename: "BuildTargetPipelineStatus";
  buildTarget: BuildTarget;
  inProgressMessage?: Maybe<Scalars["String"]["output"]>;
  schemaExId: Scalars["String"]["output"];
  startedAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  status: BuildTargetStatus;
  succeededAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
};

export enum BuildTargetStatus {
  Canceled = "CANCELED",
  Deploying = "DEPLOYING",
  Failed = "FAILED",
  Finished = "FINISHED",
  Pending = "PENDING",
}

export enum CannedAccessControlList {
  AuthenticateRead = "AUTHENTICATE_READ",
  AwsExecRead = "AWS_EXEC_READ",
  BucketOwnerFullControl = "BUCKET_OWNER_FULL_CONTROL",
  BucketOwnerRead = "BUCKET_OWNER_READ",
  Default = "DEFAULT",
  LogDeliveryWrite = "LOG_DELIVERY_WRITE",
  Private = "PRIVATE",
  PublicRead = "PUBLIC_READ",
  PublicReadWrite = "PUBLIC_READ_WRITE",
}

export enum Capability {
  ActionFlow = "ACTION_FLOW",
  Ai = "AI",
  BrandingRemoval = "BRANDING_REMOVAL",
  CollaborativeEditor = "COLLABORATIVE_EDITOR",
  ComputingPower = "COMPUTING_POWER",
  ComputingPowerKitDiscount = "COMPUTING_POWER_KIT_DISCOUNT",
  CustomDomain = "CUSTOM_DOMAIN",
  CustomLlmModel = "CUSTOM_LLM_MODEL",
  DataVisualizer = "DATA_VISUALIZER",
  MultiClient = "MULTI_CLIENT",
  Payment = "PAYMENT",
  PermissionRole = "PERMISSION_ROLE",
  ProjectPlanDiscount = "PROJECT_PLAN_DISCOUNT",
  PublishWeb = "PUBLISH_WEB",
  Seo = "SEO",
  SmsConfig = "SMS_CONFIG",
  Sso = "SSO",
  ThirdPartyApi = "THIRD_PARTY_API",
  VectorStorage = "VECTOR_STORAGE",
}

export type CapabilityAndLimit = {
  __typename: "CapabilityAndLimit";
  capability?: Maybe<Capability>;
  limit?: Maybe<Limit>;
};

export type CapabilityAndLimitCheckResult = {
  __typename: "CapabilityAndLimitCheckResult";
  minimumProjectPlanType?: Maybe<ProjectPlanType>;
  unavailableCapabilities?: Maybe<Array<Maybe<Capability>>>;
};

export enum Category {
  FunctionalUpdate = "FUNCTIONAL_UPDATE",
  OperationalActivity = "OPERATIONAL_ACTIVITY",
  System = "SYSTEM",
}

export type CategoryAndFeatures = {
  __typename: "CategoryAndFeatures";
  category?: Maybe<PlanFeatureCategory>;
  features?: Maybe<Array<Maybe<PlanFeature>>>;
};

export type CategoryOfTemplate = {
  __typename: "CategoryOfTemplate";
  defaultPlatform?: Maybe<Platform>;
  displayName?: Maybe<Scalars["String"]["output"]>;
  exId?: Maybe<Scalars["String"]["output"]>;
  name?: Maybe<Scalars["String"]["output"]>;
};

export type CdnInputInput = {
  authority?: InputMaybe<Scalars["String"]["input"]>;
  key?: InputMaybe<Scalars["String"]["input"]>;
  keyPairId?: InputMaybe<Scalars["String"]["input"]>;
  privateKeyBase64?: InputMaybe<Scalars["String"]["input"]>;
};

export type Certificate = {
  __typename: "Certificate";
  certId?: Maybe<Scalars["String"]["output"]>;
  certName?: Maybe<Scalars["String"]["output"]>;
  commonNames?: Maybe<Array<Maybe<Scalars["String"]["output"]>>>;
};

export type CertificateEntityInput = {
  certBase64?: InputMaybe<Scalars["String"]["input"]>;
  keyBase64?: InputMaybe<Scalars["String"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
};

export type ClickButtonInput = {
  key?: InputMaybe<Scalars["String"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
};

export type ClientLogEntryInput = {
  category: Scalars["String"]["input"];
  data: Scalars["Json"]["input"];
  env?: InputMaybe<Scalars["Json"]["input"]>;
  eventId: Scalars["String"]["input"];
  timestamp: Scalars["Long"]["input"];
};

export type CloudConfiguration = {
  __typename: "CloudConfiguration";
  authority?: Maybe<Authority>;
  bucket?: Maybe<Scalars["String"]["output"]>;
  edgeServiceConfiguration?: Maybe<EdgeServiceConfiguration>;
  exId: Scalars["String"]["output"];
  hostAliases?: Maybe<Array<Maybe<HostAlias>>>;
  logConfig?: Maybe<LogConfig>;
  name?: Maybe<Scalars["String"]["output"]>;
  provider?: Maybe<CloudProvider>;
  /** backend only query */
  regionConfig?: Maybe<RegionConfig>;
  remoteLoggingEnabled: Scalars["Boolean"]["output"];
};

export type CloudObject = {
  __typename: "CloudObject";
  cloudConfigurationExId: Scalars["String"]["output"];
  downloadUrl: Scalars["String"]["output"];
  key?: Maybe<Scalars["String"]["output"]>;
  lastModified?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  sizeBytes: Scalars["Long"]["output"];
};

export enum CloudProvider {
  Aliyun = "ALIYUN",
  Aws = "AWS",
  CloudFlare = "CLOUD_FLARE",
}

export type CodeComponentMetaInputInput = {
  category: Scalars["String"]["input"];
  definition: Scalars["Json"]["input"];
  description?: InputMaybe<Scalars["String"]["input"]>;
  displayName?: InputMaybe<Scalars["String"]["input"]>;
  name: Scalars["String"]["input"];
  previewLink?: InputMaybe<Scalars["String"]["input"]>;
  type: Scalars["String"]["input"];
  version: Scalars["String"]["input"];
};

export type CodeComponentPackage = {
  __typename: "CodeComponentPackage";
  demoLink?: Maybe<Scalars["String"]["output"]>;
  docFile?: Maybe<File>;
  exId?: Maybe<Scalars["String"]["output"]>;
  icon?: Maybe<Image>;
  latestPublishRecord?: Maybe<CodeComponentPackagePublishRecord>;
  name?: Maybe<Scalars["String"]["output"]>;
  publishRecords?: Maybe<Array<Maybe<CodeComponentPackagePublishRecord>>>;
  publishedInMarket?: Maybe<Scalars["Boolean"]["output"]>;
};

export type CodeComponentPackageDetail = ProductDetail & {
  __typename: "CodeComponentPackageDetail";
  chineseName?: Maybe<Scalars["String"]["output"]>;
  currency?: Maybe<Currency>;
  englishName?: Maybe<Scalars["String"]["output"]>;
  packageExId?: Maybe<Scalars["String"]["output"]>;
  price?: Maybe<Scalars["BigDecimal"]["output"]>;
  productName?: Maybe<Scalars["String"]["output"]>;
};

export type CodeComponentPackageProductDetailInputInput = {
  packageExId?: InputMaybe<Scalars["String"]["input"]>;
  price?: InputMaybe<Scalars["BigDecimal"]["input"]>;
  productName?: InputMaybe<Scalars["String"]["input"]>;
};

export type CodeComponentPackagePublishRecord = {
  __typename: "CodeComponentPackagePublishRecord";
  codeComponents?: Maybe<Array<Maybe<CodeComponentPublishRecord>>>;
  createdAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  demoLink?: Maybe<Scalars["String"]["output"]>;
  platforms?: Maybe<Array<Maybe<Platform>>>;
  repoUrl?: Maybe<Scalars["String"]["output"]>;
  version?: Maybe<Scalars["String"]["output"]>;
};

export type CodeComponentPackagePurchaseItemDetailInput = {
  currency: Currency;
  productExId: Scalars["String"]["input"];
  projectExId: Scalars["String"]["input"];
};

export type CodeComponentPresignedUrlInputInput = {
  fileKey?: InputMaybe<Scalars["String"]["input"]>;
  md5Base64?: InputMaybe<Scalars["String"]["input"]>;
};

export type CodeComponentPublishRecord = {
  __typename: "CodeComponentPublishRecord";
  canvasPreviewImage?: Maybe<Image>;
  category?: Maybe<Scalars["String"]["output"]>;
  coverImage?: Maybe<Image>;
  createdAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  definition?: Maybe<Scalars["Json"]["output"]>;
  description?: Maybe<Scalars["String"]["output"]>;
  displayName?: Maybe<Scalars["String"]["output"]>;
  docFile?: Maybe<File>;
  icon?: Maybe<Image>;
  name?: Maybe<Scalars["String"]["output"]>;
  previewLink?: Maybe<Scalars["String"]["output"]>;
  type?: Maybe<Scalars["String"]["output"]>;
  version?: Maybe<Scalars["String"]["output"]>;
};

export type CollaborationInfo = {
  __typename: "CollaborationInfo";
  collaboratorCount: Scalars["Int"]["output"];
  collaborators?: Maybe<Array<Maybe<AccountAndCollaborateType>>>;
};

export type CollaborativeSharedResource_Project = {
  __typename: "CollaborativeSharedResource_Project";
  hasExhausted: Scalars["Boolean"]["output"];
  resource?: Maybe<Project>;
};

export type CollaborativeSharedResource_ShareToken = {
  __typename: "CollaborativeSharedResource_ShareToken";
  hasExhausted: Scalars["Boolean"]["output"];
  resource?: Maybe<ShareToken>;
};

export enum CollaboratorLevel {
  App = "APP",
  DataVisualizer = "DATA_VISUALIZER",
  Project = "PROJECT",
}

export enum CollaboratorType {
  Editor = "EDITOR",
  Manager = "MANAGER",
  None = "NONE",
  Owner = "OWNER",
  Viewer = "VIEWER",
}

export type CollaboratorTypeAndDefaultSharePermission = {
  __typename: "CollaboratorTypeAndDefaultSharePermission";
  collaboratorType: CollaboratorType;
  defaultSharePermission: SharePermission;
};

export type CollaboratorTypeAndLevel = {
  __typename: "CollaboratorTypeAndLevel";
  collaboratorLevel?: Maybe<CollaboratorLevel>;
  collaboratorType?: Maybe<CollaboratorType>;
};

export enum ColumnType {
  Bigint = "BIGINT",
  Bigserial = "BIGSERIAL",
  Boolean = "BOOLEAN",
  Date = "DATE",
  Decimal = "DECIMAL",
  File = "FILE",
  Float8 = "FLOAT8",
  GeoPoint = "GEO_POINT",
  Image = "IMAGE",
  ImageList = "IMAGE_LIST",
  Integer = "INTEGER",
  Interval = "INTERVAL",
  Jsonb = "JSONB",
  LocationInfo = "LOCATION_INFO",
  Text = "TEXT",
  Timestamptz = "TIMESTAMPTZ",
  Timetz = "TIMETZ",
  Unknown = "UNKNOWN",
  Video = "VIDEO",
}

export enum CommissionRewardType {
  Credit = "CREDIT",
  Money = "MONEY",
}

export enum CommissionRole {
  Developer = "DEVELOPER",
  Promoter = "PROMOTER",
}

export type CommissionRuleDtoInput = {
  commissionRole: CommissionRole;
  expireAt: Scalars["OffsetDateTime"]["input"];
  rewards: Array<InputMaybe<CommissionRuleRewardDtoInput>>;
  startAt: Scalars["OffsetDateTime"]["input"];
};

export type CommissionRuleRewardDtoInput = {
  commissionRate: Scalars["BigDecimal"]["input"];
  commissionRewardType: CommissionRewardType;
};

export enum CommissionStatus {
  Failed = "FAILED",
  InProgress = "IN_PROGRESS",
  Pending = "PENDING",
  Successful = "SUCCESSFUL",
}

export type CompanyInfo = {
  __typename: "CompanyInfo";
  bankAccountNumber?: Maybe<Scalars["String"]["output"]>;
  bankName?: Maybe<Scalars["String"]["output"]>;
  companyName: Scalars["String"]["output"];
  exId: Scalars["String"]["output"];
  registrationAddress?: Maybe<Scalars["String"]["output"]>;
  registrationPhone?: Maybe<Scalars["String"]["output"]>;
  searchKey: Scalars["String"]["output"];
  taxNumber?: Maybe<Scalars["String"]["output"]>;
};

export type CompanyInvoiceProfile = InvoiceProfile & {
  __typename: "CompanyInvoiceProfile";
  bankAccountNumber: Scalars["String"]["output"];
  bankName: Scalars["String"]["output"];
  companyName: Scalars["String"]["output"];
  email: Scalars["String"]["output"];
  exId: Scalars["String"]["output"];
  fieldsInChinese?: Maybe<
    Scalars["LinkedHashMap_String_StringScalar"]["output"]
  >;
  name?: Maybe<Scalars["String"]["output"]>;
  registrationAddress: Scalars["String"]["output"];
  registrationPhone: Scalars["String"]["output"];
  taxNumber: Scalars["String"]["output"];
  type?: Maybe<InvoiceProfileType>;
};

export type CompanyInvoiceProfileInputInput = {
  bankAccountNumber: Scalars["String"]["input"];
  bankName: Scalars["String"]["input"];
  companyName: Scalars["String"]["input"];
  email: Scalars["String"]["input"];
  registrationAddress: Scalars["String"]["input"];
  registrationPhone: Scalars["String"]["input"];
  taxNumber: Scalars["String"]["input"];
};

export type ComputingPowerAddonDetail = ProductDetail & {
  __typename: "ComputingPowerAddonDetail";
  amount?: Maybe<Scalars["Float"]["output"]>;
  chineseName?: Maybe<Scalars["String"]["output"]>;
  computingPowerAddonType?: Maybe<ComputingPowerAddonType>;
  currency?: Maybe<Currency>;
  englishName?: Maybe<Scalars["String"]["output"]>;
  period?: Maybe<Scalars["Period"]["output"]>;
  price?: Maybe<Scalars["BigDecimal"]["output"]>;
};

export type ComputingPowerAddonInfo = {
  __typename: "ComputingPowerAddonInfo";
  computingPowerAddonType: ComputingPowerAddonType;
  currency: Currency;
  period?: Maybe<Scalars["Period"]["output"]>;
  price: Scalars["BigDecimal"]["output"];
  productId: Scalars["Long"]["output"];
  resourceTypeByAmount: Scalars["Map_ResourceType_DoubleScalar"]["output"];
};

export type ComputingPowerAddonProductTypeDetail = ProductTypeDetail & {
  __typename: "ComputingPowerAddonProductTypeDetail";
  computingPowerAddonType?: Maybe<ComputingPowerAddonType>;
  period?: Maybe<Scalars["Period"]["output"]>;
  productType?: Maybe<ProductType>;
};

export type ComputingPowerAddonProductTypeDetailInput = {
  computingPowerAddonType?: InputMaybe<ComputingPowerAddonType>;
  period?: InputMaybe<Scalars["Period"]["input"]>;
};

export type ComputingPowerAddonPurchaseItemDetailInput = {
  currency: Currency;
  productIdAndQuantity: Scalars["Map_Long_IntegerScalar"]["input"];
  projectExId: Scalars["String"]["input"];
};

export enum ComputingPowerAddonType {
  AppAiToken = "APP_AI_TOKEN",
  AutomaticActionFlow = "AUTOMATIC_ACTION_FLOW",
  BlockStorage = "BLOCK_STORAGE",
  ObjectStorage = "OBJECT_STORAGE",
  OutflowWithNoReset = "OUTFLOW_WITH_NO_RESET",
  Sms = "SMS",
}

export type ComputingPowerCartItem = {
  __typename: "ComputingPowerCartItem";
  actualUnitPrice?: Maybe<Scalars["BigDecimal"]["output"]>;
  createdAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  productId: Scalars["Long"]["output"];
  quantity: Scalars["Int"]["output"];
  updatedAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
};

export type ComputingPowerCartPurchaseItemDetailInput = {
  currency: Currency;
  projectExId: Scalars["String"]["input"];
};

export type ComputingPowerEntryInput = {
  amount: Scalars["Float"]["input"];
  resetCycle?: InputMaybe<Cycle>;
  resourceType?: InputMaybe<ResourceType>;
};

export type ComputingPowerKit = {
  __typename: "ComputingPowerKit";
  expireAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  inActiveSubscription: Scalars["Boolean"]["output"];
  productType: ComputingPowerKitType;
  quantity: Scalars["Int"]["output"];
  startAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
};

export type ComputingPowerKitDetail = ProductDetail & {
  __typename: "ComputingPowerKitDetail";
  chineseName?: Maybe<Scalars["String"]["output"]>;
  computingPowerKitType?: Maybe<ComputingPowerKitType>;
  currency?: Maybe<Currency>;
  englishName?: Maybe<Scalars["String"]["output"]>;
  period?: Maybe<Scalars["Period"]["output"]>;
  price?: Maybe<Scalars["BigDecimal"]["output"]>;
};

export type ComputingPowerKitInfo = {
  __typename: "ComputingPowerKitInfo";
  actualPrice: Scalars["BigDecimal"]["output"];
  computingPowerKitType: ComputingPowerKitType;
  currency: Currency;
  originalPrice: Scalars["BigDecimal"]["output"];
  period: Scalars["Period"]["output"];
  productId: Scalars["Long"]["output"];
  resourceTypeByAmount: Scalars["Map_ResourceType_DoubleScalar"]["output"];
};

export type ComputingPowerKitProductTypeDetail = ProductTypeDetail & {
  __typename: "ComputingPowerKitProductTypeDetail";
  computingPowerKitType?: Maybe<ComputingPowerKitType>;
  period?: Maybe<Scalars["Period"]["output"]>;
  productType?: Maybe<ProductType>;
};

export type ComputingPowerKitProductTypeDetailInput = {
  computingPowerKitType?: InputMaybe<ComputingPowerKitType>;
  period?: InputMaybe<Scalars["Period"]["input"]>;
};

export enum ComputingPowerKitPurchaseOperation {
  PurchaseNew = "PURCHASE_NEW",
  RenewWithCurrentQuantity = "RENEW_WITH_CURRENT_QUANTITY",
  UpgradeToCurrentExpireTime = "UPGRADE_TO_CURRENT_EXPIRE_TIME",
}

export enum ComputingPowerKitType {
  MultiTenant = "MULTI_TENANT",
  SingleTenant = "SINGLE_TENANT",
}

export type ComputingPowerOrderInfo = {
  __typename: "ComputingPowerOrderInfo";
  currency?: Maybe<Currency>;
  effectiveAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  exid?: Maybe<Scalars["String"]["output"]>;
  expiredAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  orderInfoType?: Maybe<ComputingPowerOrderInfoType>;
  price?: Maybe<Scalars["BigDecimal"]["output"]>;
  quantity: Scalars["Long"]["output"];
  specifications?: Maybe<Scalars["Map_ResourceType_DoubleScalar"]["output"]>;
};

export enum ComputingPowerOrderInfoType {
  AppAiToken = "APP_AI_TOKEN",
  AutomaticActionFlow = "AUTOMATIC_ACTION_FLOW",
  BlockStorage = "BLOCK_STORAGE",
  ObjectStorage = "OBJECT_STORAGE",
  OutflowWithNoReset = "OUTFLOW_WITH_NO_RESET",
  SingleTenant = "SINGLE_TENANT",
  Sms = "SMS",
}

export type ComputingPowerResourceInfo = {
  __typename: "ComputingPowerResourceInfo";
  amount: Scalars["Float"]["output"];
  expireAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  resourceType: ResourceType;
};

export type ConditionConfig = {
  __typename: "ConditionConfig";
  valueExistsInDbCondition?: Maybe<Scalars["Json"]["output"]>;
};

export type ConnectionCursor = {
  __typename: "ConnectionCursor";
  value?: Maybe<Scalars["String"]["output"]>;
};

export type ConnectionPaginatorInput = {
  /** 游标：cursor */
  after?: InputMaybe<Scalars["String"]["input"]>;
  /** 游标：cursor */
  before?: InputMaybe<Scalars["String"]["input"]>;
  /** 取游标：after后的数量 */
  first?: InputMaybe<Scalars["Int"]["input"]>;
  /** 取游标：before前的数量 */
  last?: InputMaybe<Scalars["Int"]["input"]>;
};

export type Connection_Account = {
  __typename: "Connection_Account";
  edges?: Maybe<Array<Maybe<Edge_Account>>>;
  pageInfo?: Maybe<PageInfo>;
};

export type Connection_AccountAndCollaborateType = {
  __typename: "Connection_AccountAndCollaborateType";
  edges?: Maybe<Array<Maybe<Edge_AccountAndCollaborateType>>>;
  pageInfo?: Maybe<PageInfo>;
};

export type Connection_AccountHasCoupon = {
  __typename: "Connection_AccountHasCoupon";
  edges?: Maybe<Array<Maybe<Edge_AccountHasCoupon>>>;
  pageInfo?: Maybe<PageInfo>;
};

export type Connection_AccountTemplate = {
  __typename: "Connection_AccountTemplate";
  edges?: Maybe<Array<Maybe<Edge_AccountTemplate>>>;
  pageInfo?: Maybe<PageInfo>;
};

export type Connection_App = {
  __typename: "Connection_App";
  edges?: Maybe<Array<Maybe<Edge_App>>>;
  pageInfo?: Maybe<PageInfo>;
};

export type Connection_BalanceTransactionRecord = {
  __typename: "Connection_BalanceTransactionRecord";
  edges?: Maybe<Array<Maybe<Edge_BalanceTransactionRecord>>>;
  pageInfo?: Maybe<PageInfo>;
};

export type Connection_BannerItem = {
  __typename: "Connection_BannerItem";
  edges?: Maybe<Array<Maybe<Edge_BannerItem>>>;
  pageInfo?: Maybe<PageInfo>;
};

export type Connection_ComputingPowerOrderInfo = {
  __typename: "Connection_ComputingPowerOrderInfo";
  edges?: Maybe<Array<Maybe<Edge_ComputingPowerOrderInfo>>>;
  pageInfo?: Maybe<PageInfo>;
};

export type Connection_CopilotSession = {
  __typename: "Connection_CopilotSession";
  edges?: Maybe<Array<Maybe<Edge_CopilotSession>>>;
  pageInfo?: Maybe<PageInfo>;
};

export type Connection_EditorComponent = {
  __typename: "Connection_EditorComponent";
  edges?: Maybe<Array<Maybe<Edge_EditorComponent>>>;
  pageInfo?: Maybe<PageInfo>;
};

export type Connection_InvoiceRequest = {
  __typename: "Connection_InvoiceRequest";
  edges?: Maybe<Array<Maybe<Edge_InvoiceRequest>>>;
  pageInfo?: Maybe<PageInfo>;
};

export type Connection_Message = {
  __typename: "Connection_Message";
  edges?: Maybe<Array<Maybe<Edge_Message>>>;
  pageInfo?: Maybe<PageInfo>;
};

export type Connection_MobileApp = {
  __typename: "Connection_MobileApp";
  edges?: Maybe<Array<Maybe<Edge_MobileApp>>>;
  pageInfo?: Maybe<PageInfo>;
};

export type Connection_Organization = {
  __typename: "Connection_Organization";
  edges?: Maybe<Array<Maybe<Edge_Organization>>>;
  pageInfo?: Maybe<PageInfo>;
};

export type Connection_Project = {
  __typename: "Connection_Project";
  edges?: Maybe<Array<Maybe<Edge_Project>>>;
  pageInfo?: Maybe<PageInfo>;
};

export type Connection_ProjectComment = {
  __typename: "Connection_ProjectComment";
  edges?: Maybe<Array<Maybe<Edge_ProjectComment>>>;
  pageInfo?: Maybe<PageInfo>;
};

export type Connection_ProjectTemplate = {
  __typename: "Connection_ProjectTemplate";
  edges?: Maybe<Array<Maybe<Edge_ProjectTemplate>>>;
  pageInfo?: Maybe<PageInfo>;
};

export type Connection_ProjectVersion = {
  __typename: "Connection_ProjectVersion";
  edges?: Maybe<Array<Maybe<Edge_ProjectVersion>>>;
  pageInfo?: Maybe<PageInfo>;
};

export type Connection_PurchaseOrder = {
  __typename: "Connection_PurchaseOrder";
  edges?: Maybe<Array<Maybe<Edge_PurchaseOrder>>>;
  pageInfo?: Maybe<PageInfo>;
};

export type Connection_StoredImage = {
  __typename: "Connection_StoredImage";
  edges?: Maybe<Array<Maybe<Edge_StoredImage>>>;
  pageInfo?: Maybe<PageInfo>;
};

export type Connection_WebApp = {
  __typename: "Connection_WebApp";
  edges?: Maybe<Array<Maybe<Edge_WebApp>>>;
  pageInfo?: Maybe<PageInfo>;
};

export type Connection_WechatMiniProgramApp = {
  __typename: "Connection_WechatMiniProgramApp";
  edges?: Maybe<Array<Maybe<Edge_WechatMiniProgramApp>>>;
  pageInfo?: Maybe<PageInfo>;
};

export enum ContactQrCodeType {
  Business = "BUSINESS",
  CustomerService = "CUSTOMER_SERVICE",
  Ecosystem = "ECOSYSTEM",
  FreeWechatGroup = "FREE_WECHAT_GROUP",
  PaidWechatGroup = "PAID_WECHAT_GROUP",
}

export type CopilotAiResponseMessage = CopilotContentMessage & {
  __typename: "CopilotAiResponseMessage";
  allowEvaluation: Scalars["Boolean"]["output"];
  content: Scalars["String"]["output"];
  messageType: CopilotMessageType;
};

export type CopilotArgsInput = {
  copilotMessageType: CopilotMessageType;
  feedbackMessage?: InputMaybe<CopilotFeedbackMessageInput>;
  humanInputMessage?: InputMaybe<CopilotHumanInputMessageInput>;
  humanOperationMessage?: InputMaybe<CopilotHumanOperationMessageInput>;
  stopMessage?: InputMaybe<CopilotStopMessageInput>;
  taskRevertSuccessMessage?: InputMaybe<CopilotTaskRevertSuccessMessageInput>;
  terminateMessage?: InputMaybe<CopilotTerminateMessageInput>;
  toolCallBatchExecErrorMessage?: InputMaybe<CopilotToolCallBatchExecErrorMessageInput>;
  toolCallBatchResponseMessage?: InputMaybe<CopilotToolCallBatchResponseMessageInput>;
};

export type CopilotContentMessage = {
  messageType: CopilotMessageType;
};

export type CopilotEditableTextMessage = CopilotContentMessage & {
  __typename: "CopilotEditableTextMessage";
  allowEvaluation: Scalars["Boolean"]["output"];
  content: Scalars["String"]["output"];
  messageType: CopilotMessageType;
  title?: Maybe<Scalars["String"]["output"]>;
};

export type CopilotError = {
  __typename: "CopilotError";
  content: Scalars["Json"]["output"];
  createdAt: Scalars["OffsetDateTime"]["output"];
  session: CopilotSession;
};

export type CopilotErrorMessage = CopilotContentMessage & {
  __typename: "CopilotErrorMessage";
  content: Scalars["String"]["output"];
  messageType: CopilotMessageType;
};

export type CopilotEvaluation = {
  __typename: "CopilotEvaluation";
  assessment?: Maybe<Assessment>;
  content?: Maybe<Scalars["String"]["output"]>;
  createdAt: Scalars["OffsetDateTime"]["output"];
  session: CopilotSession;
};

export type CopilotFeedbackMessage = CopilotContentMessage & {
  __typename: "CopilotFeedbackMessage";
  evaluatedMessageExId: Scalars["String"]["output"];
  feedbackCategory: FeedbackCategory;
  messageType: CopilotMessageType;
  optionalContent?: Maybe<Scalars["String"]["output"]>;
};

export type CopilotFeedbackMessageInput = {
  evaluatedMessageExId: Scalars["String"]["input"];
  feedbackCategory: FeedbackCategory;
  optionalContent?: InputMaybe<Scalars["String"]["input"]>;
};

export type CopilotHumanInputContext = {
  __typename: "CopilotHumanInputContext";
  tableNames?: Maybe<Array<Scalars["String"]["output"]>>;
  useLegacyTypeDefinition?: Maybe<Scalars["Boolean"]["output"]>;
};

export type CopilotHumanInputContextInput = {
  tableNames?: InputMaybe<Array<Scalars["String"]["input"]>>;
  useLegacyTypeDefinition?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type CopilotHumanInputMessage = CopilotContentMessage & {
  __typename: "CopilotHumanInputMessage";
  content: Scalars["String"]["output"];
  context?: Maybe<CopilotHumanInputContext>;
  messageType: CopilotMessageType;
};

export type CopilotHumanInputMessageInput = {
  content: Scalars["String"]["input"];
  context?: InputMaybe<CopilotHumanInputContextInput>;
};

export type CopilotHumanOperationMessage = CopilotContentMessage & {
  __typename: "CopilotHumanOperationMessage";
  humanOperationType: HumanOperationType;
  messageType: CopilotMessageType;
  optionalContent?: Maybe<Scalars["String"]["output"]>;
};

export type CopilotHumanOperationMessageInput = {
  humanOperationType: HumanOperationType;
  optionalContent?: InputMaybe<Scalars["String"]["input"]>;
};

export type CopilotInitialStateMessage = CopilotContentMessage & {
  __typename: "CopilotInitialStateMessage";
  copilotMessages: Array<CopilotMessage>;
  currentJobIsRunning: Scalars["Boolean"]["output"];
  messageType: CopilotMessageType;
  terminated?: Maybe<Scalars["Boolean"]["output"]>;
};

export type CopilotInput = {
  goldenSetId: Scalars["String"]["input"];
  userInputId: Scalars["String"]["input"];
};

export type CopilotLlmCall = {
  __typename: "CopilotLlmCall";
  content: Scalars["Json"]["output"];
  createdAt: Scalars["OffsetDateTime"]["output"];
  model: Scalars["String"]["output"];
  response: Scalars["Json"]["output"];
  session: CopilotSession;
  timeCost: Scalars["Int"]["output"];
  tokenCost: Scalars["Int"]["output"];
  tokenUsage?: Maybe<Scalars["Json"]["output"]>;
};

export type CopilotMessage = {
  __typename: "CopilotMessage";
  content: CopilotContentMessage;
  createdAt: Scalars["OffsetDateTime"]["output"];
  exId: Scalars["String"]["output"];
  session: CopilotSession;
  type: CopilotMessageType;
};

export enum CopilotMessageType {
  AiResponse = "AI_RESPONSE",
  EditableText = "EDITABLE_TEXT",
  Error = "ERROR",
  Feedback = "FEEDBACK",
  HumanInput = "HUMAN_INPUT",
  HumanOperation = "HUMAN_OPERATION",
  InitialState = "INITIAL_STATE",
  StateChange = "STATE_CHANGE",
  Stop = "STOP",
  SystemStatus = "SYSTEM_STATUS",
  Task = "TASK",
  TaskRevertSuccess = "TASK_REVERT_SUCCESS",
  Terminate = "TERMINATE",
  ToolCallBatch = "TOOL_CALL_BATCH",
  ToolCallBatchExecError = "TOOL_CALL_BATCH_EXEC_ERROR",
  ToolCallBatchResponse = "TOOL_CALL_BATCH_RESPONSE",
}

/**
 * A copilot output represents the expected or actual response from the copilot,
 * including performance metrics (latency, tokens, context usage).
 */
export type CopilotOutput = {
  __typename: "CopilotOutput";
  /** The copilot's generated output content */
  content: Scalars["String"]["output"];
  /** Timestamp when output was captured */
  createdAt: Scalars["String"]["output"];
  /** Parent golden set ID */
  goldenSetId: Scalars["String"]["output"];
  /** Unique identifier */
  id: Scalars["String"]["output"];
  /** Associated user input ID */
  userInputId: Scalars["String"]["output"];
};

export type CopilotSession = {
  __typename: "CopilotSession";
  createdAt: Scalars["OffsetDateTime"]["output"];
  errors: Array<CopilotError>;
  evaluations: Array<CopilotEvaluation>;
  llmCalls: Array<CopilotLlmCall>;
  messages: Array<CopilotMessage>;
  project: Project;
  sessionExId: Scalars["String"]["output"];
  terminated: Scalars["Boolean"]["output"];
  title?: Maybe<Scalars["String"]["output"]>;
  type?: Maybe<CopilotSessionType>;
  updatedAt: Scalars["OffsetDateTime"]["output"];
};

export enum CopilotSessionType {
  AfcodeTool = "AFCODE_TOOL",
  Copilot = "COPILOT",
  LogTool = "LOG_TOOL",
  SetDataBinding = "SET_DATA_BINDING",
}

export type CopilotStateChangeMessage = CopilotContentMessage & {
  __typename: "CopilotStateChangeMessage";
  currentJobIsRunning: Scalars["Boolean"]["output"];
  messageType: CopilotMessageType;
};

export type CopilotStopMessage = CopilotContentMessage & {
  __typename: "CopilotStopMessage";
  messageType: CopilotMessageType;
  reason?: Maybe<Scalars["String"]["output"]>;
};

export type CopilotStopMessageInput = {
  reason?: InputMaybe<Scalars["String"]["input"]>;
};

export type CopilotSystemStatusMessage = CopilotContentMessage & {
  __typename: "CopilotSystemStatusMessage";
  content: Scalars["String"]["output"];
  messageType: CopilotMessageType;
};

export type CopilotTaskMessage = CopilotContentMessage & {
  __typename: "CopilotTaskMessage";
  description?: Maybe<Scalars["String"]["output"]>;
  diff?: Maybe<Scalars["Json"]["output"]>;
  isDiffReverted?: Maybe<Scalars["Boolean"]["output"]>;
  messageType: CopilotMessageType;
  name: Scalars["String"]["output"];
  taskId: Scalars["String"]["output"];
};

export type CopilotTaskRevertSuccessMessage = CopilotContentMessage & {
  __typename: "CopilotTaskRevertSuccessMessage";
  messageType: CopilotMessageType;
  taskIds: Array<Maybe<Scalars["String"]["output"]>>;
};

export type CopilotTaskRevertSuccessMessageInput = {
  taskIds: Array<InputMaybe<Scalars["String"]["input"]>>;
};

export type CopilotTerminateMessage = CopilotContentMessage & {
  __typename: "CopilotTerminateMessage";
  messageType: CopilotMessageType;
  reason?: Maybe<Scalars["String"]["output"]>;
};

export type CopilotTerminateMessageInput = {
  reason?: InputMaybe<Scalars["String"]["input"]>;
};

export type CopilotToolCall = {
  __typename: "CopilotToolCall";
  args: Scalars["Map_String_JsonNodeScalar"]["output"];
  id: Scalars["String"]["output"];
  name: Scalars["String"]["output"];
};

export type CopilotToolCallBatchExecErrorContext = {
  __typename: "CopilotToolCallBatchExecErrorContext";
  lastPatchExId?: Maybe<Scalars["String"]["output"]>;
  result?: Maybe<Scalars["Json"]["output"]>;
  schemaExId: Scalars["String"]["output"];
  toolCalls: Scalars["Json"]["output"];
};

export type CopilotToolCallBatchExecErrorContextInput = {
  lastPatchExId?: InputMaybe<Scalars["String"]["input"]>;
  result?: InputMaybe<Scalars["Json"]["input"]>;
  schemaExId: Scalars["String"]["input"];
  toolCalls: Scalars["Json"]["input"];
};

export type CopilotToolCallBatchExecErrorMessage = CopilotContentMessage & {
  __typename: "CopilotToolCallBatchExecErrorMessage";
  context?: Maybe<CopilotToolCallBatchExecErrorContext>;
  error?: Maybe<Scalars["String"]["output"]>;
  messageType: CopilotMessageType;
  toolCallBatchId: Scalars["String"]["output"];
};

export type CopilotToolCallBatchExecErrorMessageInput = {
  context?: InputMaybe<CopilotToolCallBatchExecErrorContextInput>;
  error?: InputMaybe<Scalars["String"]["input"]>;
  toolCallBatchId: Scalars["String"]["input"];
};

export type CopilotToolCallBatchMessage = CopilotContentMessage & {
  __typename: "CopilotToolCallBatchMessage";
  messageType: CopilotMessageType;
  toolCallBatchId: Scalars["String"]["output"];
  toolCalls: Array<CopilotToolCall>;
};

export type CopilotToolCallBatchResponseMessage = CopilotContentMessage & {
  __typename: "CopilotToolCallBatchResponseMessage";
  messageType: CopilotMessageType;
  responseByToolCallId: Scalars["Map_String_StringScalar"]["output"];
  schemaDiff?: Maybe<Scalars["Json"]["output"]>;
  toolCallBatchId: Scalars["String"]["output"];
};

export type CopilotToolCallBatchResponseMessageInput = {
  responseByToolCallId: Scalars["Map_String_StringScalar"]["input"];
  schemaDiff?: InputMaybe<Scalars["Json"]["input"]>;
  toolCallBatchId: Scalars["String"]["input"];
};

/** Type of AI Copilot being evaluated. */
export enum CopilotType {
  /** Workflow builder for action flows */
  ActionFlowBuilder = "actionFlowBuilder",
  /** General agent builder */
  AgentBuilder = "agentBuilder",
  /** Data model builder for database schema generation */
  DataModelBuilder = "dataModelBuilder",
  /** Log analysis assistant */
  LogAnalyzer = "logAnalyzer",
  /** UI component builder for frontend development */
  UiBuilder = "uiBuilder",
}

export type CountByCategory = {
  __typename: "CountByCategory";
  category: Category;
  count: Scalars["Int"]["output"];
};

export type Country = {
  __typename: "Country";
  chineseGroup?: Maybe<Scalars["String"]["output"]>;
  chineseName?: Maybe<Scalars["String"]["output"]>;
  englishName?: Maybe<Scalars["String"]["output"]>;
  phoneAreaCode?: Maybe<Scalars["String"]["output"]>;
};

export type CouponAndOrderDetail = {
  __typename: "CouponAndOrderDetail";
  coupon: AccountHasCoupon;
  orderPrice: Scalars["BigDecimal"]["output"];
};

export type CouponGroup = {
  __typename: "CouponGroup";
  createdAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  description?: Maybe<Scalars["String"]["output"]>;
  exId: Scalars["String"]["output"];
  updatedAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
};

export type CouponGroupDtoInput = {
  description: Scalars["String"]["input"];
  items: Array<InputMaybe<CouponGroupItemDtoInput>>;
};

export type CouponGroupItemDtoInput = {
  amount: Scalars["Long"]["input"];
  couponTemplateExId: Scalars["String"]["input"];
};

export enum CouponStatus {
  Expired = "EXPIRED",
  Normal = "NORMAL",
  NotStarted = "NOT_STARTED",
  UsedUp = "USED_UP",
}

export type CouponTemplate = {
  __typename: "CouponTemplate";
  applicablePlans?: Maybe<Array<PlanType>>;
  applicableProductTypeDetails?: Maybe<Array<ProductTypeDetail>>;
  applicableProjectPlans?: Maybe<Array<ProjectPlanType>>;
  chineseName?: Maybe<Scalars["String"]["output"]>;
  createdAt: Scalars["OffsetDateTime"]["output"];
  discountAmount: Scalars["BigDecimal"]["output"];
  discountType: DiscountType;
  effectiveAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  englishName?: Maybe<Scalars["String"]["output"]>;
  exId: Scalars["String"]["output"];
  expireAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  minimumOrderAmount?: Maybe<Scalars["BigDecimal"]["output"]>;
  minimumProjectCreationTime?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  updatedAt: Scalars["OffsetDateTime"]["output"];
  validityPeriod?: Maybe<Scalars["Period"]["output"]>;
};

export type CouponTemplateDtoInput = {
  applicablePlans?: InputMaybe<Array<InputMaybe<PlanType>>>;
  applicableProductTypeDetails?: InputMaybe<ProductTypeDetailsDtoInput>;
  applicableProjectPlans?: InputMaybe<Array<InputMaybe<ProjectPlanType>>>;
  chineseName?: InputMaybe<Scalars["String"]["input"]>;
  discountAmount: Scalars["BigDecimal"]["input"];
  discountType: DiscountType;
  effectiveAt?: InputMaybe<Scalars["OffsetDateTime"]["input"]>;
  englishName?: InputMaybe<Scalars["String"]["input"]>;
  expireAt?: InputMaybe<Scalars["OffsetDateTime"]["input"]>;
  minimumOrderAmount?: InputMaybe<Scalars["BigDecimal"]["input"]>;
  minimumProjectCreationTime?: InputMaybe<Scalars["OffsetDateTime"]["input"]>;
  validityPeriod?: InputMaybe<Scalars["Period"]["input"]>;
};

export type CrdtSchema = {
  __typename: "CrdtSchema";
  crdtModelUrl?: Maybe<Scalars["String"]["output"]>;
  crdtPatches?: Maybe<SchemaCrdtPatches>;
  createdAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  exId?: Maybe<Scalars["String"]["output"]>;
};

export type CreateAppDetail = {
  __typename: "CreateAppDetail";
  appId?: Maybe<Scalars["Long"]["output"]>;
  appName?: Maybe<Scalars["String"]["output"]>;
  appType?: Maybe<AppType>;
  creationSourceDetail?: Maybe<AppCreationSourceDetail>;
};

export type CreateAppFromClonedAppInputInput = {
  appExId: Scalars["String"]["input"];
};

export type CreateAppFromClonedSchemaInputInput = {
  schemaExId: Scalars["String"]["input"];
};

export type CreateAppInputInput = {
  appName: Scalars["String"]["input"];
  appType: AppType;
  source: AppCreationSourceInputInput;
};

export type CreateClonedMultiClientProjectDetailInput = {
  copyData?: InputMaybe<Scalars["Boolean"]["input"]>;
  createProjectDetail: CreateProjectDetailInput;
  sourceProjectExId: Scalars["String"]["input"];
  sourceWebAppExIds: Array<Scalars["String"]["input"]>;
};

export type CreateClonedProjectDetailInput = {
  copyData?: InputMaybe<Scalars["Boolean"]["input"]>;
  createProjectDetail: CreateProjectDetailInput;
  schemaExId?: InputMaybe<Scalars["String"]["input"]>;
  sourceProjectExId?: InputMaybe<Scalars["String"]["input"]>;
};

export type CreateProjectDetail = {
  __typename: "CreateProjectDetail";
  category?: Maybe<ProjectContentCategory>;
  organizationId: Scalars["Long"]["output"];
  projectCreationSourceDetail?: Maybe<ProjectCreationSourceDetail>;
  projectName?: Maybe<Scalars["String"]["output"]>;
  projectSpaceType?: Maybe<ProjectSpaceType>;
};

export type CreateProjectDetailInput = {
  category: ProjectContentCategory;
  organizationExId: Scalars["String"]["input"];
  projectName: Scalars["String"]["input"];
  projectSpaceType: ProjectSpaceType;
};

export type CreateProjectFromClonedProjectInputInput = {
  copyData: Scalars["Boolean"]["input"];
  projectExId?: InputMaybe<Scalars["String"]["input"]>;
};

export type CreateProjectFromClonedSchemaInputInput = {
  copyData: Scalars["Boolean"]["input"];
  schemaExId: Scalars["String"]["input"];
};

export type CreateProjectFromTemplateDetailInput = {
  createProjectDetail: CreateProjectDetailInput;
  templateExId: Scalars["String"]["input"];
};

export type CreateProjectFromTemplateInputInput = {
  templateExId: Scalars["String"]["input"];
};

export type CreateProjectInputInput = {
  category: ProjectContentCategory;
  organizationExId: Scalars["String"]["input"];
  projectName: Scalars["String"]["input"];
  projectSpaceType: ProjectSpaceType;
  source: ProjectCreationSourceInputInput;
};

export type Criteria = {
  __typename: "Criteria";
  content: Scalars["String"]["output"];
  expectation: Scalars["Boolean"]["output"];
  id: Scalars["String"]["output"];
  reasoning?: Maybe<Scalars["String"]["output"]>;
  rubricId: Scalars["String"]["output"];
  weight: Scalars["Float"]["output"];
};

export type CropOptionInput = {
  height?: InputMaybe<Scalars["Int"]["input"]>;
  offsetX?: InputMaybe<Scalars["Int"]["input"]>;
  offsetY?: InputMaybe<Scalars["Int"]["input"]>;
  width?: InputMaybe<Scalars["Int"]["input"]>;
};

export enum Currency {
  Cad = "CAD",
  Cny = "CNY",
  Eur = "EUR",
  Usd = "USD",
}

export type CustoDomainCnameRecord = {
  __typename: "CustoDomainCnameRecord";
  hostRecord?: Maybe<Scalars["String"]["output"]>;
  record?: Maybe<Scalars["String"]["output"]>;
};

export type CustomComponent = {
  __typename: "CustomComponent";
  allCustomComponentItems?: Maybe<Array<CustomComponentItems>>;
  allPublishedCustomComponentItems?: Maybe<Array<CustomComponentItems>>;
  archived: Scalars["Boolean"]["output"];
  countOfItems: Scalars["Int"]["output"];
  createdAt: Scalars["OffsetDateTime"]["output"];
  exId: Scalars["String"]["output"];
  metadata?: Maybe<Array<Maybe<Scalars["Json"]["output"]>>>;
  name?: Maybe<Scalars["String"]["output"]>;
  repoUrl?: Maybe<Scalars["String"]["output"]>;
  status: BuildStatus;
  tag?: Maybe<Scalars["String"]["output"]>;
  tags?: Maybe<Array<Maybe<Scalars["String"]["output"]>>>;
};

export type CustomComponentMetadataArgs = {
  tag?: InputMaybe<Scalars["String"]["input"]>;
};

export type CustomComponentItemParameter = {
  __typename: "CustomComponentItemParameter";
  createdAt: Scalars["OffsetDateTime"]["output"];
  fieldName?: Maybe<Scalars["String"]["output"]>;
  type?: Maybe<CustomComponentItemParameterType>;
};

export enum CustomComponentItemParameterType {
  Array = "ARRAY",
  Boolean = "BOOLEAN",
  Float8 = "FLOAT8",
  Image = "IMAGE",
  Integer = "INTEGER",
  Object = "OBJECT",
  Text = "TEXT",
}

export type CustomComponentItems = {
  __typename: "CustomComponentItems";
  coverImageId: Scalars["Long"]["output"];
  createdAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  customComponentExId: Scalars["String"]["output"];
  description?: Maybe<Scalars["String"]["output"]>;
  exId: Scalars["String"]["output"];
  imageExId: Scalars["String"]["output"];
  inputParameters?: Maybe<Array<Maybe<CustomComponentItemParameter>>>;
  name?: Maybe<Scalars["String"]["output"]>;
  published: Scalars["Boolean"]["output"];
};

export type CustomComponentPresignUrlInputInput = {
  fileKey?: InputMaybe<Scalars["String"]["input"]>;
  md5Base64?: InputMaybe<Scalars["String"]["input"]>;
};

export type CustomDomain = {
  __typename: "CustomDomain";
  certificationVerificationRecord?: Maybe<DnsRecord>;
  certificationVerified: Scalars["Boolean"]["output"];
  createdAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  defaultDomain: Scalars["Boolean"]["output"];
  domain?: Maybe<Scalars["String"]["output"]>;
  exId: Scalars["String"]["output"];
  favicon?: Maybe<Scalars["String"]["output"]>;
  hostOwnershipVerificationRecord?: Maybe<DnsRecord>;
  hostOwnershipVerified: Scalars["Boolean"]["output"];
  icpInfo?: Maybe<IcpInfo>;
  icpVerified: Scalars["Boolean"]["output"];
  proxyVerificationRecord?: Maybe<DnsRecord>;
  proxyVerified: Scalars["Boolean"]["output"];
  status?: Maybe<CustomDomainStatus>;
  updatedAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
};

export enum CustomDomainConfigStatus {
  CnameFailed = "CNAME_FAILED",
  Processing = "PROCESSING",
  Succeeded = "SUCCEEDED",
  Timeout = "TIMEOUT",
}

export enum CustomDomainStatus {
  Active = "ACTIVE",
  Creating = "CREATING",
  CreatingCert = "CREATING_CERT",
  Deleted = "DELETED",
  Pending = "PENDING",
  Reconfigure = "RECONFIGURE",
}

export type CustomView = {
  __typename: "CustomView";
  config?: Maybe<Scalars["Json"]["output"]>;
  createdAt: Scalars["OffsetDateTime"]["output"];
  exId?: Maybe<Scalars["String"]["output"]>;
  name: Scalars["String"]["output"];
};

export enum Cycle {
  Daily = "DAILY",
  Monthly = "MONTHLY",
  Yearly = "YEARLY",
}

export type DataVisualizer = {
  __typename: "DataVisualizer";
  admin: Scalars["Boolean"]["output"];
  collaboratorType: CollaboratorType;
  collaboratorsAndType?: Maybe<Array<AccountAndCollaborateType>>;
  config?: Maybe<DataVisualizerConfig>;
  createdAt: Scalars["OffsetDateTime"]["output"];
  customViews: Array<CustomView>;
  deployedDataModel: Scalars["Json"]["output"];
  displayNameConfig: Scalars["Json"]["output"];
  exId: Scalars["String"]["output"];
  name: Scalars["String"]["output"];
  projectVersionId?: Maybe<Scalars["Long"]["output"]>;
  roleConfigUniqueId: Scalars["UUID"]["output"];
  tablePermissionById: Scalars["Map_String_TablePermissionScalar"]["output"];
  token?: Maybe<Scalars["String"]["output"]>;
  types: Scalars["Json"]["output"];
  zeroSubscriptionUrl?: Maybe<Scalars["String"]["output"]>;
  zeroUrl?: Maybe<Scalars["String"]["output"]>;
};

export type DataVisualizerConfig = {
  __typename: "DataVisualizerConfig";
  authenticationConfig?: Maybe<Scalars["Json"]["output"]>;
  editorConfiguration?: Maybe<Scalars["Json"]["output"]>;
  types?: Maybe<Scalars["Json"]["output"]>;
};

export type DataVisualizerUploadEnd = DataVisualizerUploadNotification & {
  __typename: "DataVisualizerUploadEnd";
  dataVisualizers?: Maybe<Array<Maybe<DataVisualizer>>>;
  projectId: Scalars["Long"]["output"];
};

export type DataVisualizerUploadFailed = DataVisualizerUploadNotification & {
  __typename: "DataVisualizerUploadFailed";
  message?: Maybe<Scalars["String"]["output"]>;
  projectId: Scalars["Long"]["output"];
};

export type DataVisualizerUploadNotification = {
  projectId: Scalars["Long"]["output"];
};

export type DataVisualizerUploadStart = DataVisualizerUploadNotification & {
  __typename: "DataVisualizerUploadStart";
  projectId: Scalars["Long"]["output"];
};

export enum Department {
  Backend = "BACKEND",
  Codegen = "CODEGEN",
  FrontEnd = "FRONT_END",
  Ops = "OPS",
  PostSale = "POST_SALE",
}

export type DeploymentEnvConfig = {
  __typename: "DeploymentEnvConfig";
  /** backend only query */
  cloudConfiguration?: Maybe<CloudConfiguration>;
  deployable?: Maybe<Scalars["Boolean"]["output"]>;
  deploymentEnvConfigId?: Maybe<Scalars["Long"]["output"]>;
  deploymentStatus?: Maybe<DeploymentEventStatus>;
  exId: Scalars["String"]["output"];
  lastAllPipelinePlatformStatus: Array<Maybe<PipelinePlatformAndStatus>>;
  lastDeployedProjectConfig?: Maybe<ProjectConfig>;
  lastDeploymentRecordByBuildTarget: Array<
    Maybe<BuildTargetAndDeploymentRecord>
  >;
  status?: Maybe<DeploymentEnvStatus>;
  userDeploymentEnvironment?: Maybe<UserDeploymentEnvironment>;
  wechatOrderListPagePath?: Maybe<Scalars["String"]["output"]>;
};

export enum DeploymentEnvStatus {
  ActivateFailed = "ACTIVATE_FAILED",
  ActivatingInCurrentZiroom = "ACTIVATING_IN_CURRENT_ZIROOM",
  ActivatingToAnotherZiroom = "ACTIVATING_TO_ANOTHER_ZIROOM",
  Archived = "ARCHIVED",
  ArchiveFailed = "ARCHIVE_FAILED",
  Archiving = "ARCHIVING",
  Canceled = "CANCELED",
  Created = "CREATED",
  Deleted = "DELETED",
  Deployed = "DEPLOYED",
  Deploying = "DEPLOYING",
  Failed = "FAILED",
  InHibernation = "IN_HIBERNATION",
  Registered = "REGISTERED",
  Registering = "REGISTERING",
  RegisterFailed = "REGISTER_FAILED",
  RestoreFailed = "RESTORE_FAILED",
  Restoring = "RESTORING",
}

export enum DeploymentErrorType {
  ActionFlowExceedLimit = "ACTION_FLOW_EXCEED_LIMIT",
  AnotherAppIsDeploying = "ANOTHER_APP_IS_DEPLOYING",
  CannotDeployAnOlderSchema = "CANNOT_DEPLOY_AN_OLDER_SCHEMA",
  DbError = "DB_ERROR",
  DbUpgrading = "DB_UPGRADING",
  DeployError = "DEPLOY_ERROR",
  EnvConfigNotInitialized = "ENV_CONFIG_NOT_INITIALIZED",
  GetDeploymentRecordFailed = "GET_DEPLOYMENT_RECORD_FAILED",
  InitError = "INIT_ERROR",
  MigrationError = "MIGRATION_ERROR",
  MobileSchemaDoesNotBelongToMobileApp = "MOBILE_SCHEMA_DOES_NOT_BELONG_TO_MOBILE_APP",
  NotReadyToBeMigratedToZiroom = "NOT_READY_TO_BE_MIGRATED_TO_ZIROOM",
  PaymentExceedLimit = "PAYMENT_EXCEED_LIMIT",
  PipelinePlatformNotSupported = "PIPELINE_PLATFORM_NOT_SUPPORTED",
  ProjectAlreadyDeployedOnZiroomServer = "PROJECT_ALREADY_DEPLOYED_ON_ZIROOM_SERVER",
  ProjectEnvConfigSyncError = "PROJECT_ENV_CONFIG_SYNC_ERROR",
  ProjectIsNotDeployedOnZiroomServer = "PROJECT_IS_NOT_DEPLOYED_ON_ZIROOM_SERVER",
  ProjectNotDeployedAtOnce = "PROJECT_NOT_DEPLOYED_AT_ONCE",
  ProjectNotInitialized = "PROJECT_NOT_INITIALIZED",
  SchemaIdIsNotLatest = "SCHEMA_ID_IS_NOT_LATEST",
  SupersetInitFailed = "SUPERSET_INIT_FAILED",
  TpaExceedLimit = "TPA_EXCEED_LIMIT",
  UatEnvConfigNotInitialized = "UAT_ENV_CONFIG_NOT_INITIALIZED",
  UnexpectedDeploymentTask = "UNEXPECTED_DEPLOYMENT_TASK",
  UnexpectedDynamicApiConfig = "UNEXPECTED_DYNAMIC_API_CONFIG",
  UnknownDeploymentStrategyType = "UNKNOWN_DEPLOYMENT_STRATEGY_TYPE",
  WebSchemaDoesNotBelongToWebapp = "WEB_SCHEMA_DOES_NOT_BELONG_TO_WEBAPP",
  WechatAppIdAndSecretRequired = "WECHAT_APP_ID_AND_SECRET_REQUIRED",
  WechatSchemaDoesNotBelongToWechatApp = "WECHAT_SCHEMA_DOES_NOT_BELONG_TO_WECHAT_APP",
  WechatSourceSizeExceedsLimit = "WECHAT_SOURCE_SIZE_EXCEEDS_LIMIT",
  WechatSystemIsBusy = "WECHAT_SYSTEM_IS_BUSY",
  ZaiExceedLimit = "ZAI_EXCEED_LIMIT",
}

export type DeploymentEvent = {
  __typename: "DeploymentEvent";
  createdAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  deploymentEnvConfigId: Scalars["Long"]["output"];
  details?: Maybe<Scalars["Json"]["output"]>;
  projectId: Scalars["Long"]["output"];
  schemaId: Scalars["Long"]["output"];
  status?: Maybe<DeploymentEventStatus>;
  updatedAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
};

export enum DeploymentEventStatus {
  AndroidFailed = "ANDROID_FAILED",
  BuildAndroid = "BUILD_ANDROID",
  BuildAndroidFailed = "BUILD_ANDROID_FAILED",
  BuildIos = "BUILD_IOS",
  BuildIosFailed = "BUILD_IOS_FAILED",
  BuildWechat = "BUILD_WECHAT",
  BuildWechatFailed = "BUILD_WECHAT_FAILED",
  BuildZvmWechat = "BUILD_ZVM_WECHAT",
  BuildZvmWechatFailed = "BUILD_ZVM_WECHAT_FAILED",
  CompilingTaro = "COMPILING_TARO",
  CompilingWechat = "COMPILING_WECHAT",
  CompilingWechatFailed = "COMPILING_WECHAT_FAILED",
  CompilingZvmTaro = "COMPILING_ZVM_TARO",
  CompilingZvmWechat = "COMPILING_ZVM_WECHAT",
  CompilingZvmWechatFailed = "COMPILING_ZVM_WECHAT_FAILED",
  Deploying = "DEPLOYING",
  DeployFailed = "DEPLOY_FAILED",
  DeploySupportServiceComplete = "DEPLOY_SUPPORT_SERVICE_COMPLETE",
  Failed = "FAILED",
  Generating = "GENERATING",
  GenAndroid = "GEN_ANDROID",
  GenAndroidFailed = "GEN_ANDROID_FAILED",
  GenIos = "GEN_IOS",
  GenIosFailed = "GEN_IOS_FAILED",
  GenTaro = "GEN_TARO",
  GenWechat = "GEN_WECHAT",
  GenWechatFailed = "GEN_WECHAT_FAILED",
  GenZvmTaro = "GEN_ZVM_TARO",
  GenZvmWechat = "GEN_ZVM_WECHAT",
  GenZvmWechatFailed = "GEN_ZVM_WECHAT_FAILED",
  Initializing = "INITIALIZING",
  InitialComplete = "INITIAL_COMPLETE",
  InitialFailed = "INITIAL_FAILED",
  IosFailed = "IOS_FAILED",
  Migrating = "MIGRATING",
  PackageAllComplete = "PACKAGE_ALL_COMPLETE",
  PackageAndroidComplete = "PACKAGE_ANDROID_COMPLETE",
  PackageIosComplete = "PACKAGE_IOS_COMPLETE",
  PackageWebZvmBetaComplete = "PACKAGE_WEB_ZVM_BETA_COMPLETE",
  PackageWebZvmProdComplete = "PACKAGE_WEB_ZVM_PROD_COMPLETE",
  PackageWechatMiniprogramComplete = "PACKAGE_WECHAT_MINIPROGRAM_COMPLETE",
  PackageWechatMiniprogramZvmComplete = "PACKAGE_WECHAT_MINIPROGRAM_ZVM_COMPLETE",
  PackagingWechatMiniprogram = "PACKAGING_WECHAT_MINIPROGRAM",
  PackagingWechatMiniprogramZvm = "PACKAGING_WECHAT_MINIPROGRAM_ZVM",
  SupportServiceFailed = "SUPPORT_SERVICE_FAILED",
  UnexpectedError = "UNEXPECTED_ERROR",
  Validating = "VALIDATING",
  ValidationFailed = "VALIDATION_FAILED",
  WebZvmBetaCanceled = "WEB_ZVM_BETA_CANCELED",
  WebZvmBetaFailed = "WEB_ZVM_BETA_FAILED",
  WebZvmBetaInProgress = "WEB_ZVM_BETA_IN_PROGRESS",
  WebZvmProdCanceled = "WEB_ZVM_PROD_CANCELED",
  WebZvmProdFailed = "WEB_ZVM_PROD_FAILED",
  WebZvmProdInProgress = "WEB_ZVM_PROD_IN_PROGRESS",
  WechatCanceled = "WECHAT_CANCELED",
  WechatMiniprogramFailed = "WECHAT_MINIPROGRAM_FAILED",
  WechatMiniprogramZvmFailed = "WECHAT_MINIPROGRAM_ZVM_FAILED",
  WechatTemplateMiniprogramIdObtained = "WECHAT_TEMPLATE_MINIPROGRAM_ID_OBTAINED",
  ZvmWechatCanceled = "ZVM_WECHAT_CANCELED",
  ZvmWechatTemplateMiniprogramIdObtained = "ZVM_WECHAT_TEMPLATE_MINIPROGRAM_ID_OBTAINED",
}

export type DeploymentOutput = DeploymentErrorLog & {
  __typename: "DeploymentOutput";
  createdAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  deploymentErrorType?: Maybe<DeploymentErrorType>;
  errorType?: Maybe<ErrorType>;
  log?: Maybe<Scalars["String"]["output"]>;
  status?: Maybe<DeploymentEventStatus>;
};

export type DeploymentRecord = {
  __typename: "DeploymentRecord";
  buildTargetFinished: Scalars["Boolean"]["output"];
  buildTargetsStatus?: Maybe<
    Scalars["Map_BuildTarget_BuildTargetStatusScalar"]["output"]
  >;
  createdAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  deploymentEnvConfig: DeploymentEnvConfig;
  deploymentEvents: Array<DeploymentEvent>;
  deploymentFinished: Scalars["Boolean"]["output"];
  exId: Scalars["String"]["output"];
  mobileWebPathConfigByFileName?: Maybe<
    Scalars["Map_String_StringScalar"]["output"]
  >;
  pipelinePlatforms?: Maybe<Array<Maybe<BuildTarget>>>;
  status?: Maybe<DeploymentRecordStatus>;
  updatedAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  webPathConfigByFileName?: Maybe<Scalars["Map_String_StringScalar"]["output"]>;
};

export type DeploymentRecordBuildTargetFinishedArgs = {
  buildTarget?: InputMaybe<BuildTarget>;
};

export enum DeploymentRecordStatus {
  Canceled = "CANCELED",
  Deploying = "DEPLOYING",
  Failed = "FAILED",
  Finished = "FINISHED",
  Pending = "PENDING",
}

export enum DevEnvironmentStatus {
  Creating = "CREATING",
  Deleted = "DELETED",
  Failed = "FAILED",
  Finished = "FINISHED",
  Initialized = "INITIALIZED",
  NotStarted = "NOT_STARTED",
}

export enum DiscountType {
  FixedAmountDiscount = "FIXED_AMOUNT_DISCOUNT",
  PercentageDiscount = "PERCENTAGE_DISCOUNT",
}

export type DnsInputInput = {
  accessKey?: InputMaybe<Scalars["String"]["input"]>;
  accessSecret?: InputMaybe<Scalars["String"]["input"]>;
  dnsProvider?: InputMaybe<DnsProvider>;
  domain?: InputMaybe<Scalars["String"]["input"]>;
  hostedZoneId?: InputMaybe<Scalars["String"]["input"]>;
  regionId?: InputMaybe<Scalars["String"]["input"]>;
  value?: InputMaybe<Scalars["String"]["input"]>;
};

export enum DnsProvider {
  Aliyun = "ALIYUN",
  Aws = "AWS",
}

export type DnsRecord = {
  __typename: "DnsRecord";
  record?: Maybe<Scalars["String"]["output"]>;
  type?: Maybe<DnsType>;
  value?: Maybe<Scalars["String"]["output"]>;
};

export enum DnsType {
  A = "A",
  Cname = "CNAME",
  Txt = "TXT",
}

export type DynamicMessageContent = {
  type?: Maybe<DynamicMessageContentType>;
};

export enum DynamicMessageContentType {
  ProjectPlanExpiration = "PROJECT_PLAN_EXPIRATION",
}

export type EdgeServiceConfiguration = {
  __typename: "EdgeServiceConfiguration";
  accessKey?: Maybe<Scalars["String"]["output"]>;
  accessSecret?: Maybe<Scalars["String"]["output"]>;
  bucket?: Maybe<Scalars["String"]["output"]>;
  edgeKvName?: Maybe<Scalars["String"]["output"]>;
  edgeScriptName?: Maybe<Scalars["String"]["output"]>;
  endpoint?: Maybe<Scalars["String"]["output"]>;
  provider?: Maybe<CloudProvider>;
  region?: Maybe<Scalars["String"]["output"]>;
};

export type Edge_Account = {
  __typename: "Edge_Account";
  cursor?: Maybe<ConnectionCursor>;
  node?: Maybe<Account>;
};

export type Edge_AccountAndCollaborateType = {
  __typename: "Edge_AccountAndCollaborateType";
  cursor?: Maybe<ConnectionCursor>;
  node?: Maybe<AccountAndCollaborateType>;
};

export type Edge_AccountHasCoupon = {
  __typename: "Edge_AccountHasCoupon";
  cursor?: Maybe<ConnectionCursor>;
  node?: Maybe<AccountHasCoupon>;
};

export type Edge_AccountTemplate = {
  __typename: "Edge_AccountTemplate";
  cursor?: Maybe<ConnectionCursor>;
  node: AccountTemplate;
};

export type Edge_App = {
  __typename: "Edge_App";
  cursor?: Maybe<ConnectionCursor>;
  node?: Maybe<App>;
};

export type Edge_BalanceTransactionRecord = {
  __typename: "Edge_BalanceTransactionRecord";
  cursor?: Maybe<ConnectionCursor>;
  node: BalanceTransactionRecord;
};

export type Edge_BannerItem = {
  __typename: "Edge_BannerItem";
  cursor?: Maybe<ConnectionCursor>;
  node?: Maybe<BannerItem>;
};

export type Edge_ComputingPowerOrderInfo = {
  __typename: "Edge_ComputingPowerOrderInfo";
  cursor?: Maybe<ConnectionCursor>;
  node?: Maybe<ComputingPowerOrderInfo>;
};

export type Edge_CopilotSession = {
  __typename: "Edge_CopilotSession";
  cursor?: Maybe<ConnectionCursor>;
  node: CopilotSession;
};

export type Edge_EditorComponent = {
  __typename: "Edge_EditorComponent";
  cursor?: Maybe<ConnectionCursor>;
  node?: Maybe<EditorComponent>;
};

export type Edge_InvoiceRequest = {
  __typename: "Edge_InvoiceRequest";
  cursor?: Maybe<ConnectionCursor>;
  node?: Maybe<InvoiceRequest>;
};

export type Edge_Message = {
  __typename: "Edge_Message";
  cursor?: Maybe<ConnectionCursor>;
  node: Message;
};

export type Edge_MobileApp = {
  __typename: "Edge_MobileApp";
  cursor?: Maybe<ConnectionCursor>;
  node?: Maybe<MobileApp>;
};

export type Edge_Organization = {
  __typename: "Edge_Organization";
  cursor?: Maybe<ConnectionCursor>;
  node?: Maybe<Organization>;
};

export type Edge_Project = {
  __typename: "Edge_Project";
  cursor?: Maybe<ConnectionCursor>;
  node?: Maybe<Project>;
};

export type Edge_ProjectComment = {
  __typename: "Edge_ProjectComment";
  cursor?: Maybe<ConnectionCursor>;
  node: ProjectComment;
};

export type Edge_ProjectTemplate = {
  __typename: "Edge_ProjectTemplate";
  cursor?: Maybe<ConnectionCursor>;
  node: ProjectTemplate;
};

export type Edge_ProjectVersion = {
  __typename: "Edge_ProjectVersion";
  cursor?: Maybe<ConnectionCursor>;
  node?: Maybe<ProjectVersion>;
};

export type Edge_PurchaseOrder = {
  __typename: "Edge_PurchaseOrder";
  cursor?: Maybe<ConnectionCursor>;
  node?: Maybe<PurchaseOrder>;
};

export type Edge_StoredImage = {
  __typename: "Edge_StoredImage";
  cursor?: Maybe<ConnectionCursor>;
  node?: Maybe<StoredImage>;
};

export type Edge_WebApp = {
  __typename: "Edge_WebApp";
  cursor?: Maybe<ConnectionCursor>;
  node?: Maybe<WebApp>;
};

export type Edge_WechatMiniProgramApp = {
  __typename: "Edge_WechatMiniProgramApp";
  cursor?: Maybe<ConnectionCursor>;
  node?: Maybe<WechatMiniProgramApp>;
};

export type EditorComponent = {
  __typename: "EditorComponent";
  MRefMap?: Maybe<Scalars["Json"]["output"]>;
  coverImageExId?: Maybe<Scalars["String"]["output"]>;
  createdAt: Scalars["OffsetDateTime"]["output"];
  description: Scalars["String"]["output"];
  exId: Scalars["String"]["output"];
  name: Scalars["String"]["output"];
  platforms: Array<Maybe<Platform>>;
  rootMRef: Scalars["String"]["output"];
  updatedAt: Scalars["OffsetDateTime"]["output"];
  zedVersion: Scalars["String"]["output"];
};

export type EducationDiscountAndInstitution = {
  __typename: "EducationDiscountAndInstitution";
  discount?: Maybe<Scalars["BigDecimal"]["output"]>;
  educationDiscountExId?: Maybe<Scalars["String"]["output"]>;
  expiredAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  institutionName?: Maybe<Scalars["String"]["output"]>;
  notificationRead: Scalars["Boolean"]["output"];
  qrcode?: Maybe<Scalars["String"]["output"]>;
  role?: Maybe<EducationalInstitutionRole>;
};

export type EducationalDiscountAndAccount = {
  __typename: "EducationalDiscountAndAccount";
  createdAt: Scalars["OffsetDateTime"]["output"];
  discount?: Maybe<Scalars["BigDecimal"]["output"]>;
  educationalInstitutionId?: Maybe<Scalars["Long"]["output"]>;
  expiredAt: Scalars["OffsetDateTime"]["output"];
  role?: Maybe<EducationalInstitutionRole>;
  updatedAt: Scalars["OffsetDateTime"]["output"];
};

export enum EducationalInstitutionRole {
  Employee = "EMPLOYEE",
  Student = "STUDENT",
}

export type EmailAuthConfig = {
  __typename: "EmailAuthConfig";
  enabled: Scalars["Boolean"]["output"];
  expirationDuration?: Maybe<Scalars["Long"]["output"]>;
};

export type EmailConfig = {
  __typename: "EmailConfig";
  emailPassword?: Maybe<Scalars["String"]["output"]>;
  emailProvider?: Maybe<EmailProvider>;
  emailSender?: Maybe<Scalars["String"]["output"]>;
};

export type EmailConfigInput = {
  emailPassword?: InputMaybe<Scalars["String"]["input"]>;
  emailProvider?: InputMaybe<EmailProvider>;
  emailSender?: InputMaybe<Scalars["String"]["input"]>;
};

export enum EmailProvider {
  Empty = "EMPTY",
  FeiShu = "FEI_SHU",
  Gmail = "GMAIL",
  Qq = "QQ",
  QqEx = "QQ_EX",
}

export type Employee = {
  __typename: "Employee";
  department?: Maybe<Department>;
  feishuUserId?: Maybe<Scalars["String"]["output"]>;
  id?: Maybe<Scalars["Long"]["output"]>;
  name?: Maybe<Scalars["String"]["output"]>;
  status?: Maybe<EmployeeStatus>;
};

export enum EmployeeStatus {
  Normal = "NORMAL",
  OnCall = "ON_CALL",
}

export enum EnvMergeErrorType {
  CopyConfigError = "COPY_CONFIG_ERROR",
  ValidationError = "VALIDATION_ERROR",
}

export type EnvMergeRecord = {
  __typename: "EnvMergeRecord";
  errorMessage?: Maybe<Scalars["String"]["output"]>;
  errorType?: Maybe<EnvMergeErrorType>;
  mergeTargetByStatus?: Maybe<
    Scalars["Map_MergeTarget_MergeTargetStatusScalar"]["output"]
  >;
  mergeType?: Maybe<MergeType>;
  rebuildDev: Scalars["Boolean"]["output"];
  status?: Maybe<EnvMergeStatus>;
};

export enum EnvMergeStatus {
  Created = "CREATED",
  Failed = "FAILED",
  Processing = "PROCESSING",
  Succeeded = "SUCCEEDED",
}

export enum ErrorMessage {
  HaveAttended = "HAVE_ATTENDED",
  InvalidEmailSuffix = "INVALID_EMAIL_SUFFIX",
  NotRegistered = "NOT_REGISTERED",
}

export enum ErrorType {
  CodegenError = "CODEGEN_ERROR",
  SupportServiceSynchronizationError = "SUPPORT_SERVICE_SYNCHRONIZATION_ERROR",
  Undeploy = "UNDEPLOY",
  UnknownError = "UNKNOWN_ERROR",
}

export type EvaluationInput = {
  criteriaId: Scalars["String"]["input"];
  /** Binary evaluation */
  evaluation: Scalars["Boolean"]["input"];
  /** Detailed explanation of the evaluation */
  feedback?: InputMaybe<Scalars["String"]["input"]>;
};

/**
 * A judge record captures the agent or human evaluator's assessment
 * of a single rubric criterion.
 */
export type EvaluationRecord = {
  __typename: "EvaluationRecord";
  /** Parent rubric criterion session ID */
  copilotOutputId: Scalars["String"]["output"];
  criteriaId: Scalars["String"]["output"];
  /** Binary evaluation to the criterion question */
  evaluation: Scalars["Boolean"]["output"];
  evaluatorId: Scalars["String"]["output"];
  /** Optional explanation or reasoning for the evaluation */
  feedback?: Maybe<Scalars["String"]["output"]>;
  /** Unique evaluation record identifier */
  id: Scalars["String"]["output"];
  rubricId: Scalars["String"]["output"];
};

/**
 * Final evaluation result aggregating all rubric criterion scores
 * and generating a comprehensive report.
 */
export type EvaluationResult = {
  __typename: "EvaluationResult";
  analysis: Scalars["String"]["output"];
  /** Audit trail of workflow steps and decisions */
  auditTrace?: Maybe<Array<Maybe<Scalars["String"]["output"]>>>;
  copilotOutputId: Scalars["String"]["output"];
  evaluatorId: Scalars["String"]["output"];
  /** Unique result identifier */
  id: Scalars["String"]["output"];
  /** Aggregated score across all weighted criteria (0 - 100) */
  overallScore: Scalars["Float"]["output"];
  rubricId: Scalars["String"]["output"];
};

/**
 * An evaluation session represents a single run of the evaluation workflow
 * against a golden set, producing rubric criteria and scored results.
 */
export type EvaluationSession = {
  __typename: "EvaluationSession";
  /** Timestamp when session completed (null if still running) */
  completedAt?: Maybe<Scalars["String"]["output"]>;
  copilotOutputId: Scalars["String"]["output"];
  evaluationRecords: Array<Maybe<EvaluationRecord>>;
  evaluatorId: Scalars["String"]["output"];
  evaluatorType: EvaluatorType;
  /** Unique session identifier */
  id: Scalars["String"]["output"];
  /** LLM model used for agent evaluation (e.g., 'gpt-4o', 'gemini-pro') */
  modelName?: Maybe<Scalars["String"]["output"]>;
  rubricId: Scalars["String"]["output"];
  /** Timestamp when session started */
  startedAt?: Maybe<Scalars["String"]["output"]>;
};

export enum EvaluatorType {
  Agent = "agent",
  Human = "human",
}

export enum ExpirationStatus {
  Expired = "EXPIRED",
  ExpiringSoon = "EXPIRING_SOON",
  NotExpiringSoon = "NOT_EXPIRING_SOON",
}

export type FailedPageByUrlInput = {
  mrefId?: InputMaybe<Scalars["String"]["input"]>;
  url?: InputMaybe<Scalars["String"]["input"]>;
};

export enum FeatureGateStatus {
  Closed = "CLOSED",
  ForBeta = "FOR_BETA",
  ForEngineering = "FOR_ENGINEERING",
  ForInternal = "FOR_INTERNAL",
  Published = "PUBLISHED",
}

export type FeatureStatus = {
  __typename: "FeatureStatus";
  createdAt: Scalars["OffsetDateTime"]["output"];
  description: Scalars["String"]["output"];
  enabled: Scalars["Boolean"]["output"];
  featureExId: Scalars["String"]["output"];
  featureName: Scalars["String"]["output"];
};

export type Feedback = {
  __typename: "Feedback";
  createdAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  mediaUrls?: Maybe<Array<Maybe<Scalars["String"]["output"]>>>;
  message?: Maybe<Scalars["String"]["output"]>;
  miscData?: Maybe<Scalars["Json"]["output"]>;
};

export enum FeedbackCategory {
  Bad = "BAD",
  Good = "GOOD",
}

export type File = {
  __typename: "File";
  url: Scalars["String"]["output"];
};

export type FileUrlArgs = {
  projectExId?: InputMaybe<Scalars["String"]["input"]>;
};

export type FileAndWebRootPath = {
  __typename: "FileAndWebRootPath";
  fileExId?: Maybe<Scalars["String"]["output"]>;
  fileName?: Maybe<Scalars["String"]["output"]>;
  webRootPath?: Maybe<Scalars["String"]["output"]>;
};

export type FilePresignedResult = {
  __typename: "FilePresignedResult";
  contentType: Scalars["String"]["output"];
  downloadUrl: Scalars["String"]["output"];
  fileExId: Scalars["String"]["output"];
  fileId: Scalars["Long"]["output"];
  uploadHeaders?: Maybe<Scalars["Map_String_StringScalar"]["output"]>;
  uploadUrl: Scalars["String"]["output"];
};

export type FreeTrialProjectPlanDetail = ProductDetail & {
  __typename: "FreeTrialProjectPlanDetail";
  chineseName?: Maybe<Scalars["String"]["output"]>;
  currency?: Maybe<Currency>;
  englishName?: Maybe<Scalars["String"]["output"]>;
  paymentCycle?: Maybe<PaymentCycle>;
  price?: Maybe<Scalars["BigDecimal"]["output"]>;
  projectPlanType?: Maybe<ProjectPlanType>;
  trialPeriod?: Maybe<TrialPeriod>;
};

export type FreeTrialProjectPlanWithClonedSchemaDetail = ProductDetail & {
  __typename: "FreeTrialProjectPlanWithClonedSchemaDetail";
  chineseName?: Maybe<Scalars["String"]["output"]>;
  currency?: Maybe<Currency>;
  englishName?: Maybe<Scalars["String"]["output"]>;
  paymentCycle?: Maybe<PaymentCycle>;
  price?: Maybe<Scalars["BigDecimal"]["output"]>;
  projectPlanType?: Maybe<ProjectPlanType>;
  trialPeriod?: Maybe<TrialPeriod>;
};

export type FreeTrialProjectPlanWithTemplateDetail = ProductDetail & {
  __typename: "FreeTrialProjectPlanWithTemplateDetail";
  chineseName?: Maybe<Scalars["String"]["output"]>;
  currency?: Maybe<Currency>;
  englishName?: Maybe<Scalars["String"]["output"]>;
  paymentCycle?: Maybe<PaymentCycle>;
  price?: Maybe<Scalars["BigDecimal"]["output"]>;
  projectPlanType?: Maybe<ProjectPlanType>;
  templateExId?: Maybe<Scalars["String"]["output"]>;
  trialPeriod?: Maybe<TrialPeriod>;
};

export enum Functionality {
  ActionFlow = "ACTION_FLOW",
  ConditionalContainer = "CONDITIONAL_CONTAINER",
  CustomList = "CUSTOM_LIST",
  DataModelAndMc = "DATA_MODEL_AND_MC",
  DevEnvironment = "DEV_ENVIRONMENT",
  Layout = "LAYOUT",
  Payment = "PAYMENT",
  SelectView = "SELECT_VIEW",
  TabView = "TAB_VIEW",
  Tpa = "TPA",
}

/**
 * A golden set represents a collection of test cases (user inputs)
 * and expected copilot outputs for evaluating agent performance.
 * Identified uniquely by (schemaId, copilotType, modelName).
 */
export type GoldenSet = {
  __typename: "GoldenSet";
  /** Type of copilot being evaluated */
  copilotType: CopilotType;
  /** Unique database identifier */
  id: Scalars["String"]["output"];
  /** Name of the LLM model being evaluated (e.g., 'gpt-4o', 'gemini-pro') */
  modelName?: Maybe<Scalars["String"]["output"]>;
  /** External project identifier from Functorz */
  schemaId: Scalars["String"]["output"];
};

export type GoldenSetFilters = {
  copilotType?: InputMaybe<CopilotType>;
  modelName?: InputMaybe<Scalars["String"]["input"]>;
  schemaId?: InputMaybe<Scalars["String"]["input"]>;
};

export type GoldenSetInput = {
  copilotType?: InputMaybe<CopilotType>;
  modelName?: InputMaybe<Scalars["String"]["input"]>;
  schemaId: Scalars["String"]["input"];
};

export type GoldenSetWithInputs = {
  __typename: "GoldenSetWithInputs";
  /** Type of copilot being evaluated */
  copilotType: CopilotType;
  /** Unique database identifier */
  id: Scalars["String"]["output"];
  /** Name of the LLM model being evaluated (e.g., 'gpt-4o', 'gemini-pro') */
  modelName?: Maybe<Scalars["String"]["output"]>;
  /** External project identifier from Functorz */
  schemaId: Scalars["String"]["output"];
  userInputs: Array<Maybe<UserInput>>;
};

export type HasuraConfig = {
  __typename: "HasuraConfig";
  adminSecret?: Maybe<Scalars["String"]["output"]>;
  apiPath?: Maybe<Scalars["String"]["output"]>;
  jwtConfig?: Maybe<HasuraJwtConfig>;
};

export type HasuraJwtConfig = {
  __typename: "HasuraJwtConfig";
  claimsNamespace?: Maybe<Scalars["String"]["output"]>;
  issuer?: Maybe<Scalars["String"]["output"]>;
  key?: Maybe<Scalars["String"]["output"]>;
  type?: Maybe<SignatureAlgorithm>;
};

export type HostAlias = {
  __typename: "HostAlias";
  hostnames?: Maybe<Array<Maybe<Scalars["String"]["output"]>>>;
  ip?: Maybe<Scalars["String"]["output"]>;
};

export type HostAliasInput = {
  hostnames?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  ip?: InputMaybe<Scalars["String"]["input"]>;
};

export enum HttpMethod {
  Delete = "DELETE",
  Get = "GET",
  Post = "POST",
  Put = "PUT",
}

export type HumanEvaluationInput = {
  copilotOutputId: Scalars["String"]["input"];
  evaluations: Array<EvaluationInput>;
  evaluatorId: Scalars["String"]["input"];
  rubricId: Scalars["String"]["input"];
};

export enum HumanOperationType {
  Continue = "CONTINUE",
  Edit = "EDIT",
}

export type IcpInfo = {
  __typename: "IcpInfo";
  phoneNumber?: Maybe<Scalars["String"]["output"]>;
  username?: Maybe<Scalars["String"]["output"]>;
};

export type Image = {
  __typename: "Image";
  imageKey?: Maybe<Scalars["String"]["output"]>;
  url: Scalars["String"]["output"];
};

export type ImageUrlArgs = {
  option?: InputMaybe<ImageProcessOptionInput>;
  projectExId?: InputMaybe<Scalars["String"]["input"]>;
};

export type ImageContentDetail = WechatAutoReplyContentDetail & {
  __typename: "ImageContentDetail";
  mediaId?: Maybe<Scalars["String"]["output"]>;
  type?: Maybe<WechatAutoReplyContentType>;
};

export type ImageContentDetailInput = {
  mediaId?: InputMaybe<Scalars["String"]["input"]>;
};

export type ImagePresignedResult = {
  __typename: "ImagePresignedResult";
  contentType?: Maybe<Scalars["String"]["output"]>;
  downloadUrl?: Maybe<Scalars["String"]["output"]>;
  imageExId?: Maybe<Scalars["String"]["output"]>;
  imageId: Scalars["Long"]["output"];
  uploadHeaders?: Maybe<Scalars["Map_String_StringScalar"]["output"]>;
  uploadUrl?: Maybe<Scalars["String"]["output"]>;
};

export type ImageProcessOptionInput = {
  crop?: InputMaybe<CropOptionInput>;
  resize?: InputMaybe<ResizeOptionInput>;
};

export type IndividualInvoiceProfile = InvoiceProfile & {
  __typename: "IndividualInvoiceProfile";
  email: Scalars["String"]["output"];
  exId: Scalars["String"]["output"];
  fieldsInChinese?: Maybe<
    Scalars["LinkedHashMap_String_StringScalar"]["output"]
  >;
  fullName: Scalars["String"]["output"];
  idCardNumber: Scalars["String"]["output"];
  name?: Maybe<Scalars["String"]["output"]>;
  type?: Maybe<InvoiceProfileType>;
};

export type IndividualInvoiceProfileInputInput = {
  email: Scalars["String"]["input"];
  fullName: Scalars["String"]["input"];
  idCardNumber: Scalars["String"]["input"];
};

export type InvocationResult = {
  __typename: "InvocationResult";
  httpStatusCode?: Maybe<Scalars["Int"]["output"]>;
  processingTimeMs: Scalars["Long"]["output"];
  responseData?: Maybe<Scalars["Json"]["output"]>;
  responseHeaders: Scalars["Map_String_StringScalar"]["output"];
};

export type InvoiceProfile = {
  fieldsInChinese?: Maybe<
    Scalars["LinkedHashMap_String_StringScalar"]["output"]
  >;
  name?: Maybe<Scalars["String"]["output"]>;
  type?: Maybe<InvoiceProfileType>;
};

export enum InvoiceProfileType {
  Company = "COMPANY",
  Individual = "INDIVIDUAL",
}

export type InvoiceRequest = {
  __typename: "InvoiceRequest";
  amount: Scalars["BigDecimal"]["output"];
  createdAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  exId: Scalars["String"]["output"];
  failureReason?: Maybe<Scalars["String"]["output"]>;
  invoiceFileUrl?: Maybe<Scalars["String"]["output"]>;
  invoiceProfile: InvoiceProfile;
  invoiceProfileName: Scalars["String"]["output"];
  invoiceProfileType: InvoiceProfileType;
  invoiceRequestOrders: Array<InvoiceRequestOrder>;
  invoiceType: InvoiceType;
  memo?: Maybe<Scalars["String"]["output"]>;
  status: InvoiceStatus;
  updatedAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
};

export type InvoiceRequestOrder = {
  __typename: "InvoiceRequestOrder";
  amount?: Maybe<Scalars["BigDecimal"]["output"]>;
  order: PurchaseOrder;
};

export enum InvoiceStatus {
  Failed = "FAILED",
  Pending = "PENDING",
  Successful = "SUCCESSFUL",
}

export enum InvoiceType {
  ElectronicPlain = "ELECTRONIC_PLAIN",
  ElectronicSpecial = "ELECTRONIC_SPECIAL",
}

export enum JoinCollaborationByCodeErrorType {
  CodeExpired = "CODE_EXPIRED",
  CodeMismatchWithProjectAndApp = "CODE_MISMATCH_WITH_PROJECT_AND_APP",
  CodeUsedUp = "CODE_USED_UP",
  CollaboratorLimitReached = "COLLABORATOR_LIMIT_REACHED",
  InvalidCode = "INVALID_CODE",
}

export type JoinCollaborationByCodeInfo = {
  __typename: "JoinCollaborationByCodeInfo";
  collaboratorTypeAndLevelByShareToken?: Maybe<CollaboratorTypeAndLevel>;
  collaboratorTypeByLevelAfterJoin?: Maybe<
    Scalars["Map_CollaboratorLevel_CollaboratorTypeScalar"]["output"]
  >;
  collaboratorTypeByLevelBeforeJoin?: Maybe<
    Scalars["Map_CollaboratorLevel_CollaboratorTypeScalar"]["output"]
  >;
  errorType?: Maybe<JoinCollaborationByCodeErrorType>;
  shareTokenCreator?: Maybe<Account>;
};

export type JumpWxaInput = {
  path?: InputMaybe<Scalars["String"]["input"]>;
  query?: InputMaybe<Scalars["String"]["input"]>;
};

export enum KeyValueOperator {
  Assign = "ASSIGN",
  Delete = "DELETE",
  InsertOrUpdate = "INSERT_OR_UPDATE",
}

export type KeywordAndMatchTypeInput = {
  keyword: Scalars["String"]["input"];
  matchType: WechatAutoReplyMessageKeywordMatchType;
};

export type KubernetesInput = {
  apiVerison?: InputMaybe<Scalars["String"]["input"]>;
  args?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  certificateAuthorityData?: InputMaybe<Scalars["String"]["input"]>;
  clientCertificateData?: InputMaybe<Scalars["String"]["input"]>;
  clientKeyData?: InputMaybe<Scalars["String"]["input"]>;
  clusterName?: InputMaybe<Scalars["String"]["input"]>;
  command?: InputMaybe<Scalars["String"]["input"]>;
  contextName?: InputMaybe<Scalars["String"]["input"]>;
  dockerConfigJson?: InputMaybe<Scalars["String"]["input"]>;
  env?: InputMaybe<
    Array<InputMaybe<Scalars["Map_String_StringScalar"]["input"]>>
  >;
  hasuraDockerImage?: InputMaybe<Scalars["String"]["input"]>;
  ingressClassName?: InputMaybe<Scalars["String"]["input"]>;
  ingressConfigMapName?: InputMaybe<Scalars["String"]["input"]>;
  ingressNamespace?: InputMaybe<Scalars["String"]["input"]>;
  searchDomain?: InputMaybe<Scalars["String"]["input"]>;
  serverUrl?: InputMaybe<Scalars["String"]["input"]>;
  storageClassName?: InputMaybe<Scalars["String"]["input"]>;
  storageClassSize?: InputMaybe<Scalars["String"]["input"]>;
  upstreamVhost?: InputMaybe<Scalars["String"]["input"]>;
};

export enum LanguageType {
  En = "EN",
  Zh = "ZH",
}

export type Limit = {
  __typename: "Limit";
  ONE?: Maybe<Limit>;
  UNLIMITED?: Maybe<Limit>;
  ZERO?: Maybe<Limit>;
  amount?: Maybe<Scalars["Float"]["output"]>;
  chineseDescription?: Maybe<Scalars["String"]["output"]>;
  englishDescription?: Maybe<Scalars["String"]["output"]>;
  unlimited: Scalars["Boolean"]["output"];
};

export type LogConfig = {
  __typename: "LogConfig";
  provider?: Maybe<CloudProvider>;
};

export enum LogLevel {
  Debug = "DEBUG",
  Error = "ERROR",
  Info = "INFO",
  Warning = "WARNING",
}

export type LogToolArgsInput = {
  humanInputMessage?: InputMaybe<CopilotHumanInputMessageInput>;
  requestCreatedAt: Scalars["String"]["input"];
  toolCallBatchExecErrorMessage?: InputMaybe<CopilotToolCallBatchExecErrorMessageInput>;
  toolCallBatchResponseMessage?: InputMaybe<CopilotToolCallBatchResponseMessageInput>;
  traceId: Scalars["String"]["input"];
};

export type MallBookConfig = {
  __typename: "MallBookConfig";
  channelType?: Maybe<Scalars["String"]["output"]>;
  depositNotifyUrl?: Maybe<Scalars["String"]["output"]>;
  merchantNo?: Maybe<Scalars["String"]["output"]>;
  merchantPrivateKey?: Maybe<Scalars["String"]["output"]>;
  notifyUrl?: Maybe<Scalars["String"]["output"]>;
  payUrl?: Maybe<Scalars["String"]["output"]>;
  publicKey?: Maybe<Scalars["String"]["output"]>;
  version?: Maybe<Scalars["String"]["output"]>;
};

export type MallBookConfigInput = {
  channelType?: InputMaybe<Scalars["String"]["input"]>;
  depositNotifyUrl?: InputMaybe<Scalars["String"]["input"]>;
  merchantNo?: InputMaybe<Scalars["String"]["input"]>;
  merchantPrivateKey?: InputMaybe<Scalars["String"]["input"]>;
  notifyUrl?: InputMaybe<Scalars["String"]["input"]>;
  payUrl?: InputMaybe<Scalars["String"]["input"]>;
  publicKey?: InputMaybe<Scalars["String"]["input"]>;
  version?: InputMaybe<Scalars["String"]["input"]>;
};

export type MarketRewardBalanceDetailInput = {
  amount?: InputMaybe<Scalars["BigDecimal"]["input"]>;
  expireAt?: InputMaybe<Scalars["OffsetDateTime"]["input"]>;
  validityPeriod?: InputMaybe<Scalars["Period"]["input"]>;
};

export type MarketRewardCouponTemplateDetailInput = {
  amount: Scalars["Long"]["input"];
  couponTemplateId: Scalars["Long"]["input"];
};

export type MarketRewardDetailInputInput = {
  balanceDetail?: InputMaybe<MarketRewardBalanceDetailInput>;
  couponTemplateDetail?: InputMaybe<MarketRewardCouponTemplateDetailInput>;
};

export type MarketRewardDetailOutput = {
  __typename: "MarketRewardDetailOutput";
  balanceAmount?: Maybe<Scalars["BigDecimal"]["output"]>;
  couponTemplateAndAmounts?: Maybe<Array<Maybe<Pair_CouponTemplate_Long>>>;
};

export enum MarketRewardEventType {
  RedeemCode = "REDEEM_CODE",
  RegisterWithPromoCode = "REGISTER_WITH_PROMO_CODE",
}

export type MarketRewardRecord = {
  __typename: "MarketRewardRecord";
  account: Account;
  createdAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  marketRewardRule?: Maybe<MarketRewardRule>;
};

export type MarketRewardRule = {
  __typename: "MarketRewardRule";
  active: Scalars["Boolean"]["output"];
  createdAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  effectiveAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  exId: Scalars["String"]["output"];
  expireAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  newUserOnly: Scalars["Boolean"]["output"];
  promoCode?: Maybe<PromoCode>;
  promoCodeId?: Maybe<Scalars["Long"]["output"]>;
  redemptionCode?: Maybe<RedemptionCode>;
  redemptionCodeId?: Maybe<Scalars["Long"]["output"]>;
  rewardDetails: MarketRewardDetailOutput;
  triggeredEventType?: Maybe<MarketRewardEventType>;
};

export type McConfig = {
  __typename: "McConfig";
  auditEnabled: Scalars["Boolean"]["output"];
  defaultAdminPassword?: Maybe<Scalars["String"]["output"]>;
};

export enum MediaFormat {
  Css = "CSS",
  Doc = "DOC",
  Docx = "DOCX",
  Gif = "GIF",
  Html = "HTML",
  Ico = "ICO",
  Jpeg = "JPEG",
  Jpg = "JPG",
  Js = "JS",
  Json = "JSON",
  Markdown = "MARKDOWN",
  Mov = "MOV",
  Mp3 = "MP3",
  Mp4 = "MP4",
  Other = "OTHER",
  Pdf = "PDF",
  Png = "PNG",
  Ppt = "PPT",
  Pptx = "PPTX",
  Svg = "SVG",
  Txt = "TXT",
  Wav = "WAV",
  Webm = "WEBM",
  Webp = "WEBP",
  Xls = "XLS",
  Xlsx = "XLSX",
  Xml = "XML",
}

export type MediaIdButtonInput = {
  mediaId?: InputMaybe<Scalars["String"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
};

export type MediaInfo = {
  __typename: "MediaInfo";
  type?: Maybe<Scalars["String"]["output"]>;
  url?: Maybe<Scalars["String"]["output"]>;
};

export type MediaInfoInput = {
  type?: InputMaybe<Scalars["String"]["input"]>;
  url?: InputMaybe<Scalars["String"]["input"]>;
};

export enum MemberRole {
  Admin = "ADMIN",
  Guest = "GUEST",
  Ordinary = "ORDINARY",
  SuperAdmin = "SUPER_ADMIN",
}

export enum MembershipTier {
  Employee = "EMPLOYEE",
  Enterprise = "ENTERPRISE",
  Free = "FREE",
  Isv = "ISV",
  Premium = "PREMIUM",
}

export type MenuButtonInputInput = {
  clickButton?: InputMaybe<ClickButtonInput>;
  mediaIdButton?: InputMaybe<MediaIdButtonInput>;
  miniProgramButton?: InputMaybe<MiniProgramButtonInput>;
  parentButton?: InputMaybe<ParentButtonInput>;
  viewButton?: InputMaybe<ViewButtonInput>;
};

export enum MergeType {
  ProdToProjectVersion = "PROD_TO_PROJECT_VERSION",
  ProjectVersionToProd = "PROJECT_VERSION_TO_PROD",
  SyncToProjectVersion = "SYNC_TO_PROJECT_VERSION",
}

export type Message = {
  __typename: "Message";
  category?: Maybe<Category>;
  content?: Maybe<MessageContent>;
  dynamicMessageContent?: Maybe<DynamicMessageContent>;
  exId: Scalars["String"]["output"];
  presentationType?: Maybe<MessageContentPresentationType>;
  status?: Maybe<MessageStatus>;
};

export type MessageArgsInputInput = {
  afCodeToolArgs?: InputMaybe<AfCodeToolArgsInput>;
  copilotArgs?: InputMaybe<CopilotArgsInput>;
  logToolArgs?: InputMaybe<LogToolArgsInput>;
  setDataBindingToolArgs?: InputMaybe<SetDataBindingToolArgsInput>;
};

export type MessageContent = {
  __typename: "MessageContent";
  category?: Maybe<Category>;
  createdAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  image?: Maybe<StoredImage>;
  sender: Account;
  textContent?: Maybe<Scalars["String"]["output"]>;
  textContentByLocale?: Maybe<Scalars["Map_Locale_StringScalar"]["output"]>;
  title: Scalars["String"]["output"];
  titleByLocale?: Maybe<Scalars["Map_Locale_StringScalar"]["output"]>;
  video?: Maybe<StoredVideo>;
};

export enum MessageContentPresentationType {
  Dynamic = "DYNAMIC",
  Static = "STATIC",
}

export enum MessageStatus {
  Read = "READ",
  Unread = "UNREAD",
}

export enum MigrateReason {
  ActiveProject = "ACTIVE_PROJECT",
  ManualMigrate = "MANUAL_MIGRATE",
  ResourceDowngrade = "RESOURCE_DOWNGRADE",
  ResourceUpgrade = "RESOURCE_UPGRADE",
  ZiroomGc = "ZIROOM_GC",
}

export type MingdaoApiConfig = {
  __typename: "MingdaoApiConfig";
  appKey?: Maybe<Scalars["String"]["output"]>;
  secretKey?: Maybe<Scalars["String"]["output"]>;
  sign?: Maybe<Scalars["String"]["output"]>;
};

export type MiniProgramButtonInput = {
  appId?: InputMaybe<Scalars["String"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  pagePath?: InputMaybe<Scalars["String"]["input"]>;
  url?: InputMaybe<Scalars["String"]["input"]>;
};

export type MiniProgramContentDetail = WechatAutoReplyContentDetail & {
  __typename: "MiniProgramContentDetail";
  appId?: Maybe<Scalars["String"]["output"]>;
  pagePath?: Maybe<Scalars["String"]["output"]>;
  thumbMediaId?: Maybe<Scalars["String"]["output"]>;
  title?: Maybe<Scalars["String"]["output"]>;
  type?: Maybe<WechatAutoReplyContentType>;
};

export type MiniProgramContentDetailInput = {
  appId?: InputMaybe<Scalars["String"]["input"]>;
  pagePath?: InputMaybe<Scalars["String"]["input"]>;
  thumbMediaId?: InputMaybe<Scalars["String"]["input"]>;
  title?: InputMaybe<Scalars["String"]["input"]>;
};

export type MobileApp = App & {
  __typename: "MobileApp";
  additional: Scalars["Boolean"]["output"];
  appExId?: Maybe<Scalars["String"]["output"]>;
  appType?: Maybe<AppType>;
  collaboratorType: CollaboratorType;
  collaboratorTypeByLevel?: Maybe<
    Scalars["Map_CollaboratorLevel_CollaboratorTypeScalar"]["output"]
  >;
  collaboratorsAndType?: Maybe<Array<AccountAndCollaborateType>>;
  config?: Maybe<MobileConfig>;
  createdAt: Scalars["OffsetDateTime"]["output"];
  deleted: Scalars["Boolean"]["output"];
  devEnvironmentEnable: Scalars["Boolean"]["output"];
  exId?: Maybe<Scalars["String"]["output"]>;
  expireAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  hasPublished: Scalars["Boolean"]["output"];
  isExpired: Scalars["Boolean"]["output"];
  isRenewable: Scalars["Boolean"]["output"];
  lastOpenedAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  latestDeployedServerSchema?: Maybe<Scalars["Json"]["output"]>;
  latestSchema?: Maybe<CrdtSchema>;
  mobileConfig?: Maybe<MobileConfig>;
  name: Scalars["String"]["output"];
  project: Project;
  projectExId: Scalars["String"]["output"];
  sharePermission: SharePermission;
  status?: Maybe<MobileAppStatus>;
};

export type MobileAppDeploymentOutput = DeploymentErrorLog & {
  __typename: "MobileAppDeploymentOutput";
  createdAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  deploymentErrorType?: Maybe<DeploymentErrorType>;
  errorType?: Maybe<ErrorType>;
  log?: Maybe<Scalars["String"]["output"]>;
  status?: Maybe<DeploymentEventStatus>;
};

export enum MobileAppStatus {
  Beta = "BETA",
  Created = "CREATED",
  Deleted = "DELETED",
  Published = "PUBLISHED",
}

export type MobileConfig = {
  __typename: "MobileConfig";
  appIconExId?: Maybe<Scalars["String"]["output"]>;
  ascKey?: Maybe<Scalars["String"]["output"]>;
  authKeyFileExId?: Maybe<Scalars["String"]["output"]>;
  bundleId?: Maybe<Scalars["String"]["output"]>;
  issueId?: Maybe<Scalars["String"]["output"]>;
  teamId?: Maybe<Scalars["String"]["output"]>;
};

export type MobileConfigInput = {
  appIconExId?: InputMaybe<Scalars["String"]["input"]>;
  ascKey?: InputMaybe<Scalars["String"]["input"]>;
  authKeyFileExId?: InputMaybe<Scalars["String"]["input"]>;
  bundleId?: InputMaybe<Scalars["String"]["input"]>;
  issueId?: InputMaybe<Scalars["String"]["input"]>;
  teamId?: InputMaybe<Scalars["String"]["input"]>;
};

export type MobileWebConfig = {
  __typename: "MobileWebConfig";
  customDomain?: Maybe<Scalars["String"]["output"]>;
  favicon?: Maybe<Scalars["String"]["output"]>;
};

export type MultiClientProjectPlanDetail = ProductDetail & {
  __typename: "MultiClientProjectPlanDetail";
  chineseName?: Maybe<Scalars["String"]["output"]>;
  currency?: Maybe<Currency>;
  englishName?: Maybe<Scalars["String"]["output"]>;
  paymentCycle?: Maybe<PaymentCycle>;
  price?: Maybe<Scalars["BigDecimal"]["output"]>;
  pricePerAdditionalClient?: Maybe<Scalars["BigDecimal"]["output"]>;
  standardPrice?: Maybe<Scalars["BigDecimal"]["output"]>;
};

export type MultiClientProjectPlanPurchaseItemDetailInput = {
  createAppDetails?: InputMaybe<Array<CreateAppInputInput>>;
  createProjectDetail?: InputMaybe<CreateProjectInputInput>;
  currency: Currency;
  paymentCycle: PaymentCycle;
  projectExId?: InputMaybe<Scalars["String"]["input"]>;
  projectPlanType: ProjectPlanType;
  quantity: Scalars["Int"]["input"];
  renew: Scalars["Boolean"]["input"];
  retainAppExIds?: InputMaybe<Array<Scalars["String"]["input"]>>;
};

export type MultiClientProjectWithClonedSchema = ProductDetail & {
  __typename: "MultiClientProjectWithClonedSchema";
  chineseName?: Maybe<Scalars["String"]["output"]>;
  currency?: Maybe<Currency>;
  englishName?: Maybe<Scalars["String"]["output"]>;
  paymentCycle?: Maybe<PaymentCycle>;
  price?: Maybe<Scalars["BigDecimal"]["output"]>;
  pricePerAdditionalClient?: Maybe<Scalars["BigDecimal"]["output"]>;
  standardPrice?: Maybe<Scalars["BigDecimal"]["output"]>;
};

/** Mutation root */
export type Mutation = {
  __typename: "Mutation";
  activateZiroomProject?: Maybe<DeploymentEnvStatus>;
  activeCustomDomainBlockingInCertCreating: Scalars["Boolean"]["output"];
  /** migrate project out from ziroom server */
  activeProjectInSpecificZiroom: Scalars["Boolean"]["output"];
  addAccountToBetaGroup: Scalars["Boolean"]["output"];
  addAccountToOrganization: OrganizationMember;
  addBannerItem?: Maybe<BannerItem>;
  addCodeComponentToProject: Scalars["Boolean"]["output"];
  addCodeComponentToProjectInternal: Scalars["Boolean"]["output"];
  addCollaborator: Scalars["Boolean"]["output"];
  /** backend only mutation */
  addDeploymentEventWithRecordId: Scalars["Boolean"]["output"];
  addFeature: Scalars["Boolean"]["output"];
  addOrUpdateAfCustomCodeTemplate?: Maybe<AfCodeTemplate>;
  addOrUpdateAfOpenApiNodeTemplate?: Maybe<AfCodeTemplate>;
  /** 添加新角色 */
  addRole?: Maybe<Role>;
  addTemplateSteps: Scalars["Boolean"]["output"];
  addTemplateToAccount: AccountTemplate;
  addWechatMaterial?: Maybe<Scalars["String"]["output"]>;
  addWechatWebViewDomain: Scalars["Boolean"]["output"];
  alipayTransfer: Scalars["Boolean"]["output"];
  allocateComputingPowerForSuccessfulPayment: Scalars["Boolean"]["output"];
  applyComputingPowerAddon: Scalars["Boolean"]["output"];
  applyComputingPowerKit: Scalars["Boolean"]["output"];
  applyCustomizedDomainCertificate: Scalars["Boolean"]["output"];
  archivedProjectInZiroom: Scalars["Boolean"]["output"];
  auditTemplate?: Maybe<ProjectTemplate>;
  backupProjectById: Scalars["Boolean"]["output"];
  balancePayRenew: Scalars["Boolean"]["output"];
  batchCreateSchemaCrdtPatch: Array<Maybe<SchemaCrdtPatch>>;
  batchCreateSchemaSynchronizedCrdtPatch: Array<Maybe<SchemaCrdtPatch>>;
  batchCreateSchemaSynchronizedCrdtPatchV2: Array<Maybe<SchemaCrdtPatch>>;
  batchZTypeMigration: Scalars["Boolean"]["output"];
  bindAccountWechatOauthInfoWithPhoneNumber?: Maybe<AccountInfo>;
  bindAlipayAccount: Scalars["Boolean"]["output"];
  bindReferrerPromoCode: Scalars["Boolean"]["output"];
  bindReferrerPromoCodeForAccountExIds: Scalars["Boolean"]["output"];
  bindTesterToWechatMiniProgram: Scalars["Boolean"]["output"];
  calculateResourceHistoryOfNonDeletedProject: Scalars["Boolean"]["output"];
  callbackBaiduRegisterAds: Scalars["Boolean"]["output"];
  callbackDouyinRegisterAds: Scalars["Boolean"]["output"];
  callbackWechatRegisterAds: Scalars["Boolean"]["output"];
  cancelAlipayPayment: Scalars["Boolean"]["output"];
  cancelAllOrderAndPaymentBySessionId: Scalars["Boolean"]["output"];
  cancelOrder: Scalars["Boolean"]["output"];
  cancelOrderAndPayment: Scalars["Boolean"]["output"];
  cancelStripePayment: Scalars["Boolean"]["output"];
  cancelStripeSubscription: Scalars["Boolean"]["output"];
  changeComputingPowerAddonPriceInMomen: Scalars["Boolean"]["output"];
  changeComputingPowerAddonPriceInZion: Scalars["Boolean"]["output"];
  changeProductPriceInMomen: Scalars["Boolean"]["output"];
  changeProductPriceInZion: Scalars["Boolean"]["output"];
  changeProjectCodeComponentVersion: Scalars["Boolean"]["output"];
  changeTemplateVisibility?: Maybe<ProjectTemplate>;
  checkDnsRecordStatus: Scalars["Map_VerificationRecordType_BooleanScalar"]["output"];
  checkIcpStatus?: Maybe<CustomDomain>;
  checkLongTermPendingDeploymentRecord: Scalars["Boolean"]["output"];
  checkUnexpectedResourceUsage: Scalars["Boolean"]["output"];
  checkUnexpectedResourceUsageForProject: Scalars["Boolean"]["output"];
  cleanProjectResourceTables: Scalars["Boolean"]["output"];
  clearAllPaymentConfigs?: Maybe<Project>;
  /** migrate project to ziroom server */
  clearDeleteProjectInZiroom: Scalars["Boolean"]["output"];
  clearDeletedProjectInZiroomServer: Scalars["Boolean"]["output"];
  clearDeletedProjects: Scalars["Boolean"]["output"];
  clearDeletedProjectsByZiroomId: Scalars["Boolean"]["output"];
  clearPreCreatedProject: Scalars["Boolean"]["output"];
  closeZiroom: Scalars["Boolean"]["output"];
  codeComponentPresignedUrl: Array<Maybe<FilePresignedResult>>;
  confirmCustomDomain?: Maybe<CustomDomain>;
  consumeAccountTechnicalSupportHours: Scalars["Boolean"]["output"];
  copyLatestSchemaToAnotherProject?: Maybe<Scalars["String"]["output"]>;
  copySchemaToAnotherProjectAsync?: Maybe<Scalars["String"]["output"]>;
  couponTemplate: CouponTemplate;
  createAdditionalAppWithClonedSchema?: Maybe<WebApp>;
  createAdvancedFunctionalityTutorial: Scalars["Boolean"]["output"];
  createCloudConfiguration: CloudConfiguration;
  createCodeComponentPackage?: Maybe<Scalars["String"]["output"]>;
  createCopilotSession: Scalars["String"]["output"];
  createCouponGroup: CouponGroup;
  createCouponTemplate: CouponTemplate;
  createCustomComponentInCli?: Maybe<Scalars["String"]["output"]>;
  /** backend only mutation */
  createDeploymentOutPutWithRecordId: DeploymentOutput;
  createEducationalDiscountAndAccount: Scalars["Boolean"]["output"];
  createEducationalDiscountAndAccountForMomen?: Maybe<ApplicationResult>;
  createEducationalInstitution: Scalars["Boolean"]["output"];
  createFeedback?: Maybe<Feedback>;
  createMarketRewardRule: MarketRewardRule;
  createMenu: Scalars["Boolean"]["output"];
  createMultiClientAppProjectWithClonedSchema: Scalars["Boolean"]["output"];
  createMultiClientProjectInOrganizationAsync?: Maybe<
    Scalars["String"]["output"]
  >;
  createOrUpdateZiroomProjectMigrationAppointment: Scalars["Boolean"]["output"];
  createOrder: PurchaseOrder;
  createOrganization: Organization;
  createProject: Scalars["String"]["output"];
  createProjectComment: ProjectComment;
  createProjectDevEnvironment?: Maybe<ProjectVersion>;
  createProjectInOrganizationAsync?: Maybe<Scalars["String"]["output"]>;
  createProjectPlanByOrganization: Scalars["Boolean"]["output"];
  createProjectTemplateFeedback: Scalars["Boolean"]["output"];
  createProjectVersion?: Maybe<ProjectVersion>;
  createPrometheusOperatorInZiroom: Scalars["Boolean"]["output"];
  createRedemptionCode: RedemptionCode;
  createSchemaCrdtPatch: SchemaCrdtPatch;
  createShareToken?: Maybe<CollaborativeSharedResource_ShareToken>;
  createSingleTenantPostgresSnapshot?: Maybe<Scalars["String"]["output"]>;
  /** migrate project out to producation ziroom */
  createSingleTenantZiroom: Scalars["Boolean"]["output"];
  createSubscriber: Scalars["Boolean"]["output"];
  createTemplateFromZiroomProject?: Maybe<ProjectTemplate>;
  createUserInput: UserInput;
  createWebApp?: Maybe<WebApp>;
  /** backend only mutation */
  createWebAppDeploymentOutPutWithRecordId: WebAppDeploymentOutput;
  createWebAppVersion?: Maybe<WebAppVersion>;
  createWechatAutoReply: WechatAutoReply;
  createWechatAutoReplyEventRule: WechatAutoReplyEventRule;
  createWechatAutoReplyMessageRule: WechatAutoReplyMessageRule;
  createWechatMiniProgramApp?: Maybe<WechatMiniProgramApp>;
  /** backend only mutation */
  createWechatMiniProgramAppDeploymentOutput: WechatMiniProgramAppDeploymentOutput;
  createWechatMiniProgramAppVersion?: Maybe<WechatMiniProgramAppVersion>;
  createWechatQrAuthAttemptToBindAccount: WechatQrAuthAttempt;
  createWechatQrAuthAttemptToRegisterOrLogin: WechatQrAuthAttempt;
  createZiroomServerForOrganization: Scalars["Boolean"]["output"];
  customComponentPresignedUrl: Array<Maybe<FilePresignedResult>>;
  deauthorizeProject: Scalars["Boolean"]["output"];
  deauthorizedProjectsByWechatAppIdManually: Scalars["Boolean"]["output"];
  deductBalanceAfterExpired: Scalars["Boolean"]["output"];
  degradeCollaboratorTypeAndSendMessage: Scalars["Boolean"]["output"];
  deleteAccount: Scalars["Boolean"]["output"];
  deleteAliyunSmsTemplates: Scalars["Boolean"]["output"];
  deleteApp: Scalars["Boolean"]["output"];
  deleteCodeComponentPackage: Scalars["Boolean"]["output"];
  deleteCodeComponentPackageByName: Scalars["Boolean"]["output"];
  deleteCodeComponentPackageVersion: Scalars["Boolean"]["output"];
  deleteCodeComponentPackageVersionByName: Scalars["Boolean"]["output"];
  deleteCompanyInvoiceProfile: Scalars["Boolean"]["output"];
  deleteCouponTemplate: Scalars["Boolean"]["output"];
  deleteCustomDomain: Scalars["Boolean"]["output"];
  deleteCustomView: Scalars["Boolean"]["output"];
  deleteDataVisualizer: Scalars["Boolean"]["output"];
  deleteDevProjectVersion: Scalars["Boolean"]["output"];
  deleteEditorComponent: Scalars["Boolean"]["output"];
  deleteFeature: Scalars["Boolean"]["output"];
  deleteFromAccountTemplate: Scalars["Boolean"]["output"];
  deleteInactiveProjects: Scalars["Boolean"]["output"];
  deleteIndividualInvoiceProfile: Scalars["Boolean"]["output"];
  deleteLatestAuditRecord: Scalars["Boolean"]["output"];
  deleteProject: Scalars["Boolean"]["output"];
  deleteProjectByIds: Scalars["Boolean"]["output"];
  deleteProjectComment: Scalars["Boolean"]["output"];
  deleteProjectTemplate: Scalars["Boolean"]["output"];
  deleteRedemptionCode: Scalars["Boolean"]["output"];
  deleteSchema: Scalars["Boolean"]["output"];
  deleteSecretBySchemaExId: Scalars["Boolean"]["output"];
  deleteSingleProjectAndSaveRecord: Scalars["Boolean"]["output"];
  deleteSubmittedNonTestingAuditToday: Scalars["Boolean"]["output"];
  deleteUselessCertByDomain: Scalars["Boolean"]["output"];
  deleteWechatAutoReply: Scalars["Boolean"]["output"];
  deleteWechatAutoReplyEventRule: Scalars["Boolean"]["output"];
  deleteWechatAutoReplyMessageRule: Scalars["Boolean"]["output"];
  deployV2: Scalars["Boolean"]["output"];
  disableAllGqlCompiler: Scalars["Boolean"]["output"];
  disableDomain: Scalars["Boolean"]["output"];
  disableProjectGqlCompiler: Scalars["Boolean"]["output"];
  disablePurchasedCodeComponent: Scalars["Boolean"]["output"];
  dropZaiAiModelField: Scalars["Boolean"]["output"];
  enableProjectGqlCompiler: Scalars["Boolean"]["output"];
  enablePurchasedCodeComponent: Scalars["Boolean"]["output"];
  endAllComputingPowerKitsInProject: Scalars["Boolean"]["output"];
  endSession: Scalars["Boolean"]["output"];
  executeCopilot: CopilotOutput;
  executeOverdueMigrationTasks: Scalars["Boolean"]["output"];
  exitOrganization: Scalars["Boolean"]["output"];
  expeditedWechatMiniAppRegister: Scalars["Boolean"]["output"];
  expireMarketRewardRuleByEventType: Scalars["Boolean"]["output"];
  expireMarketRewardRuleByIds: Scalars["Boolean"]["output"];
  fakeBindOauth: Scalars["Boolean"]["output"];
  fakeSubmitReview: AuditResponseForWechatMiniProgram;
  fakeUpdateLatestSubmitReviewStatus: Scalars["Boolean"]["output"];
  fakeUpdateSubmitReviewStatus: Scalars["Boolean"]["output"];
  filePresignedUrl: FilePresignedResult;
  findProjectIdsToDeleteFromSupportService?: Maybe<
    Array<Maybe<Scalars["Long"]["output"]>>
  >;
  /** backend only mutation */
  finishPackageWithRecordId: Scalars["Boolean"]["output"];
  fireOnCall?: Maybe<Scalars["Json"]["output"]>;
  fixAliPayDataBinding: Scalars["Boolean"]["output"];
  forceMergeDevToProd: Scalars["Boolean"]["output"];
  forceSetupWechatThirdPartyAuthorization: Scalars["Boolean"]["output"];
  freeTeamSpaceInSpecifiedPlan: Scalars["Boolean"]["output"];
  genWechatMiniProgramQrcodeByAppId?: Maybe<Scalars["String"]["output"]>;
  generateAllDeployedSchemaModel: Scalars["Boolean"]["output"];
  generateAndBindStripeAccountIfNotExistsAndGetOnboardingUrl: Scalars["String"]["output"];
  generateBetaWeappCreationAuthorizationQrcode?: Maybe<
    Scalars["String"]["output"]
  >;
  generateCommissionDescription?: Maybe<Scalars["String"]["output"]>;
  generatePromoCode?: Maybe<PromoCode>;
  generateRubric: Rubric;
  generateSchemaModel: Scalars["Boolean"]["output"];
  generateServerSchemaForAllDeployedSchema: Scalars["Boolean"]["output"];
  generateServerSchemaForNonDeletedSchema: Scalars["Boolean"]["output"];
  generateWechatScheme?: Maybe<Scalars["String"]["output"]>;
  hibernateZiroomProjects: Scalars["Boolean"]["output"];
  hibernateZiroomProjectsByConfigIds: Scalars["Boolean"]["output"];
  icpStatusQuerySendSms: Scalars["Boolean"]["output"];
  icpStatusQueryWithVerificationCode: Scalars["Boolean"]["output"];
  icpStatusVerificationCode: Scalars["Boolean"]["output"];
  imagePresignedUrl: ImagePresignedResult;
  importProjectSchemaJsonManual?: Maybe<Scalars["String"]["output"]>;
  importProjectSchemaManual?: Maybe<Scalars["String"]["output"]>;
  initAllProjectCodeComponents: Scalars["Boolean"]["output"];
  initAllZiroomLogService: Scalars["Boolean"]["output"];
  initCustomDomain?: Maybe<CustomDomain>;
  initZiroomLogService: Scalars["Boolean"]["output"];
  initializeGoldenSet: GoldenSet;
  initiateOrderAndPayment: PaymentResult;
  insertProduct: Product;
  insertWebhookEndpoint: WebhookEndpoint;
  invokeAlipayRecurringPaymentByPaymentId?: Maybe<AlipayResult>;
  issueMarketRewardByDetails: Scalars["Boolean"]["output"];
  joinCollaborationByCode: JoinCollaborationByCodeInfo;
  joinDataVisualizerCollaborationByCode: JoinCollaborationByCodeInfo;
  joinOrganization: OrganizationMember;
  joinProjectByShareTokenV2: CollaborativeSharedResource_Project;
  latestSession?: Maybe<Scalars["String"]["output"]>;
  leaveCollaboration: Scalars["Boolean"]["output"];
  linkGoldenSetToUserInput: Scalars["Boolean"]["output"];
  log: Scalars["Boolean"]["output"];
  login?: Maybe<AccountInfo>;
  loginWithAliEncryptedPhoneNumber?: Maybe<AccountInfo>;
  loginWithDingtalk?: Maybe<AccountInfo>;
  loginWithEmail?: Maybe<AccountInfo>;
  loginWithEmailAndVerificationCode?: Maybe<AccountInfo>;
  loginWithPhoneNumber?: Maybe<AccountInfo>;
  loginWithUsernameOrEmail?: Maybe<AccountInfo>;
  makeProjectTemplatePublic: Scalars["Boolean"]["output"];
  manualChangePaymentStatus: Scalars["Boolean"]["output"];
  manualRefund: Scalars["Boolean"]["output"];
  markAllMessagesAsRead: Scalars["Int"]["output"];
  markAuditStatusRead: Scalars["Boolean"]["output"];
  markBalanceIssuedMessageRead: Scalars["Boolean"]["output"];
  markCapabilityDowngradeNotificationAsRead: Scalars["Boolean"]["output"];
  markCouponCreatedMessageRead: Scalars["Boolean"]["output"];
  markDeploymentStatusRead: Scalars["Boolean"]["output"];
  markEducationDiscountCreationRead: Scalars["Boolean"]["output"];
  markMessagesAsRead: Scalars["Int"]["output"];
  markPopupHasRead: Scalars["Boolean"]["output"];
  markProjectCollaborationUsingCrdt: Scalars["Boolean"]["output"];
  markTutorialAsViewed?: Maybe<UserTutorialPreference>;
  markZiroomAsTerminating: Scalars["Boolean"]["output"];
  membershipUpdateRequirement: Scalars["Boolean"]["output"];
  /** merge account api */
  mergeAccount: Scalars["Boolean"]["output"];
  mergeDevToProd: Scalars["Boolean"]["output"];
  migrateAllCustomComponentMetadataToCodeComponent: Scalars["Boolean"]["output"];
  migrateAllProjectInZiroom: Scalars["Boolean"]["output"];
  migrateAllProjectObjectStorageAcl: Scalars["Boolean"]["output"];
  migrateCustomComponentMetadataToCodeComponent: Scalars["Boolean"]["output"];
  migrateProjectObjectStorageAcl: Scalars["Boolean"]["output"];
  migrateProjectTableToHypertable: Scalars["Boolean"]["output"];
  migrateProjectToOtherZiroom: Scalars["Boolean"]["output"];
  migrateProjects: Scalars["Boolean"]["output"];
  migrateSingleClientProjectToMultiClientProject: Scalars["Boolean"]["output"];
  migrateSomeTableToHypertable?: Maybe<Array<Maybe<Scalars["Long"]["output"]>>>;
  migrateZiroomTableToHypertable?: Maybe<
    Array<Maybe<Scalars["Long"]["output"]>>
  >;
  /** 修改用户角色 */
  modifyAccountRoles: Scalars["Boolean"]["output"];
  modifyPassword: Scalars["Boolean"]["output"];
  modifyProjectTemplateInfo?: Maybe<ProjectTemplate>;
  /** 修改角色权限 */
  modifyRolePermissions: Scalars["Boolean"]["output"];
  modifyWechatMiniProgramDomain: Scalars["Boolean"]["output"];
  moveAllSpecificTypeProjectToSpecificTypeZiroom: Scalars["Boolean"]["output"];
  /** migrate project to ziroom server */
  moveProjectInSpecificZiroomServer: Scalars["Boolean"]["output"];
  /** migrate project out to production ziroom */
  moveProjectOutAsProductionZiroom: Scalars["Boolean"]["output"];
  moveProjectToOrganization: Scalars["Boolean"]["output"];
  moveProjectToZiroomByType: Scalars["Boolean"]["output"];
  notifyOnWebOwnershipVerificationUpload: Scalars["Boolean"]["output"];
  paymentTimeoutProcessor: Scalars["Boolean"]["output"];
  privacyNeeded: Scalars["Boolean"]["output"];
  processAllActiveProjectCapabilities: Scalars["Boolean"]["output"];
  processAndSaveCumulativeProjectResourceUsage: Scalars["Boolean"]["output"];
  processAppAiTokenDailyUsage: Scalars["Boolean"]["output"];
  processCdnUsage: Scalars["Boolean"]["output"];
  processConsumedProjectResource: Scalars["Boolean"]["output"];
  processConsumedResource: Scalars["Boolean"]["output"];
  processExpiredComputingPower: Scalars["Boolean"]["output"];
  processExpiringComputingPower: Scalars["Boolean"]["output"];
  processOrganizationExpiration: Scalars["Boolean"]["output"];
  processOssUsage: Scalars["Boolean"]["output"];
  processPendingCommission: Scalars["Boolean"]["output"];
  processProjectCapabilitiesByProjectIds: Scalars["Boolean"]["output"];
  processProjectPlanExpiration: Scalars["Boolean"]["output"];
  publicImagePresignedUrl: ImagePresignedResult;
  publishCodeComponentPackage: Scalars["Boolean"]["output"];
  publishCustomComponent: Scalars["Boolean"]["output"];
  publishDummyWechatAuditStatusUpdateEvent: Scalars["Boolean"]["output"];
  publishInMarket: Scalars["Boolean"]["output"];
  publishSuccessfullyAuditedWechatMiniProgram: Scalars["Boolean"]["output"];
  publishWebZvm: Scalars["Boolean"]["output"];
  rebuildDevEnvironment: Scalars["Boolean"]["output"];
  recallMessages: Scalars["Int"]["output"];
  reconfigCustomDomain?: Maybe<CustomDomain>;
  redeemCode: Scalars["Boolean"]["output"];
  refreshAfCustomCodeTemplates?: Maybe<Array<Maybe<Scalars["Long"]["output"]>>>;
  refreshAllCustomLLMConfigDescriptor?: Maybe<
    Array<Maybe<Scalars["Long"]["output"]>>
  >;
  refreshAllProjectResources: Scalars["Boolean"]["output"];
  refreshDomainServerForAllProjects: Scalars["Boolean"]["output"];
  refundFullAmount: Scalars["Boolean"]["output"];
  refundLatestProjectPlan: Scalars["Boolean"]["output"];
  register?: Maybe<AccountInfo>;
  registerAndLoginWithPhoneNumberAndCode?: Maybe<AccountInfo>;
  registerInZiroomWithoutDb: Scalars["Boolean"]["output"];
  registerLogService: Scalars["Boolean"]["output"];
  registerLogServiceInAllZiroom: Scalars["Boolean"]["output"];
  registerLogServiceInSpecifiedZiroom: Scalars["Boolean"]["output"];
  registerOauth2Client?: Maybe<Oauth2RegisteredClient>;
  registerV2?: Maybe<AccountInfo>;
  remindProjectServerUpgrade: Scalars["Boolean"]["output"];
  removeAccountFromOrganization: Scalars["Boolean"]["output"];
  removeAccountFromProject: Scalars["Boolean"]["output"];
  removeBrandingAndBonusComputingPower: Scalars["Boolean"]["output"];
  removeCollaborator: Scalars["Boolean"]["output"];
  removeFile: Scalars["Boolean"]["output"];
  removeProjectCodeComponent: Scalars["Boolean"]["output"];
  removeSubscriber: Scalars["Boolean"]["output"];
  renameApp?: Maybe<App>;
  renameCustomView?: Maybe<CustomView>;
  renameProject?: Maybe<Project>;
  replaceOrganizationSuperAdmin: Scalars["Boolean"]["output"];
  reportRuntimeAlert: Scalars["Boolean"]["output"];
  resetEmail: Scalars["Boolean"]["output"];
  resetOrganizationsToFreePlanIfExpire: Scalars["Boolean"]["output"];
  resetPassword?: Maybe<AccountInfo>;
  resetPasswordWithAliEncryptedPhoneNumber?: Maybe<AccountInfo>;
  resetPasswordWithEmail?: Maybe<AccountInfo>;
  resetProject: Scalars["Boolean"]["output"];
  resolveProjectComment: Scalars["Boolean"]["output"];
  restoreProject?: Maybe<Project>;
  retrieveEducationalDiscountInfo?: Maybe<EducationalDiscountAndAccount>;
  rollbackAllProjectToZiroom: Scalars["Boolean"]["output"];
  rollbackProjectInZiroom: Scalars["Boolean"]["output"];
  runCrdtTest?: Maybe<Scalars["String"]["output"]>;
  saveCompanyInvoiceProfile: CompanyInvoiceProfile;
  saveCustomView?: Maybe<CustomView>;
  saveEditorComponent: EditorComponent;
  saveIndividualInvoiceProfile: IndividualInvoiceProfile;
  saveProjectWithWechatIds: Scalars["Boolean"]["output"];
  saveSchema?: Maybe<Scalars["String"]["output"]>;
  saveSchemaAndDeployAndSaveDataVisualizerV2?: Maybe<
    Scalars["String"]["output"]
  >;
  saveSecret: ProjectSecret;
  schemaMigration: Scalars["Boolean"]["output"];
  schemaMigrationInTemplate: Scalars["Boolean"]["output"];
  schemaMigrationRollback: Scalars["Boolean"]["output"];
  selectComponent: Scalars["Boolean"]["output"];
  /** feishu rebot send message to user */
  sendDeploymentErrorFeedback: Scalars["Boolean"]["output"];
  sendEmail: Scalars["Boolean"]["output"];
  sendEmailWithTemplate: Scalars["Boolean"]["output"];
  /** only set sendAt for scheduling future messages */
  sendMessage: Scalars["Boolean"]["output"];
  sendMessageAfterFinishingUpdateCPUAndMemory: Scalars["Boolean"]["output"];
  sendMessageForExpiredProjectPlan: Scalars["Boolean"]["output"];
  sendMessageForExpiringProjectPlan: Scalars["Boolean"]["output"];
  sendMessageOrSmsOrEmailForComputingPower: Scalars["Boolean"]["output"];
  /** only set sendAt for scheduling future messages */
  sendMessageToAll: Scalars["Int"]["output"];
  sendMessageToSession: Scalars["Boolean"]["output"];
  /** only set sendAt for scheduling future messages */
  sendMessagesToMultiUser: Scalars["Boolean"]["output"];
  sendMessagesWhenBalanceSoonToBeExpired: Scalars["Boolean"]["output"];
  sendResetEmailVerificationCode: Scalars["Boolean"]["output"];
  /** returns ids successfully sent */
  sendSmsToMultiUser?: Maybe<Array<Maybe<Scalars["String"]["output"]>>>;
  sendVerificationCodeToEmail: Scalars["Boolean"]["output"];
  sendVerificationCodeV3?: Maybe<VerifyResult>;
  serverDownProjectIds?: Maybe<Array<Maybe<Scalars["Long"]["output"]>>>;
  setAccountAsFeatureAdmin: Scalars["Boolean"]["output"];
  setAccountAsFeatureEmployee: Scalars["Boolean"]["output"];
  setAliPayConfig?: Maybe<Project>;
  setAliyunSmsCertifiedPowerOfAttorneyImage?: Maybe<Project>;
  setAliyunSmsSignature?: Maybe<Project>;
  setAliyunSmsTemplates: Array<AliyunSmsTemplateResult>;
  setBetaWeappNickName: Scalars["Boolean"]["output"];
  setBrandingRemovedByProjectPlan: Scalars["Boolean"]["output"];
  setBusinessLicenseImage?: Maybe<Project>;
  setCustomDomainAsDefault: Scalars["Boolean"]["output"];
  setCustomDomainFavicon: Scalars["Boolean"]["output"];
  setDepartmentOncall?: Maybe<Employee>;
  setEmailConfig?: Maybe<Project>;
  setFeatureEnabled: Scalars["Boolean"]["output"];
  setFeatureEnabledForExternalUsers: Scalars["Boolean"]["output"];
  setFeatureStatus: Scalars["Boolean"]["output"];
  /** backend only mutation */
  setGeneratingFailure: Scalars["Boolean"]["output"];
  setKeyValueInStore: Scalars["Boolean"]["output"];
  setKubernetesConfiguration: CloudConfiguration;
  setMallBookConfig?: Maybe<Project>;
  setMingdaoApiConfig: Scalars["Boolean"]["output"];
  setMobileConfig?: Maybe<MobileApp>;
  setPhoneNumber?: Maybe<SetPhoneNumberResult>;
  setProjectFeatureStatus: Scalars["Boolean"]["output"];
  setQuestionnaireAnswersV2: Scalars["Boolean"]["output"];
  setQueue: CloudConfiguration;
  setStripePayConfig?: Maybe<Project>;
  setSupportServiceVersion: Scalars["Boolean"]["output"];
  setUserInfo: Account;
  setUserPreference: Scalars["Boolean"]["output"];
  setUsername?: Maybe<Account>;
  setWebConfigV2?: Maybe<App>;
  setWebIconV2?: Maybe<App>;
  setWebWechatPayConfig?: Maybe<Project>;
  setWechatAutoReplyPrompt: Scalars["Boolean"]["output"];
  /** backend only mutation */
  setWechatOrderListPagePath: Scalars["Boolean"]["output"];
  setWechatPaymentSettings?: Maybe<Project>;
  setWechatPaymentSettingsV2?: Maybe<WechatAppConfig>;
  setWechatPrivateKey?: Maybe<WechatAppConfig>;
  setupWechatThirdPartyAuthorization: Scalars["Boolean"]["output"];
  setupWxworkThirdPartyAuthorization: Scalars["Boolean"]["output"];
  shareProjectTemplate: Scalars["Boolean"]["output"];
  shareProjectWithDingtalkUsers: Scalars["Boolean"]["output"];
  singleSchemaMigration: Scalars["Boolean"]["output"];
  singleUpdateWebUrl: Scalars["Boolean"]["output"];
  singleZTypeMigration: Scalars["Boolean"]["output"];
  skipQuestionnaire: Scalars["Boolean"]["output"];
  stopSession: Scalars["Boolean"]["output"];
  submitHumanEvaluation: EvaluationSession;
  submitInvoiceRequest: InvoiceRequest;
  submitLatestDeploymentErrorLog: Scalars["Boolean"]["output"];
  submitTemplate?: Maybe<ProjectTemplate>;
  submitTemplateToReviewV2: AuditResponseForWechatMiniProgram;
  submitTemplateToReviewV3: AuditResponseForWechatMiniProgram;
  syncDbToProjectVersion?: Maybe<EnvMergeRecord>;
  syncSqlToSupportService: Scalars["Boolean"]["output"];
  syncWechatTokenManually: Scalars["Boolean"]["output"];
  testCreateCommissionRefund: Scalars["Boolean"]["output"];
  testDistributeCommission: Scalars["Boolean"]["output"];
  transferAccountOwner: Scalars["Boolean"]["output"];
  transferProjectOwner: Scalars["Boolean"]["output"];
  transferProjectOwnerByAdmin: Scalars["Boolean"]["output"];
  transferProjectOwnerForFreeProject: Scalars["Boolean"]["output"];
  triggerZvmRegenerationByDeploymentEnvConfig: Scalars["Boolean"]["output"];
  truncateProjectTable: Scalars["Boolean"]["output"];
  /** backend only mutation */
  tryGetMultiClientWechatTemplateApp?: Maybe<WechatTemplateApp>;
  /** backend only mutation */
  tryGetTemplateApp?: Maybe<WechatTemplateApp>;
  tryPreviewWechatBetaMiniProgram?: Maybe<PreviewBetaResponse>;
  tryToTriggerAliCyclePayment: Scalars["Boolean"]["output"];
  unDeploy: Scalars["Boolean"]["output"];
  unregisterUserByPhoneNumber: Scalars["Boolean"]["output"];
  updateAccountProfile?: Maybe<Account>;
  updateAccountTags?: Maybe<Account>;
  updateAdvancedFunctionalityTutorial: Scalars["Boolean"]["output"];
  updateAllDailyAppAiToken: Scalars["Boolean"]["output"];
  updateBeginnerGuideStatus?: Maybe<BeginnerGuide>;
  updateBeginnerGuideStepId?: Maybe<BeginnerGuide>;
  updateBeginnerGuideTutorialVersion?: Maybe<BeginnerGuide>;
  updateCdnDomainCertificate: Scalars["Boolean"]["output"];
  updateCollaborator: Scalars["Boolean"]["output"];
  updateCompanyInvoiceProfile: CompanyInvoiceProfile;
  updateComputingPowerKitExpireTime: Scalars["Boolean"]["output"];
  updateDeploymentEnvConfigWebUrl: Scalars["Boolean"]["output"];
  /** backend only mutation */
  updateDeploymentRecordArtifacts: Scalars["Boolean"]["output"];
  updateEditorComponent: EditorComponent;
  updateFreeSupportServiceImageVersion: Scalars["Boolean"]["output"];
  updateFreeTrialCampaignTimeRange: Scalars["Boolean"]["output"];
  updateIndividualInvoiceProfile: IndividualInvoiceProfile;
  updateInvoiceRequestFailure: Scalars["Boolean"]["output"];
  updateInvoiceRequestSuccess: Scalars["Boolean"]["output"];
  updateNewSchemaZedVersion: Scalars["Boolean"]["output"];
  updateOauth2RegisteredClient?: Maybe<Oauth2RegisteredClient>;
  updateOneProjectWechatToken: Scalars["Boolean"]["output"];
  updateOrganizationName: Scalars["Boolean"]["output"];
  updateOrganizationPlanType: Scalars["Boolean"]["output"];
  updatePaidSupportServiceImageVersion: Scalars["Boolean"]["output"];
  updatePaymentStatus: Scalars["Boolean"]["output"];
  updatePreCreatedProjectCapacity: Scalars["Boolean"]["output"];
  updateProduct: Product;
  updateProductQuantityInCart?: Maybe<Array<ComputingPowerCartItem>>;
  updateProjectBalancePaySetting?: Maybe<Project>;
  updateProjectDomainServer: Scalars["Boolean"]["output"];
  updateProjectPlan: Scalars["Boolean"]["output"];
  updateProjectRole: Scalars["Boolean"]["output"];
  updateProjectRoleV2: Scalars["Boolean"]["output"];
  updateProjectTemplateDefaultUpgradeBannerScript: Scalars["Boolean"]["output"];
  updatePromoCode?: Maybe<PromoCode>;
  updateRedemptionCode?: Maybe<RedemptionCode>;
  updateSharingUrlForViewer: Scalars["Boolean"]["output"];
  updateSpecifiedPlanToBusiness: Scalars["Boolean"]["output"];
  updateSupportServiceImageVersionPartly: Scalars["Boolean"]["output"];
  updateTask: Scalars["Boolean"]["output"];
  updateTemplateStepAsCompleted: Scalars["Boolean"]["output"];
  updateWebUrl: Scalars["Boolean"]["output"];
  updateWebhookEndpoint: WebhookEndpoint;
  updateWechatAutoReply: WechatAutoReply;
  updateWechatAutoReplyEventRule: WechatAutoReplyEventRule;
  updateWechatAutoReplyMessageRule: WechatAutoReplyMessageRule;
  /** backend only mutation */
  updateWechatMiniProgramAppDeploymentRecordArtifacts: Scalars["Boolean"]["output"];
  updateWechatTokenByAppId: Scalars["Boolean"]["output"];
  updateZedState: Scalars["Boolean"]["output"];
  updateZiroomServerDeploymentById: Scalars["Boolean"]["output"];
  upgradeProjectPlanForOrganization: Scalars["Boolean"]["output"];
  upgradeSchemaZedVersionForZvm?: Maybe<Scalars["String"]["output"]>;
  uploadCertificate?: Maybe<Certificate>;
  vacuumFullProjectTable: Scalars["Boolean"]["output"];
  validateAndDeploy?: Maybe<App>;
  validateSchemaIdIsLatest: Scalars["Boolean"]["output"];
  verifyBetaWeapp: Scalars["Boolean"]["output"];
  videoPresignedUrl: VideoPresignedResult;
  webOwnershipVerificationPresignedUrl: FilePresignedResult;
  withdrawLatestAudit: Scalars["Boolean"]["output"];
  zTypeMigration: Scalars["Boolean"]["output"];
  ziroomGc: Scalars["Boolean"]["output"];
  /** backend only mutation */
  zvmGeneratorCallback: Scalars["Boolean"]["output"];
};

/** Mutation root */
export type MutationActivateZiroomProjectArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  projectExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationActiveCustomDomainBlockingInCertCreatingArgs = {
  customDomainId: Scalars["Long"]["input"];
};

/** Mutation root */
export type MutationActiveProjectInSpecificZiroomArgs = {
  deploymentEnvConfigId: Scalars["Long"]["input"];
  ziroomServerId: Scalars["Long"]["input"];
};

/** Mutation root */
export type MutationAddAccountToBetaGroupArgs = {
  externalExIds: Array<InputMaybe<Scalars["String"]["input"]>>;
};

/** Mutation root */
export type MutationAddAccountToOrganizationArgs = {
  memberAccountExId: Scalars["String"]["input"];
  organizationExId: Scalars["String"]["input"];
  role: MemberRole;
};

/** Mutation root */
export type MutationAddBannerItemArgs = {
  dto: BannerItemCreationDtoInput;
};

/** Mutation root */
export type MutationAddCodeComponentToProjectArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  packageExId: Scalars["String"]["input"];
  platform: Platform;
  projectExId: Scalars["String"]["input"];
  version: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationAddCodeComponentToProjectInternalArgs = {
  creatorAccountId: Scalars["String"]["input"];
  packageExId: Scalars["String"]["input"];
  projectExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationAddCollaboratorArgs = {
  accountExIdToAddCollaborator: Scalars["String"]["input"];
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  collaboratorType: CollaboratorType;
  dataVisualizerExId?: InputMaybe<Scalars["String"]["input"]>;
  projectExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationAddDeploymentEventWithRecordIdArgs = {
  buildTarget?: InputMaybe<BuildTarget>;
  deploymentRecordId: Scalars["Long"]["input"];
  details?: InputMaybe<Scalars["Json"]["input"]>;
  isMultiClient?: InputMaybe<Scalars["Boolean"]["input"]>;
  status: DeploymentEventStatus;
};

/** Mutation root */
export type MutationAddFeatureArgs = {
  description: Scalars["String"]["input"];
  name: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationAddOrUpdateAfCustomCodeTemplateArgs = {
  async?: InputMaybe<Scalars["Boolean"]["input"]>;
  code?: InputMaybe<Scalars["String"]["input"]>;
  displayName?: InputMaybe<Scalars["String"]["input"]>;
  inputTypes?: InputMaybe<Array<InputMaybe<NodeTemplateVariableInput>>>;
  logoUrl?: InputMaybe<Scalars["String"]["input"]>;
  outputTypes?: InputMaybe<Array<InputMaybe<NodeTemplateVariableInput>>>;
  status?: InputMaybe<AfCodeTemplateStatus>;
  templateExId?: InputMaybe<Scalars["String"]["input"]>;
  templateGroup?: InputMaybe<Scalars["String"]["input"]>;
};

/** Mutation root */
export type MutationAddOrUpdateAfOpenApiNodeTemplateArgs = {
  async?: InputMaybe<Scalars["Boolean"]["input"]>;
  displayName?: InputMaybe<Scalars["String"]["input"]>;
  inputTypes?: InputMaybe<Array<InputMaybe<NodeTemplateVariableInput>>>;
  logoUrl?: InputMaybe<Scalars["String"]["input"]>;
  openApiTemplateNode?: InputMaybe<Scalars["Json"]["input"]>;
  outputTypes?: InputMaybe<Array<InputMaybe<NodeTemplateVariableInput>>>;
  status?: InputMaybe<AfCodeTemplateStatus>;
  templateExId?: InputMaybe<Scalars["String"]["input"]>;
  templateGroup?: InputMaybe<Scalars["String"]["input"]>;
};

/** Mutation root */
export type MutationAddRoleArgs = {
  parentExId?: InputMaybe<Scalars["String"]["input"]>;
  roleName: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationAddTemplateStepsArgs = {
  stepAndChapters: Array<InputMaybe<StepAndChapterInput>>;
  templateExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationAddTemplateToAccountArgs = {
  accountId: Scalars["Long"]["input"];
  templateExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationAddWechatMaterialArgs = {
  type: WechatMaterialType;
  url: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationAddWechatWebViewDomainArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  projectExId: Scalars["String"]["input"];
  webViewDomainList?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
};

/** Mutation root */
export type MutationAllocateComputingPowerForSuccessfulPaymentArgs = {
  paymentId: Scalars["Long"]["input"];
};

/** Mutation root */
export type MutationApplyComputingPowerAddonArgs = {
  computingPowerAddonType: ComputingPowerAddonType;
  effectiveAt: Scalars["OffsetDateTime"]["input"];
  expireAt: Scalars["OffsetDateTime"]["input"];
  projectExId?: InputMaybe<Scalars["String"]["input"]>;
  quantity: Scalars["Int"]["input"];
};

/** Mutation root */
export type MutationApplyComputingPowerKitArgs = {
  computingPowerEntries: Array<InputMaybe<ComputingPowerEntryInput>>;
  computingPowerKitType: ComputingPowerKitType;
  effectiveAt: Scalars["OffsetDateTime"]["input"];
  expireAt: Scalars["OffsetDateTime"]["input"];
  organizationExId?: InputMaybe<Scalars["String"]["input"]>;
  projectExId?: InputMaybe<Scalars["String"]["input"]>;
};

/** Mutation root */
export type MutationApplyCustomizedDomainCertificateArgs = {
  customizedDomain?: InputMaybe<Scalars["String"]["input"]>;
  deploymentConfigExId?: InputMaybe<Scalars["String"]["input"]>;
};

/** Mutation root */
export type MutationArchivedProjectInZiroomArgs = {
  ziroomServerId: Scalars["Long"]["input"];
};

/** Mutation root */
export type MutationAuditTemplateArgs = {
  rejectReason?: InputMaybe<Scalars["String"]["input"]>;
  status: Status;
  templateExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationBackupProjectByIdArgs = {
  envConfigId: Scalars["Long"]["input"];
};

/** Mutation root */
export type MutationBatchCreateSchemaCrdtPatchArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  appVersionExId?: InputMaybe<Scalars["String"]["input"]>;
  patches: Array<SchemaCrdtPatchCreationDtoInput>;
  projectExId: Scalars["String"]["input"];
  schemaExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationBatchCreateSchemaSynchronizedCrdtPatchArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  appVersionExId?: InputMaybe<Scalars["String"]["input"]>;
  enableFeature?: InputMaybe<Scalars["Boolean"]["input"]>;
  feature: SchemaSynchronizedFeature;
  patches: Array<SchemaCrdtPatchCreationDtoInput>;
  projectExId: Scalars["String"]["input"];
  schemaExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationBatchCreateSchemaSynchronizedCrdtPatchV2Args = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  appVersionExId?: InputMaybe<Scalars["String"]["input"]>;
  featureOperations: Array<SchemaSynchronizedFeatureOperationInput>;
  patches: Array<SchemaCrdtPatchCreationDtoInput>;
  projectExId: Scalars["String"]["input"];
  schemaExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationBatchZTypeMigrationArgs = {
  jobType: SchemaMigrationJobType;
  schemaIdList: Array<Scalars["Long"]["input"]>;
};

/** Mutation root */
export type MutationBindAccountWechatOauthInfoWithPhoneNumberArgs = {
  phoneNumber: Scalars["String"]["input"];
  verificationCode: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationBindAlipayAccountArgs = {
  accountExId: Scalars["String"]["input"];
  alipayAccountId: Scalars["String"]["input"];
  alipayAccountIdType: AlipayAccountIdType;
  alipayUserName: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationBindReferrerPromoCodeArgs = {
  code?: InputMaybe<Scalars["String"]["input"]>;
};

/** Mutation root */
export type MutationBindReferrerPromoCodeForAccountExIdsArgs = {
  code: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationBindTesterToWechatMiniProgramArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  projectExId: Scalars["String"]["input"];
  wechatId?: InputMaybe<Scalars["String"]["input"]>;
};

/** Mutation root */
export type MutationCalculateResourceHistoryOfNonDeletedProjectArgs = {
  resourceType?: InputMaybe<ResourceType>;
};

/** Mutation root */
export type MutationCallbackBaiduRegisterAdsArgs = {
  bdVid: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationCallbackDouyinRegisterAdsArgs = {
  clickId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationCallbackWechatRegisterAdsArgs = {
  clickId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationCancelAlipayPaymentArgs = {
  outTradeNo?: InputMaybe<Scalars["String"]["input"]>;
  paymentChannel?: InputMaybe<PaymentChannel>;
};

/** Mutation root */
export type MutationCancelAllOrderAndPaymentBySessionIdArgs = {
  sessionId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationCancelOrderArgs = {
  orderId: Scalars["Long"]["input"];
  orderProductIds: Array<Scalars["Long"]["input"]>;
};

/** Mutation root */
export type MutationCancelOrderAndPaymentArgs = {
  paymentExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationCancelStripePaymentArgs = {
  paymentIntentId?: InputMaybe<Scalars["String"]["input"]>;
};

/** Mutation root */
export type MutationCancelStripeSubscriptionArgs = {
  projectId: Scalars["Long"]["input"];
};

/** Mutation root */
export type MutationChangeComputingPowerAddonPriceInMomenArgs = {
  newAmount: Scalars["Float"]["input"];
  newPrice: Scalars["BigDecimal"]["input"];
  productId: Scalars["Long"]["input"];
  stripePriceId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationChangeComputingPowerAddonPriceInZionArgs = {
  newAmount: Scalars["Float"]["input"];
  newPrice: Scalars["BigDecimal"]["input"];
  productId: Scalars["Long"]["input"];
};

/** Mutation root */
export type MutationChangeProductPriceInMomenArgs = {
  newPrice: Scalars["BigDecimal"]["input"];
  productId: Scalars["Long"]["input"];
  productType: ProductType;
  stripePriceId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationChangeProductPriceInZionArgs = {
  newPrice: Scalars["BigDecimal"]["input"];
  productId: Scalars["Long"]["input"];
  productType: ProductType;
};

/** Mutation root */
export type MutationChangeProjectCodeComponentVersionArgs = {
  projectCodeComponentExId: Scalars["String"]["input"];
  projectExId: Scalars["String"]["input"];
  version: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationChangeTemplateVisibilityArgs = {
  templateExId: Scalars["String"]["input"];
  visibility: Visibility;
};

/** Mutation root */
export type MutationCheckDnsRecordStatusArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  customDomainExId: Scalars["String"]["input"];
  projectExId: Scalars["String"]["input"];
  types: Array<VerificationRecordType>;
};

/** Mutation root */
export type MutationCheckIcpStatusArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  domain: Scalars["String"]["input"];
  phoneNumber: Scalars["String"]["input"];
  projectExId: Scalars["String"]["input"];
  username: Scalars["String"]["input"];
  verificationCode: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationCheckUnexpectedResourceUsageForProjectArgs = {
  projectId: Scalars["Long"]["input"];
};

/** Mutation root */
export type MutationCleanProjectResourceTablesArgs = {
  projectId: Scalars["Long"]["input"];
};

/** Mutation root */
export type MutationClearAllPaymentConfigsArgs = {
  projectExId: Scalars["String"]["input"];
  projectVersionExId?: InputMaybe<Scalars["String"]["input"]>;
};

/** Mutation root */
export type MutationClearDeletedProjectsByZiroomIdArgs = {
  ziroomServerId: Scalars["Long"]["input"];
};

/** Mutation root */
export type MutationClearPreCreatedProjectArgs = {
  retainingCount: Scalars["Int"]["input"];
  templateId: Scalars["Long"]["input"];
};

/** Mutation root */
export type MutationCloseZiroomArgs = {
  ziroomServerId: Scalars["Long"]["input"];
};

/** Mutation root */
export type MutationCodeComponentPresignedUrlArgs = {
  filePresignedInputs: Array<InputMaybe<CodeComponentPresignedUrlInputInput>>;
  packageExId: Scalars["String"]["input"];
  version: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationConfirmCustomDomainArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  customDomainExId: Scalars["String"]["input"];
  faviconUrl: Scalars["String"]["input"];
  projectExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationConsumeAccountTechnicalSupportHoursArgs = {
  accountExId?: InputMaybe<Scalars["String"]["input"]>;
  consumedHours: Scalars["Float"]["input"];
};

/** Mutation root */
export type MutationCopyLatestSchemaToAnotherProjectArgs = {
  category: ProjectContentCategory;
  copyData?: InputMaybe<Scalars["Boolean"]["input"]>;
  platform: Platform;
  projectName: Scalars["String"]["input"];
  projectPlanType?: InputMaybe<ProjectPlanType>;
  sourceProjectExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationCopySchemaToAnotherProjectAsyncArgs = {
  category: ProjectContentCategory;
  copyData: Scalars["Boolean"]["input"];
  platform: Platform;
  projectName: Scalars["String"]["input"];
  projectPlanType?: InputMaybe<ProjectPlanType>;
  sourceProjectExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationCouponTemplateArgs = {
  templateExId?: InputMaybe<Scalars["String"]["input"]>;
};

/** Mutation root */
export type MutationCreateAdditionalAppWithClonedSchemaArgs = {
  appName?: InputMaybe<Scalars["String"]["input"]>;
  projectId: Scalars["Long"]["input"];
  sourceAppId: Scalars["Long"]["input"];
};

/** Mutation root */
export type MutationCreateAdvancedFunctionalityTutorialArgs = {
  description: Scalars["String"]["input"];
  functionality: Functionality;
  tutorialDocumentUrl: Scalars["String"]["input"];
  tutorialVideoUrl: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationCreateCloudConfigurationArgs = {
  authority: AuthorityInput;
  bucket: Scalars["String"]["input"];
  cdn?: InputMaybe<CdnInputInput>;
  dns?: InputMaybe<DnsInputInput>;
  hostAliases?: InputMaybe<Array<InputMaybe<HostAliasInput>>>;
  kubernetes: KubernetesInput;
  name: Scalars["String"]["input"];
  provider: CloudProvider;
  queue: QueueInput;
  regionConfig: RegionConfigInput;
  remoteLoggingEnabled?: InputMaybe<Scalars["Boolean"]["input"]>;
};

/** Mutation root */
export type MutationCreateCodeComponentPackageArgs = {
  name: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationCreateCopilotSessionArgs = {
  projectExId: Scalars["String"]["input"];
  sessionType: CopilotSessionType;
};

/** Mutation root */
export type MutationCreateCouponGroupArgs = {
  input: CouponGroupDtoInput;
};

/** Mutation root */
export type MutationCreateCouponTemplateArgs = {
  input: CouponTemplateDtoInput;
};

/** Mutation root */
export type MutationCreateCustomComponentInCliArgs = {
  name: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationCreateDeploymentOutPutWithRecordIdArgs = {
  deploymentRecordId: Scalars["Long"]["input"];
  errorType?: InputMaybe<DeploymentErrorType>;
  output: Scalars["String"]["input"];
  status: DeploymentEventStatus;
};

/** Mutation root */
export type MutationCreateEducationalDiscountAndAccountArgs = {
  educationalInstitutionName?: InputMaybe<Scalars["String"]["input"]>;
  expiredAt: Scalars["OffsetDateTime"]["input"];
  role?: InputMaybe<EducationalInstitutionRole>;
  username: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationCreateEducationalDiscountAndAccountForMomenArgs = {
  email: Scalars["String"]["input"];
  expiredAt: Scalars["OffsetDateTime"]["input"];
};

/** Mutation root */
export type MutationCreateEducationalInstitutionArgs = {
  educationalInstitutionName: Scalars["String"]["input"];
  logoImageId: Scalars["Long"]["input"];
};

/** Mutation root */
export type MutationCreateFeedbackArgs = {
  mediaUrls?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  message?: InputMaybe<Scalars["String"]["input"]>;
  miscData?: InputMaybe<Scalars["Json"]["input"]>;
};

/** Mutation root */
export type MutationCreateMarketRewardRuleArgs = {
  details: Array<MarketRewardDetailInputInput>;
  effectiveAt?: InputMaybe<Scalars["OffsetDateTime"]["input"]>;
  eventType: MarketRewardEventType;
  expireAt: Scalars["OffsetDateTime"]["input"];
  newUserOnly: Scalars["Boolean"]["input"];
  promoCodeId?: InputMaybe<Scalars["Long"]["input"]>;
  redemptionCodeId?: InputMaybe<Scalars["Long"]["input"]>;
};

/** Mutation root */
export type MutationCreateMenuArgs = {
  menuButtonInputs: Array<MenuButtonInputInput>;
};

/** Mutation root */
export type MutationCreateMultiClientAppProjectWithClonedSchemaArgs = {
  accountId: Scalars["Long"]["input"];
  category: ProjectContentCategory;
  copyData?: InputMaybe<Scalars["Boolean"]["input"]>;
  expireAt: Scalars["OffsetDateTime"]["input"];
  projectName?: InputMaybe<Scalars["String"]["input"]>;
  selectedWebAppIds: Array<Scalars["Long"]["input"]>;
  sourceProjectId: Scalars["Long"]["input"];
};

/** Mutation root */
export type MutationCreateMultiClientProjectInOrganizationAsyncArgs = {
  appTypeList: Array<InputMaybe<AppType>>;
  category?: InputMaybe<ProjectContentCategory>;
  cloudConfigurationExId?: InputMaybe<Scalars["String"]["input"]>;
  forBeginnerGuide?: InputMaybe<Scalars["Boolean"]["input"]>;
  organizationExId: Scalars["String"]["input"];
  platform?: InputMaybe<Platform>;
  projectName: Scalars["String"]["input"];
  projectPlanType?: InputMaybe<ProjectPlanType>;
  projectSpaceType: ProjectSpaceType;
  templateExId?: InputMaybe<Scalars["String"]["input"]>;
  useNewType?: InputMaybe<Scalars["Boolean"]["input"]>;
  useRefactoredComponent?: InputMaybe<Scalars["Boolean"]["input"]>;
};

/** Mutation root */
export type MutationCreateOrUpdateZiroomProjectMigrationAppointmentArgs = {
  appointmentTime?: InputMaybe<Scalars["OffsetDateTime"]["input"]>;
  executeNow: Scalars["Boolean"]["input"];
  projectExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationCreateOrderArgs = {
  orderCreation: OrderCreationInput;
};

/** Mutation root */
export type MutationCreateOrganizationArgs = {
  name: Scalars["String"]["input"];
  superAdminAccountExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationCreateProjectArgs = {
  number: Scalars["Int"]["input"];
};

/** Mutation root */
export type MutationCreateProjectCommentArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  content: Scalars["String"]["input"];
  projectExId: Scalars["String"]["input"];
  targetId: Scalars["String"]["input"];
  targetType: ProjectCommentTargetType;
};

/** Mutation root */
export type MutationCreateProjectDevEnvironmentArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  previousVersionExId?: InputMaybe<Scalars["String"]["input"]>;
  projectExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationCreateProjectInOrganizationAsyncArgs = {
  category?: InputMaybe<ProjectContentCategory>;
  cloudConfigurationExId?: InputMaybe<Scalars["String"]["input"]>;
  forBeginnerGuide?: InputMaybe<Scalars["Boolean"]["input"]>;
  organizationExId: Scalars["String"]["input"];
  platform?: InputMaybe<Platform>;
  projectName: Scalars["String"]["input"];
  projectPlanType?: InputMaybe<ProjectPlanType>;
  projectSpaceType: ProjectSpaceType;
  templateExId?: InputMaybe<Scalars["String"]["input"]>;
  type?: InputMaybe<ProjectType>;
  useNewType?: InputMaybe<Scalars["Boolean"]["input"]>;
  useRefactoredComponent?: InputMaybe<Scalars["Boolean"]["input"]>;
  useZSchema?: InputMaybe<Scalars["Boolean"]["input"]>;
};

/** Mutation root */
export type MutationCreateProjectPlanByOrganizationArgs = {
  planType: PlanType;
};

/** Mutation root */
export type MutationCreateProjectTemplateFeedbackArgs = {
  expectTemplate: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationCreateProjectVersionArgs = {
  description?: InputMaybe<Scalars["String"]["input"]>;
  name: Scalars["String"]["input"];
  previousVersionExId?: InputMaybe<Scalars["String"]["input"]>;
  projectExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationCreatePrometheusOperatorInZiroomArgs = {
  ziroomServerId: Scalars["Long"]["input"];
};

/** Mutation root */
export type MutationCreateRedemptionCodeArgs = {
  input: RedemptionCodeInputInput;
};

/** Mutation root */
export type MutationCreateSchemaCrdtPatchArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  appVersionExId?: InputMaybe<Scalars["String"]["input"]>;
  patch: SchemaCrdtPatchCreationDtoInput;
  projectExId: Scalars["String"]["input"];
  schemaExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationCreateShareTokenArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  collaboratorType: CollaboratorType;
  dataVisualizerExId?: InputMaybe<Scalars["String"]["input"]>;
  permission?: InputMaybe<SharePermissionInput>;
  projectExId: Scalars["String"]["input"];
  timeLimit?: InputMaybe<Scalars["Duration"]["input"]>;
  usageLimit?: InputMaybe<Scalars["Int"]["input"]>;
};

/** Mutation root */
export type MutationCreateSingleTenantPostgresSnapshotArgs = {
  ziroomServerId: Scalars["Long"]["input"];
};

/** Mutation root */
export type MutationCreateSingleTenantZiroomArgs = {
  cloudConfigurationId: Scalars["Long"]["input"];
  resourceQuota?: InputMaybe<Scalars["Json"]["input"]>;
};

/** Mutation root */
export type MutationCreateSubscriberArgs = {
  email: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationCreateTemplateFromZiroomProjectArgs = {
  input: ProjectTemplateCreationInputInput;
  projectExId: Scalars["String"]["input"];
  templateExId?: InputMaybe<Scalars["String"]["input"]>;
};

/** Mutation root */
export type MutationCreateUserInputArgs = {
  input: UserInputInput;
};

/** Mutation root */
export type MutationCreateWebAppArgs = {
  accountId: Scalars["Long"]["input"];
  name: Scalars["String"]["input"];
  projectId: Scalars["Long"]["input"];
};

/** Mutation root */
export type MutationCreateWebAppDeploymentOutPutWithRecordIdArgs = {
  errorType?: InputMaybe<DeploymentErrorType>;
  output: Scalars["String"]["input"];
  status: DeploymentEventStatus;
  webAppDeploymentRecordId: Scalars["Long"]["input"];
};

/** Mutation root */
export type MutationCreateWebAppVersionArgs = {
  description?: InputMaybe<Scalars["String"]["input"]>;
  name: Scalars["String"]["input"];
  webAppExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationCreateWechatAutoReplyArgs = {
  contents: Array<WechatAutoReplyContentInputInput>;
  name: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationCreateWechatAutoReplyEventRuleArgs = {
  eventType: WechatAutoReplyEventType;
  replyExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationCreateWechatAutoReplyMessageRuleArgs = {
  fallback: Scalars["Boolean"]["input"];
  keywordAndMatchTypes?: InputMaybe<Array<KeywordAndMatchTypeInput>>;
  name: Scalars["String"]["input"];
  replyExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationCreateWechatMiniProgramAppArgs = {
  name: Scalars["String"]["input"];
  projectExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationCreateWechatMiniProgramAppDeploymentOutputArgs = {
  deploymentRecordId: Scalars["Long"]["input"];
  errorType?: InputMaybe<DeploymentErrorType>;
  output: Scalars["String"]["input"];
  status: DeploymentEventStatus;
};

/** Mutation root */
export type MutationCreateWechatMiniProgramAppVersionArgs = {
  appExId: Scalars["String"]["input"];
  description?: InputMaybe<Scalars["String"]["input"]>;
  name: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationCreateWechatQrAuthAttemptToRegisterOrLoginArgs = {
  sourceChannel?: InputMaybe<Scalars["String"]["input"]>;
  utmParam?: InputMaybe<UtmParamInput>;
};

/** Mutation root */
export type MutationCreateZiroomServerForOrganizationArgs = {
  deploymentEnvConfigId: Scalars["Long"]["input"];
  organizationId: Scalars["Long"]["input"];
};

/** Mutation root */
export type MutationCustomComponentPresignedUrlArgs = {
  customComponentExId: Scalars["String"]["input"];
  customComponentPresignInputs: Array<
    InputMaybe<CustomComponentPresignUrlInputInput>
  >;
  tag: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationDeauthorizeProjectArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  projectExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationDeauthorizedProjectsByWechatAppIdManuallyArgs = {
  authorizerAppId?: InputMaybe<Scalars["String"]["input"]>;
};

/** Mutation root */
export type MutationDeleteAccountArgs = {
  verificationCode: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationDeleteAliyunSmsTemplatesArgs = {
  projectExId: Scalars["String"]["input"];
  templateCode: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationDeleteAppArgs = {
  appExId: Scalars["String"]["input"];
  projectExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationDeleteCodeComponentPackageArgs = {
  packageExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationDeleteCodeComponentPackageByNameArgs = {
  name: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationDeleteCodeComponentPackageVersionArgs = {
  packageExId: Scalars["String"]["input"];
  version: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationDeleteCodeComponentPackageVersionByNameArgs = {
  name: Scalars["String"]["input"];
  version: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationDeleteCompanyInvoiceProfileArgs = {
  exId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationDeleteCouponTemplateArgs = {
  templateExId?: InputMaybe<Scalars["String"]["input"]>;
};

/** Mutation root */
export type MutationDeleteCustomDomainArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  customDomainExId: Scalars["String"]["input"];
  projectExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationDeleteCustomViewArgs = {
  appVersionExId?: InputMaybe<Scalars["String"]["input"]>;
  customViewExId: Scalars["String"]["input"];
  dataVisualizerExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationDeleteDataVisualizerArgs = {
  appVersionExId?: InputMaybe<Scalars["String"]["input"]>;
  dataVisualizerExId: Scalars["String"]["input"];
  projectExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationDeleteDevProjectVersionArgs = {
  projectExId: Scalars["String"]["input"];
  projectVersionExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationDeleteEditorComponentArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  editorComponentExId: Scalars["String"]["input"];
  projectExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationDeleteFeatureArgs = {
  featureExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationDeleteFromAccountTemplateArgs = {
  accountTemplateExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationDeleteIndividualInvoiceProfileArgs = {
  exId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationDeleteLatestAuditRecordArgs = {
  projectExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationDeleteProjectArgs = {
  projectExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationDeleteProjectByIdsArgs = {
  ids?: InputMaybe<Array<InputMaybe<Scalars["Long"]["input"]>>>;
};

/** Mutation root */
export type MutationDeleteProjectCommentArgs = {
  commentExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationDeleteProjectTemplateArgs = {
  templateExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationDeleteRedemptionCodeArgs = {
  code?: InputMaybe<Scalars["String"]["input"]>;
};

/** Mutation root */
export type MutationDeleteSchemaArgs = {
  schemaExIds?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
};

/** Mutation root */
export type MutationDeleteSecretBySchemaExIdArgs = {
  schemaExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationDeleteSingleProjectAndSaveRecordArgs = {
  configId: Scalars["Long"]["input"];
};

/** Mutation root */
export type MutationDeleteSubmittedNonTestingAuditTodayArgs = {
  projectExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationDeleteUselessCertByDomainArgs = {
  domain?: InputMaybe<Scalars["String"]["input"]>;
};

/** Mutation root */
export type MutationDeleteWechatAutoReplyArgs = {
  exId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationDeleteWechatAutoReplyEventRuleArgs = {
  exId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationDeleteWechatAutoReplyMessageRuleArgs = {
  exId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationDeployV2Args = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  buildTarget: BuildTarget;
  deploymentEnvConfigName?: InputMaybe<Scalars["String"]["input"]>;
  projectExId: Scalars["String"]["input"];
  schemaExId: Scalars["String"]["input"];
  userDeploymentEnvironment?: InputMaybe<UserDeploymentEnvironment>;
};

/** Mutation root */
export type MutationDisableDomainArgs = {
  content?: InputMaybe<Scalars["String"]["input"]>;
  domain: Scalars["String"]["input"];
  locale?: InputMaybe<Scalars["Locale"]["input"]>;
  title?: InputMaybe<Scalars["String"]["input"]>;
};

/** Mutation root */
export type MutationDisableProjectGqlCompilerArgs = {
  projectIds: Array<InputMaybe<Scalars["Long"]["input"]>>;
};

/** Mutation root */
export type MutationDisablePurchasedCodeComponentArgs = {
  projectCodeComponentExId: Scalars["String"]["input"];
  projectExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationDropZaiAiModelFieldArgs = {
  schemaId: Scalars["Long"]["input"];
};

/** Mutation root */
export type MutationEnableProjectGqlCompilerArgs = {
  projectIds: Array<InputMaybe<Scalars["Long"]["input"]>>;
};

/** Mutation root */
export type MutationEnablePurchasedCodeComponentArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  packageExId: Scalars["String"]["input"];
  platform: Platform;
  projectExId: Scalars["String"]["input"];
  version: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationEndAllComputingPowerKitsInProjectArgs = {
  projectExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationEndSessionArgs = {
  sessionExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationExecuteCopilotArgs = {
  context: CopilotInput;
};

/** Mutation root */
export type MutationExitOrganizationArgs = {
  organizationExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationExpeditedWechatMiniAppRegisterArgs = {
  code: Scalars["String"]["input"];
  legalRepName: Scalars["String"]["input"];
  legalRepWechat: Scalars["String"]["input"];
  name: Scalars["String"]["input"];
  thirdPartyPhoneNumber?: InputMaybe<Scalars["String"]["input"]>;
};

/** Mutation root */
export type MutationExpireMarketRewardRuleByEventTypeArgs = {
  eventType: MarketRewardEventType;
};

/** Mutation root */
export type MutationExpireMarketRewardRuleByIdsArgs = {
  ids?: InputMaybe<Array<InputMaybe<Scalars["Long"]["input"]>>>;
};

/** Mutation root */
export type MutationFakeBindOauthArgs = {
  fakeAccountId: Scalars["Long"]["input"];
  fakeOAuthProvider?: InputMaybe<OAuth2Provider>;
};

/** Mutation root */
export type MutationFakeSubmitReviewArgs = {
  feedbackInfo: Scalars["String"]["input"];
  mediaInfoList?: InputMaybe<Array<InputMaybe<MediaInfoInput>>>;
  projectExId: Scalars["String"]["input"];
  schemaExId: Scalars["String"]["input"];
  wechatMiniProgramAdminWechatId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationFakeUpdateLatestSubmitReviewStatusArgs = {
  auditStatus?: InputMaybe<AuditStatus>;
  projectExId?: InputMaybe<Scalars["String"]["input"]>;
};

/** Mutation root */
export type MutationFakeUpdateSubmitReviewStatusArgs = {
  auditStatus?: InputMaybe<AuditStatus>;
  wechatMiniprogramAuditId?: InputMaybe<Scalars["String"]["input"]>;
};

/** Mutation root */
export type MutationFilePresignedUrlArgs = {
  acl?: InputMaybe<CannedAccessControlList>;
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  appVersionExId?: InputMaybe<Scalars["String"]["input"]>;
  format: MediaFormat;
  md5Base64: Scalars["String"]["input"];
  name?: InputMaybe<Scalars["String"]["input"]>;
  projectExId: Scalars["String"]["input"];
  sizeBytes?: InputMaybe<Scalars["Int"]["input"]>;
  suffix?: InputMaybe<Scalars["String"]["input"]>;
};

/** Mutation root */
export type MutationFindProjectIdsToDeleteFromSupportServiceArgs = {
  ziroomServerId: Scalars["Long"]["input"];
};

/** Mutation root */
export type MutationFinishPackageWithRecordIdArgs = {
  deploymentRecordId: Scalars["Long"]["input"];
  isMultiClient?: InputMaybe<Scalars["Boolean"]["input"]>;
  platform: BuildTarget;
};

/** Mutation root */
export type MutationFireOnCallArgs = {
  details?: InputMaybe<Scalars["String"]["input"]>;
  title?: InputMaybe<Scalars["String"]["input"]>;
};

/** Mutation root */
export type MutationFixAliPayDataBindingArgs = {
  projectId: Scalars["Long"]["input"];
};

/** Mutation root */
export type MutationForceMergeDevToProdArgs = {
  projectExId: Scalars["String"]["input"];
  projectVersionExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationForceSetupWechatThirdPartyAuthorizationArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  authCode: Scalars["String"]["input"];
  projectExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationGenWechatMiniProgramQrcodeByAppIdArgs = {
  appId: Scalars["String"]["input"];
  pageId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationGenerateBetaWeappCreationAuthorizationQrcodeArgs = {
  projectExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationGenerateCommissionDescriptionArgs = {
  commissionId: Scalars["Long"]["input"];
};

/** Mutation root */
export type MutationGeneratePromoCodeArgs = {
  accountExId: Scalars["String"]["input"];
  code?: InputMaybe<Scalars["String"]["input"]>;
  description: Scalars["String"]["input"];
  expireAt: Scalars["OffsetDateTime"]["input"];
  promoCodeProductRules: Array<ProductCommissionRuleDtoInput>;
  startAt: Scalars["OffsetDateTime"]["input"];
};

/** Mutation root */
export type MutationGenerateRubricArgs = {
  context: CopilotInput;
};

/** Mutation root */
export type MutationGenerateSchemaModelArgs = {
  schemaId: Scalars["Long"]["input"];
};

/** Mutation root */
export type MutationGenerateWechatSchemeArgs = {
  expireTime?: InputMaybe<Scalars["Long"]["input"]>;
  isExpire?: InputMaybe<Scalars["Boolean"]["input"]>;
  jumpWxa?: InputMaybe<JumpWxaInput>;
  projectExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationHibernateZiroomProjectsByConfigIdsArgs = {
  deploymentEnvConfigIds: Array<Scalars["Long"]["input"]>;
};

/** Mutation root */
export type MutationIcpStatusQuerySendSmsArgs = {
  domain: Scalars["String"]["input"];
  phoneNumber: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationIcpStatusQueryWithVerificationCodeArgs = {
  domain: Scalars["String"]["input"];
  name: Scalars["String"]["input"];
  phoneNumber: Scalars["String"]["input"];
  verificationCode: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationIcpStatusVerificationCodeArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  domain: Scalars["String"]["input"];
  phoneNumber: Scalars["String"]["input"];
  projectExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationImagePresignedUrlArgs = {
  acl?: InputMaybe<CannedAccessControlList>;
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  appVersionExId?: InputMaybe<Scalars["String"]["input"]>;
  imageSuffix: MediaFormat;
  imgMd5Base64: Scalars["String"]["input"];
  projectExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationImportProjectSchemaJsonManualArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  projectExId: Scalars["String"]["input"];
  schema: Scalars["Json"]["input"];
  versionExId?: InputMaybe<Scalars["String"]["input"]>;
};

/** Mutation root */
export type MutationImportProjectSchemaManualArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  crdtModel: Scalars["Base64String"]["input"];
  projectExId: Scalars["String"]["input"];
  versionExId?: InputMaybe<Scalars["String"]["input"]>;
};

/** Mutation root */
export type MutationInitCustomDomainArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  domain: Scalars["String"]["input"];
  projectExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationInitZiroomLogServiceArgs = {
  ziroomIds?: InputMaybe<Array<InputMaybe<Scalars["Long"]["input"]>>>;
};

/** Mutation root */
export type MutationInitializeGoldenSetArgs = {
  input: GoldenSetInput;
};

/** Mutation root */
export type MutationInitiateOrderAndPaymentArgs = {
  couponExId?: InputMaybe<Scalars["String"]["input"]>;
  paymentChannel?: InputMaybe<PaymentChannel>;
  paymentType: PaymentType;
  purchaseItemDetailInputs: Array<PurchaseItemDetailInputInput>;
  sessionId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationInsertProductArgs = {
  active: Scalars["Boolean"]["input"];
  detail: ProductDetailInputInput;
};

/** Mutation root */
export type MutationInsertWebhookEndpointArgs = {
  url: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationInvokeAlipayRecurringPaymentByPaymentIdArgs = {
  paymentExId?: InputMaybe<Scalars["String"]["input"]>;
};

/** Mutation root */
export type MutationIssueMarketRewardByDetailsArgs = {
  accountIds?: InputMaybe<Array<InputMaybe<Scalars["Long"]["input"]>>>;
  details: Array<MarketRewardDetailInputInput>;
};

/** Mutation root */
export type MutationJoinCollaborationByCodeArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  code: Scalars["String"]["input"];
  projectExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationJoinDataVisualizerCollaborationByCodeArgs = {
  code: Scalars["String"]["input"];
  dataVisualizerExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationJoinOrganizationArgs = {
  code: Scalars["String"]["input"];
  organizationExId: Scalars["String"]["input"];
  role: MemberRole;
};

/** Mutation root */
export type MutationJoinProjectByShareTokenV2Args = {
  code: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationLatestSessionArgs = {
  projectExId: Scalars["String"]["input"];
  sessionType: CopilotSessionType;
};

/** Mutation root */
export type MutationLeaveCollaborationArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  projectExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationLinkGoldenSetToUserInputArgs = {
  context: CopilotInput;
};

/** Mutation root */
export type MutationLogArgs = {
  logs: Array<InputMaybe<ClientLogEntryInput>>;
};

/** Mutation root */
export type MutationLoginArgs = {
  password: Scalars["String"]["input"];
  referrerPromoCode?: InputMaybe<Scalars["String"]["input"]>;
  username: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationLoginWithAliEncryptedPhoneNumberArgs = {
  authCode: Scalars["String"]["input"];
  content: Scalars["String"]["input"];
  sign: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationLoginWithDingtalkArgs = {
  code: Scalars["String"]["input"];
  corpId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationLoginWithEmailArgs = {
  email: Scalars["String"]["input"];
  password: Scalars["String"]["input"];
  referrerPromoCode?: InputMaybe<Scalars["String"]["input"]>;
};

/** Mutation root */
export type MutationLoginWithEmailAndVerificationCodeArgs = {
  email: Scalars["String"]["input"];
  verificationCode: Scalars["String"]["input"];
  verificationCodeType: VerificationCodeType;
};

/** Mutation root */
export type MutationLoginWithPhoneNumberArgs = {
  password: Scalars["String"]["input"];
  phoneNumber: Scalars["String"]["input"];
  referrerPromoCode?: InputMaybe<Scalars["String"]["input"]>;
};

/** Mutation root */
export type MutationLoginWithUsernameOrEmailArgs = {
  password: Scalars["String"]["input"];
  referrerPromoCode?: InputMaybe<Scalars["String"]["input"]>;
  usernameOrEmail: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationMakeProjectTemplatePublicArgs = {
  templateExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationManualChangePaymentStatusArgs = {
  currentPaymentStatus?: InputMaybe<PaymentStatus>;
  orderId: Scalars["Long"]["input"];
  paymentId: Scalars["Long"]["input"];
  previousPaymentStatus?: InputMaybe<PaymentStatus>;
};

/** Mutation root */
export type MutationManualRefundArgs = {
  currency: Currency;
  orderProductExId: Scalars["String"]["input"];
  refundAmount: Scalars["BigDecimal"]["input"];
};

/** Mutation root */
export type MutationMarkAllMessagesAsReadArgs = {
  popupArea?: InputMaybe<SiteArea>;
  popupProjectExId?: InputMaybe<Scalars["String"]["input"]>;
};

/** Mutation root */
export type MutationMarkAuditStatusReadArgs = {
  projectExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationMarkCapabilityDowngradeNotificationAsReadArgs = {
  capability: Capability;
  projectExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationMarkDeploymentStatusReadArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  appVersionExId?: InputMaybe<Scalars["String"]["input"]>;
  buildTarget: BuildTarget;
  projectExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationMarkEducationDiscountCreationReadArgs = {
  educationDiscountExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationMarkMessagesAsReadArgs = {
  messageExIds?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
};

/** Mutation root */
export type MutationMarkPopupHasReadArgs = {
  popupType?: InputMaybe<PopupType>;
};

/** Mutation root */
export type MutationMarkProjectCollaborationUsingCrdtArgs = {
  projectId: Scalars["Long"]["input"];
};

/** Mutation root */
export type MutationMarkTutorialAsViewedArgs = {
  functionality: Functionality;
};

/** Mutation root */
export type MutationMarkZiroomAsTerminatingArgs = {
  ziroomServerId: Scalars["Long"]["input"];
};

/** Mutation root */
export type MutationMembershipUpdateRequirementArgs = {
  membershipTier?: InputMaybe<MembershipTier>;
};

/** Mutation root */
export type MutationMergeAccountArgs = {
  accountId: Scalars["Long"]["input"];
  toMergeAccountId: Scalars["Long"]["input"];
};

/** Mutation root */
export type MutationMergeDevToProdArgs = {
  deleteAfterMerge?: InputMaybe<Scalars["Boolean"]["input"]>;
  projectExId: Scalars["String"]["input"];
  projectVersionExId: Scalars["String"]["input"];
  rebuildDev: Scalars["Boolean"]["input"];
};

/** Mutation root */
export type MutationMigrateAllProjectInZiroomArgs = {
  ziroomServerId: Scalars["Long"]["input"];
};

/** Mutation root */
export type MutationMigrateCustomComponentMetadataToCodeComponentArgs = {
  customComponentId: Scalars["Long"]["input"];
};

/** Mutation root */
export type MutationMigrateProjectObjectStorageAclArgs = {
  deploymentEnvConfigId: Scalars["Long"]["input"];
};

/** Mutation root */
export type MutationMigrateProjectTableToHypertableArgs = {
  deploymentEnvConfigId: Scalars["Long"]["input"];
};

/** Mutation root */
export type MutationMigrateProjectToOtherZiroomArgs = {
  deploymentEnvConfigId: Scalars["Long"]["input"];
};

/** Mutation root */
export type MutationMigrateProjectsArgs = {
  migrateReason?: InputMaybe<MigrateReason>;
  projectIds?: InputMaybe<Array<InputMaybe<Scalars["Long"]["input"]>>>;
};

/** Mutation root */
export type MutationMigrateSingleClientProjectToMultiClientProjectArgs = {
  accountId: Scalars["Long"]["input"];
  projectId: Scalars["Long"]["input"];
};

/** Mutation root */
export type MutationMigrateZiroomTableToHypertableArgs = {
  ziroomId: Scalars["Long"]["input"];
};

/** Mutation root */
export type MutationModifyAccountRolesArgs = {
  accountExId: Scalars["String"]["input"];
  roleExId: Array<InputMaybe<Scalars["String"]["input"]>>;
};

/** Mutation root */
export type MutationModifyPasswordArgs = {
  accountId: Scalars["Long"]["input"];
  password?: InputMaybe<Scalars["String"]["input"]>;
};

/** Mutation root */
export type MutationModifyProjectTemplateInfoArgs = {
  input: ProjectTemplateModifyInputInput;
  templateExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationModifyRolePermissionsArgs = {
  permissions: Array<InputMaybe<Permission>>;
  roleExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationModifyWechatMiniProgramDomainArgs = {
  appId?: InputMaybe<Scalars["String"]["input"]>;
};

/** Mutation root */
export type MutationMoveAllSpecificTypeProjectToSpecificTypeZiroomArgs = {
  projectPlanType?: InputMaybe<ProjectPlanType>;
  serverType?: InputMaybe<ZiroomServerType>;
};

/** Mutation root */
export type MutationMoveProjectInSpecificZiroomServerArgs = {
  deploymentEnvConfigId: Scalars["Long"]["input"];
  ziroomServerId: Scalars["Long"]["input"];
};

/** Mutation root */
export type MutationMoveProjectOutAsProductionZiroomArgs = {
  deploymentEnvConfigId: Scalars["Long"]["input"];
  resourceQuota?: InputMaybe<Scalars["Json"]["input"]>;
};

/** Mutation root */
export type MutationMoveProjectToOrganizationArgs = {
  organizationId: Scalars["Long"]["input"];
  projectId: Scalars["Long"]["input"];
};

/** Mutation root */
export type MutationMoveProjectToZiroomByTypeArgs = {
  deploymentEnvConfigId: Scalars["Long"]["input"];
  type?: InputMaybe<ZiroomServerType>;
};

/** Mutation root */
export type MutationNotifyOnWebOwnershipVerificationUploadArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  fileExIds: Array<InputMaybe<Scalars["String"]["input"]>>;
  projectExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationPrivacyNeededArgs = {
  projectExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationProcessAndSaveCumulativeProjectResourceUsageArgs = {
  projectId: Scalars["Long"]["input"];
  resourceType?: InputMaybe<ResourceType>;
};

/** Mutation root */
export type MutationProcessAppAiTokenDailyUsageArgs = {
  projectId: Scalars["Long"]["input"];
  timeRanges?: InputMaybe<Array<InputMaybe<TimeRangeInput>>>;
};

/** Mutation root */
export type MutationProcessConsumedProjectResourceArgs = {
  projectId: Scalars["Long"]["input"];
};

/** Mutation root */
export type MutationProcessProjectCapabilitiesByProjectIdsArgs = {
  projectIds?: InputMaybe<Array<InputMaybe<Scalars["Long"]["input"]>>>;
};

/** Mutation root */
export type MutationPublicImagePresignedUrlArgs = {
  imageSuffix: MediaFormat;
  imgMd5Base64: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationPublishCodeComponentPackageArgs = {
  inputs: Array<CodeComponentMetaInputInput>;
  packageDemoLink?: InputMaybe<Scalars["String"]["input"]>;
  packageExId: Scalars["String"]["input"];
  platforms: Array<Platform>;
  version: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationPublishCustomComponentArgs = {
  customComponentExId: Scalars["String"]["input"];
  customComponentMetaData: Scalars["Json"]["input"];
  tag: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationPublishDummyWechatAuditStatusUpdateEventArgs = {
  entity?: InputMaybe<WechatApiGetLatestAuditStatusResponseEntityInput>;
  projectExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationPublishInMarketArgs = {
  packageExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationPublishSuccessfullyAuditedWechatMiniProgramArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  projectExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationPublishWebZvmArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  appVersionExId?: InputMaybe<Scalars["String"]["input"]>;
  projectExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationRebuildDevEnvironmentArgs = {
  projectExId: Scalars["String"]["input"];
  projectVersionExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationRecallMessagesArgs = {
  messageContentExId?: InputMaybe<Scalars["String"]["input"]>;
};

/** Mutation root */
export type MutationReconfigCustomDomainArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  customDomainExId: Scalars["String"]["input"];
  projectExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationRedeemCodeArgs = {
  code: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationRefreshAllProjectResourcesArgs = {
  projectExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationRefundFullAmountArgs = {
  orderExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationRefundLatestProjectPlanArgs = {
  projectExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationRegisterArgs = {
  email?: InputMaybe<Scalars["String"]["input"]>;
  password: Scalars["String"]["input"];
  phoneNumber?: InputMaybe<Scalars["String"]["input"]>;
  referrerPromoCode?: InputMaybe<Scalars["String"]["input"]>;
  sourceChannel?: InputMaybe<Scalars["String"]["input"]>;
  username: Scalars["String"]["input"];
  utmParam?: InputMaybe<UtmParamInput>;
  verificationCode: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationRegisterAndLoginWithPhoneNumberAndCodeArgs = {
  phoneNumber: Scalars["String"]["input"];
  referrerPromoCode?: InputMaybe<Scalars["String"]["input"]>;
  sourceChannel?: InputMaybe<Scalars["String"]["input"]>;
  utmParam?: InputMaybe<UtmParamInput>;
  verificationCode: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationRegisterInZiroomWithoutDbArgs = {
  deploymentEnvConfigId: Scalars["Long"]["input"];
  ziroomServerId: Scalars["Long"]["input"];
};

/** Mutation root */
export type MutationRegisterLogServiceArgs = {
  configId: Scalars["Long"]["input"];
  ziroomId: Scalars["Long"]["input"];
};

/** Mutation root */
export type MutationRegisterLogServiceInSpecifiedZiroomArgs = {
  ziroomId: Scalars["Long"]["input"];
};

/** Mutation root */
export type MutationRegisterOauth2ClientArgs = {
  clientName: Scalars["String"]["input"];
  redirectUrls: Array<InputMaybe<Scalars["String"]["input"]>>;
  scopes: Array<InputMaybe<Oauth2Scope>>;
};

/** Mutation root */
export type MutationRegisterV2Args = {
  email?: InputMaybe<Scalars["String"]["input"]>;
  password: Scalars["String"]["input"];
  phoneNumber?: InputMaybe<Scalars["String"]["input"]>;
  referrerPromoCode?: InputMaybe<Scalars["String"]["input"]>;
  sourceChannel?: InputMaybe<Scalars["String"]["input"]>;
  subscriptEmail?: InputMaybe<Scalars["Boolean"]["input"]>;
  username?: InputMaybe<Scalars["String"]["input"]>;
  utmParam?: InputMaybe<UtmParamInput>;
  verificationCode: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationRemoveAccountFromOrganizationArgs = {
  memberAccountExId: Scalars["String"]["input"];
  organizationExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationRemoveAccountFromProjectArgs = {
  collaboratorExId: Scalars["String"]["input"];
  projectExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationRemoveBrandingAndBonusComputingPowerArgs = {
  projectIds?: InputMaybe<Array<InputMaybe<Scalars["Long"]["input"]>>>;
};

/** Mutation root */
export type MutationRemoveCollaboratorArgs = {
  accountExIdToRemoveCollaborator: Scalars["String"]["input"];
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  appVersionExId?: InputMaybe<Scalars["String"]["input"]>;
  dataVisualizerExId?: InputMaybe<Scalars["String"]["input"]>;
  projectExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationRemoveFileArgs = {
  appVersionExId?: InputMaybe<Scalars["String"]["input"]>;
  fileExIds: Array<InputMaybe<Scalars["String"]["input"]>>;
  projectExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationRemoveProjectCodeComponentArgs = {
  projectCodeComponentExId: Scalars["String"]["input"];
  projectExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationRemoveSubscriberArgs = {
  email: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationRenameAppArgs = {
  appExId: Scalars["String"]["input"];
  appName: Scalars["String"]["input"];
  projectExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationRenameCustomViewArgs = {
  appVersionExId?: InputMaybe<Scalars["String"]["input"]>;
  customViewExId: Scalars["String"]["input"];
  dataVisualizerExId: Scalars["String"]["input"];
  name: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationRenameProjectArgs = {
  projectExId: Scalars["String"]["input"];
  projectName: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationReplaceOrganizationSuperAdminArgs = {
  newSuperAdminAccountExId: Scalars["String"]["input"];
  organizationExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationReportRuntimeAlertArgs = {
  input: RuntimeAlertInputInput;
};

/** Mutation root */
export type MutationResetEmailArgs = {
  email: Scalars["String"]["input"];
  verificationCode: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationResetOrganizationsToFreePlanIfExpireArgs = {
  orgIds?: InputMaybe<Array<InputMaybe<Scalars["Long"]["input"]>>>;
};

/** Mutation root */
export type MutationResetPasswordArgs = {
  method: SendMethod;
  password: Scalars["String"]["input"];
  sendTo: Scalars["String"]["input"];
  username?: InputMaybe<Scalars["String"]["input"]>;
  verificationCode: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationResetPasswordWithAliEncryptedPhoneNumberArgs = {
  content: Scalars["String"]["input"];
  password: Scalars["String"]["input"];
  sign: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationResetPasswordWithEmailArgs = {
  email: Scalars["String"]["input"];
  password: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationResetProjectArgs = {
  languageType: LanguageType;
  projectExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationResolveProjectCommentArgs = {
  commentExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationRestoreProjectArgs = {
  projectExId?: InputMaybe<Scalars["String"]["input"]>;
};

/** Mutation root */
export type MutationRetrieveEducationalDiscountInfoArgs = {
  username: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationRollbackAllProjectToZiroomArgs = {
  fromServerId: Scalars["Long"]["input"];
  toServerId: Scalars["Long"]["input"];
};

/** Mutation root */
export type MutationRollbackProjectInZiroomArgs = {
  deploymentEnvConfigId: Scalars["Long"]["input"];
  toServerId: Scalars["Long"]["input"];
};

/** Mutation root */
export type MutationRunCrdtTestArgs = {
  number: Scalars["Int"]["input"];
};

/** Mutation root */
export type MutationSaveCompanyInvoiceProfileArgs = {
  input: CompanyInvoiceProfileInputInput;
};

/** Mutation root */
export type MutationSaveCustomViewArgs = {
  appVersionExId?: InputMaybe<Scalars["String"]["input"]>;
  config: Scalars["Json"]["input"];
  customViewExId?: InputMaybe<Scalars["String"]["input"]>;
  dataVisualizerExId: Scalars["String"]["input"];
  name: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationSaveEditorComponentArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  coverImageExId?: InputMaybe<Scalars["String"]["input"]>;
  description: Scalars["String"]["input"];
  mRefMap: Scalars["Json"]["input"];
  name: Scalars["String"]["input"];
  platforms: Array<InputMaybe<Platform>>;
  projectExId: Scalars["String"]["input"];
  rootMRef: Scalars["String"]["input"];
  zedVersion: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationSaveIndividualInvoiceProfileArgs = {
  input: IndividualInvoiceProfileInputInput;
};

/** Mutation root */
export type MutationSaveProjectWithWechatIdsArgs = {
  projectExId: Scalars["String"]["input"];
  wechatIds?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
};

/** Mutation root */
export type MutationSaveSchemaArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  projectExId: Scalars["String"]["input"];
  versionExId?: InputMaybe<Scalars["String"]["input"]>;
};

/** Mutation root */
export type MutationSaveSchemaAndDeployAndSaveDataVisualizerV2Args = {
  dataVisualizerName: Scalars["String"]["input"];
  displayNameConfig: Scalars["Json"]["input"];
  projectExId: Scalars["String"]["input"];
  roleConfigUniqueId: Scalars["UUID"]["input"];
  roleConfigs: Scalars["Json"]["input"];
  versionExId?: InputMaybe<Scalars["String"]["input"]>;
};

/** Mutation root */
export type MutationSaveSecretArgs = {
  projectExId: Scalars["String"]["input"];
  schemaExId: Scalars["String"]["input"];
  secretValue: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationSchemaMigrationRollbackArgs = {
  targetZedVersion?: InputMaybe<Scalars["String"]["input"]>;
};

/** Mutation root */
export type MutationSelectComponentArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  mRef: Scalars["String"]["input"];
  projectExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationSendDeploymentErrorFeedbackArgs = {
  feedback: Scalars["String"]["input"];
  recordExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationSendEmailArgs = {
  receiverEmail?: InputMaybe<Scalars["String"]["input"]>;
  senderEmail?: InputMaybe<Scalars["String"]["input"]>;
  text?: InputMaybe<Scalars["String"]["input"]>;
  title?: InputMaybe<Scalars["String"]["input"]>;
};

/** Mutation root */
export type MutationSendEmailWithTemplateArgs = {
  receiverEmail?: InputMaybe<Scalars["String"]["input"]>;
  senderEmail?: InputMaybe<Scalars["String"]["input"]>;
  templateName?: InputMaybe<Scalars["String"]["input"]>;
};

/** Mutation root */
export type MutationSendMessageArgs = {
  category: Category;
  expireAt?: InputMaybe<Scalars["OffsetDateTime"]["input"]>;
  imageExId?: InputMaybe<Scalars["String"]["input"]>;
  locale?: InputMaybe<Scalars["Locale"]["input"]>;
  popupAreas?: InputMaybe<Array<InputMaybe<SiteArea>>>;
  receiverExId: Scalars["String"]["input"];
  sendAt?: InputMaybe<Scalars["OffsetDateTime"]["input"]>;
  textContentByLocale: Scalars["Map_Locale_StringScalar"]["input"];
  titleByLocale: Scalars["Map_Locale_StringScalar"]["input"];
  videoExId?: InputMaybe<Scalars["String"]["input"]>;
};

/** Mutation root */
export type MutationSendMessageAfterFinishingUpdateCpuAndMemoryArgs = {
  cpuByCore: Scalars["Float"]["input"];
  memoryByGB: Scalars["Float"]["input"];
  projectExId?: InputMaybe<Scalars["String"]["input"]>;
};

/** Mutation root */
export type MutationSendMessageForExpiredProjectPlanArgs = {
  projectId: Scalars["Long"]["input"];
};

/** Mutation root */
export type MutationSendMessageForExpiringProjectPlanArgs = {
  projectId: Scalars["Long"]["input"];
};

/** Mutation root */
export type MutationSendMessageOrSmsOrEmailForComputingPowerArgs = {
  projectId: Scalars["Long"]["input"];
};

/** Mutation root */
export type MutationSendMessageToAllArgs = {
  category: Category;
  expireAt?: InputMaybe<Scalars["OffsetDateTime"]["input"]>;
  imageExId?: InputMaybe<Scalars["String"]["input"]>;
  locale?: InputMaybe<Scalars["Locale"]["input"]>;
  popupAreas?: InputMaybe<Array<InputMaybe<SiteArea>>>;
  sendAt?: InputMaybe<Scalars["OffsetDateTime"]["input"]>;
  textContentByLocale: Scalars["Map_Locale_StringScalar"]["input"];
  titleByLocale: Scalars["Map_Locale_StringScalar"]["input"];
  videoExId?: InputMaybe<Scalars["String"]["input"]>;
};

/** Mutation root */
export type MutationSendMessageToSessionArgs = {
  argsInput: MessageArgsInputInput;
  sessionExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationSendMessagesToMultiUserArgs = {
  category: Category;
  expireAt?: InputMaybe<Scalars["OffsetDateTime"]["input"]>;
  imageExId?: InputMaybe<Scalars["String"]["input"]>;
  locale?: InputMaybe<Scalars["Locale"]["input"]>;
  popupAreas?: InputMaybe<Array<InputMaybe<SiteArea>>>;
  receiverExIds: Array<InputMaybe<Scalars["String"]["input"]>>;
  sendAt?: InputMaybe<Scalars["OffsetDateTime"]["input"]>;
  textContentByLocale: Scalars["Map_Locale_StringScalar"]["input"];
  titleByLocale: Scalars["Map_Locale_StringScalar"]["input"];
  videoExId?: InputMaybe<Scalars["String"]["input"]>;
};

/** Mutation root */
export type MutationSendResetEmailVerificationCodeArgs = {
  sendTo: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationSendSmsToMultiUserArgs = {
  receiverExIds: Array<InputMaybe<Scalars["String"]["input"]>>;
  signName: Scalars["String"]["input"];
  templateCode: Scalars["String"]["input"];
  templateParams: Scalars["Map_String_StringScalar"]["input"];
};

/** Mutation root */
export type MutationSendVerificationCodeToEmailArgs = {
  email: Scalars["String"]["input"];
  type: VerificationCodeType;
};

/** Mutation root */
export type MutationSendVerificationCodeV3Args = {
  captchaVerifyParam: Scalars["String"]["input"];
  method: SendMethod;
  sendTo: Scalars["String"]["input"];
  type: VerificationCodeType;
};

/** Mutation root */
export type MutationSetAccountAsFeatureAdminArgs = {
  accountExId?: InputMaybe<Scalars["String"]["input"]>;
};

/** Mutation root */
export type MutationSetAccountAsFeatureEmployeeArgs = {
  accountExId?: InputMaybe<Scalars["String"]["input"]>;
};

/** Mutation root */
export type MutationSetAliPayConfigArgs = {
  appVersionExId?: InputMaybe<Scalars["String"]["input"]>;
  config: AliPayConfigInput;
  projectExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationSetAliyunSmsCertifiedPowerOfAttorneyImageArgs = {
  appVersionExId?: InputMaybe<Scalars["String"]["input"]>;
  powerOfAttorneyImageExId: Scalars["String"]["input"];
  projectExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationSetAliyunSmsSignatureArgs = {
  appVersionExId?: InputMaybe<Scalars["String"]["input"]>;
  projectExId: Scalars["String"]["input"];
  signature: AliyunSmsSignatureInput;
};

/** Mutation root */
export type MutationSetAliyunSmsTemplatesArgs = {
  projectExId: Scalars["String"]["input"];
  templates: Array<AliyunSmsTemplateParamsInput>;
};

/** Mutation root */
export type MutationSetBetaWeappNickNameArgs = {
  nickName: Scalars["String"]["input"];
  projectExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationSetBrandingRemovedByProjectPlanArgs = {
  brandingRemoved: Scalars["Boolean"]["input"];
  projectExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationSetBusinessLicenseImageArgs = {
  appVersionExId?: InputMaybe<Scalars["String"]["input"]>;
  businessLicenseImageExId: Scalars["String"]["input"];
  projectExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationSetCustomDomainAsDefaultArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  customDomainExId: Scalars["String"]["input"];
  projectExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationSetCustomDomainFaviconArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  customDomainExId: Scalars["String"]["input"];
  faviconUrl: Scalars["String"]["input"];
  projectExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationSetDepartmentOncallArgs = {
  department: Department;
  name: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationSetEmailConfigArgs = {
  appVersionExId?: InputMaybe<Scalars["String"]["input"]>;
  emailConfig?: InputMaybe<EmailConfigInput>;
  projectExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationSetFeatureEnabledArgs = {
  enabled: Scalars["Boolean"]["input"];
  featureExId: Scalars["String"]["input"];
  targetAccountId: Scalars["Long"]["input"];
};

/** Mutation root */
export type MutationSetFeatureEnabledForExternalUsersArgs = {
  enabled: Scalars["Boolean"]["input"];
  externalExIds: Array<InputMaybe<Scalars["String"]["input"]>>;
  featureExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationSetFeatureStatusArgs = {
  featureExId: Scalars["String"]["input"];
  status: FeatureGateStatus;
};

/** Mutation root */
export type MutationSetGeneratingFailureArgs = {
  deploymentRecordId: Scalars["Long"]["input"];
  details?: InputMaybe<Scalars["Json"]["input"]>;
  isMultiClient?: InputMaybe<Scalars["Boolean"]["input"]>;
  platform: BuildTarget;
};

/** Mutation root */
export type MutationSetKeyValueInStoreArgs = {
  key?: InputMaybe<Scalars["String"]["input"]>;
  value?: InputMaybe<Scalars["Json"]["input"]>;
};

/** Mutation root */
export type MutationSetKubernetesConfigurationArgs = {
  exId: Scalars["String"]["input"];
  kubernetes?: InputMaybe<KubernetesInput>;
};

/** Mutation root */
export type MutationSetMallBookConfigArgs = {
  mallBookConfig: MallBookConfigInput;
  projectExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationSetMingdaoApiConfigArgs = {
  appKey: Scalars["String"]["input"];
  projectExId: Scalars["String"]["input"];
  secretKey: Scalars["String"]["input"];
  sign: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationSetMobileConfigArgs = {
  appExId: Scalars["String"]["input"];
  appVersionExId?: InputMaybe<Scalars["String"]["input"]>;
  config: MobileConfigInput;
  projectExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationSetPhoneNumberArgs = {
  phoneNumber: Scalars["String"]["input"];
  verificationCode: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationSetProjectFeatureStatusArgs = {
  enabled: Scalars["Boolean"]["input"];
  featureExId: Scalars["String"]["input"];
  projectExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationSetQuestionnaireAnswersV2Args = {
  questionAndAnswers: Array<UserQuestionAndAnswerInput>;
};

/** Mutation root */
export type MutationSetQueueArgs = {
  exId: Scalars["String"]["input"];
  queue?: InputMaybe<QueueInput>;
};

/** Mutation root */
export type MutationSetStripePayConfigArgs = {
  appVersionExId?: InputMaybe<Scalars["String"]["input"]>;
  config: StripePayConfigInput;
  projectExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationSetSupportServiceVersionArgs = {
  projectIds: Array<Scalars["Long"]["input"]>;
  supportServiceVersion: SupportServiceVersion;
};

/** Mutation root */
export type MutationSetUserInfoArgs = {
  email?: InputMaybe<Scalars["String"]["input"]>;
  phoneNumber?: InputMaybe<Scalars["String"]["input"]>;
  screenName?: InputMaybe<Scalars["String"]["input"]>;
};

/** Mutation root */
export type MutationSetUserPreferenceArgs = {
  prefType?: InputMaybe<PrefType>;
  value?: InputMaybe<Scalars["String"]["input"]>;
};

/** Mutation root */
export type MutationSetUsernameArgs = {
  username: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationSetWebConfigV2Args = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  projectExId: Scalars["String"]["input"];
  webConfig: WebConfigInput;
};

/** Mutation root */
export type MutationSetWebIconV2Args = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  projectExId: Scalars["String"]["input"];
  webIcon: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationSetWebWechatPayConfigArgs = {
  appVersionExId?: InputMaybe<Scalars["String"]["input"]>;
  config: WechatPayConfigInput;
  projectExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationSetWechatAutoReplyPromptArgs = {
  prompt: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationSetWechatOrderListPagePathArgs = {
  orderListPagePath: Scalars["String"]["input"];
  projectExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationSetWechatPaymentSettingsArgs = {
  projectExId: Scalars["String"]["input"];
  wechatPaymentMerchantId: Scalars["String"]["input"];
  wechatPaymentMerchantKey: Scalars["String"]["input"];
  wechatPaymentSpAppId?: InputMaybe<Scalars["String"]["input"]>;
  wechatPaymentSpMerchantId?: InputMaybe<Scalars["String"]["input"]>;
};

/** Mutation root */
export type MutationSetWechatPaymentSettingsV2Args = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  appVersionExId?: InputMaybe<Scalars["String"]["input"]>;
  projectExId: Scalars["String"]["input"];
  wechatPaymentBase64CertFileExId?: InputMaybe<Scalars["String"]["input"]>;
  wechatPaymentMerchantId: Scalars["String"]["input"];
  wechatPaymentMerchantKey: Scalars["String"]["input"];
  wechatPaymentSpAppId?: InputMaybe<Scalars["String"]["input"]>;
  wechatPaymentSpMerchantId?: InputMaybe<Scalars["String"]["input"]>;
};

/** Mutation root */
export type MutationSetWechatPrivateKeyArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  privateKeyFileExId: Scalars["String"]["input"];
  projectExId: Scalars["String"]["input"];
  wechatAppId: Scalars["String"]["input"];
  wechatAppSecret: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationSetupWechatThirdPartyAuthorizationArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  authCode: Scalars["String"]["input"];
  projectExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationSetupWxworkThirdPartyAuthorizationArgs = {
  authCode: Scalars["String"]["input"];
  projectExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationShareProjectTemplateArgs = {
  templateExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationShareProjectWithDingtalkUsersArgs = {
  corpId: Scalars["String"]["input"];
  dingtalkUserIds: Array<InputMaybe<Scalars["String"]["input"]>>;
  projectExId: Scalars["String"]["input"];
  type: CollaboratorType;
};

/** Mutation root */
export type MutationSingleSchemaMigrationArgs = {
  schemaId: Scalars["Long"]["input"];
  targetZedVersion: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationSingleUpdateWebUrlArgs = {
  projectExId?: InputMaybe<Scalars["String"]["input"]>;
};

/** Mutation root */
export type MutationSingleZTypeMigrationArgs = {
  jobType: SchemaMigrationJobType;
  schemaId: Scalars["Long"]["input"];
};

/** Mutation root */
export type MutationStopSessionArgs = {
  sessionExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationSubmitHumanEvaluationArgs = {
  input: HumanEvaluationInput;
};

/** Mutation root */
export type MutationSubmitInvoiceRequestArgs = {
  invoiceType: InvoiceType;
  memo?: InputMaybe<Scalars["String"]["input"]>;
  orderExIds: Array<Scalars["String"]["input"]>;
  profileExId: Scalars["String"]["input"];
  profileType: InvoiceProfileType;
};

/** Mutation root */
export type MutationSubmitLatestDeploymentErrorLogArgs = {
  appVersionExId?: InputMaybe<Scalars["String"]["input"]>;
  projectExId: Scalars["String"]["input"];
  status: Array<InputMaybe<DeploymentEventStatus>>;
};

/** Mutation root */
export type MutationSubmitTemplateArgs = {
  categories: Array<Scalars["String"]["input"]>;
  coverImageKey: Scalars["String"]["input"];
  description: Scalars["String"]["input"];
  price: Scalars["BigDecimal"]["input"];
  templateExId: Scalars["String"]["input"];
  trialUrl: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationSubmitTemplateToReviewV2Args = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  buildTarget: BuildTarget;
  feedbackInfo?: InputMaybe<Scalars["String"]["input"]>;
  mediaInfoList?: InputMaybe<Array<InputMaybe<MediaInfoInput>>>;
  projectExId: Scalars["String"]["input"];
  schemaExId: Scalars["String"]["input"];
  ugcDeclare?: InputMaybe<WechatMiniProgramUgcDeclareInput>;
  wechatMiniProgramAdminWechatId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationSubmitTemplateToReviewV3Args = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  buildTarget: BuildTarget;
  feedbackInfo?: InputMaybe<Scalars["String"]["input"]>;
  mediaInfoList?: InputMaybe<Array<InputMaybe<MediaInfoInput>>>;
  projectExId: Scalars["String"]["input"];
  schemaExId: Scalars["String"]["input"];
  title: Scalars["String"]["input"];
  ugcDeclare?: InputMaybe<WechatMiniProgramUgcDeclareInput>;
  wechatMiniProgramAdminWechatId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationSyncDbToProjectVersionArgs = {
  fromProjectVersionExId?: InputMaybe<Scalars["String"]["input"]>;
  projectExId: Scalars["String"]["input"];
  toProjectVersionExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationSyncSqlToSupportServiceArgs = {
  sqlList: Array<InputMaybe<Scalars["String"]["input"]>>;
};

/** Mutation root */
export type MutationTestCreateCommissionRefundArgs = {
  orderProductId: Scalars["Long"]["input"];
  paymentRefundAmount?: InputMaybe<Scalars["BigDecimal"]["input"]>;
};

/** Mutation root */
export type MutationTestDistributeCommissionArgs = {
  orderId: Scalars["Long"]["input"];
};

/** Mutation root */
export type MutationTransferAccountOwnerArgs = {
  projectExId: Scalars["String"]["input"];
  targetAccountExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationTransferProjectOwnerArgs = {
  projectExId: Scalars["String"]["input"];
  targetAccountExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationTransferProjectOwnerByAdminArgs = {
  projectExId: Scalars["String"]["input"];
  targetAccountId: Scalars["Long"]["input"];
};

/** Mutation root */
export type MutationTransferProjectOwnerForFreeProjectArgs = {
  projectExId: Scalars["String"]["input"];
  targetAccountExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationTriggerZvmRegenerationByDeploymentEnvConfigArgs = {
  deploymentEnvConfigId: Scalars["Long"]["input"];
  zvmGeneratorEnable: Scalars["Boolean"]["input"];
};

/** Mutation root */
export type MutationTruncateProjectTableArgs = {
  cascade: Scalars["Boolean"]["input"];
  projectExId: Scalars["String"]["input"];
  tableName: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationTryGetMultiClientWechatTemplateAppArgs = {
  wechatMiniProgramAppId: Scalars["Long"]["input"];
};

/** Mutation root */
export type MutationTryGetTemplateAppArgs = {
  deploymentEnvConfigId: Scalars["Long"]["input"];
  projectId: Scalars["Long"]["input"];
};

/** Mutation root */
export type MutationTryPreviewWechatBetaMiniProgramArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  projectExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationTryToTriggerAliCyclePaymentArgs = {
  subscriptionId: Scalars["Long"]["input"];
};

/** Mutation root */
export type MutationUnDeployArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  buildTarget: BuildTarget;
  projectExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationUnregisterUserByPhoneNumberArgs = {
  phoneNumber: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationUpdateAccountProfileArgs = {
  values: AccountProfileInput;
};

/** Mutation root */
export type MutationUpdateAccountTagsArgs = {
  values: Scalars["Map_String_ObjectScalar"]["input"];
};

/** Mutation root */
export type MutationUpdateAdvancedFunctionalityTutorialArgs = {
  description?: InputMaybe<Scalars["String"]["input"]>;
  functionality: Functionality;
  tutorialDocumentUrl?: InputMaybe<Scalars["String"]["input"]>;
  tutorialVideoUrl?: InputMaybe<Scalars["String"]["input"]>;
};

/** Mutation root */
export type MutationUpdateAllDailyAppAiTokenArgs = {
  projectIds?: InputMaybe<Array<InputMaybe<Scalars["Long"]["input"]>>>;
};

/** Mutation root */
export type MutationUpdateBeginnerGuideStatusArgs = {
  status: BeginnerGuideStatus;
};

/** Mutation root */
export type MutationUpdateBeginnerGuideStepIdArgs = {
  stepId: Scalars["Int"]["input"];
};

/** Mutation root */
export type MutationUpdateBeginnerGuideTutorialVersionArgs = {
  tutorialVersion?: InputMaybe<BeginnerGuideTutorialVersion>;
};

/** Mutation root */
export type MutationUpdateCdnDomainCertificateArgs = {
  certId?: InputMaybe<Scalars["String"]["input"]>;
  domain?: InputMaybe<Scalars["String"]["input"]>;
};

/** Mutation root */
export type MutationUpdateCollaboratorArgs = {
  accountExIdToUpdateCollaborator: Scalars["String"]["input"];
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  collaboratorType: CollaboratorType;
  dataVisualizerExId?: InputMaybe<Scalars["String"]["input"]>;
  projectExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationUpdateCompanyInvoiceProfileArgs = {
  exId: Scalars["String"]["input"];
  input: CompanyInvoiceProfileInputInput;
};

/** Mutation root */
export type MutationUpdateComputingPowerKitExpireTimeArgs = {
  computingPowerKitExId: Scalars["String"]["input"];
  expireTime: Scalars["OffsetDateTime"]["input"];
};

/** Mutation root */
export type MutationUpdateDeploymentEnvConfigWebUrlArgs = {
  deploymentEnvConfigId: Scalars["Long"]["input"];
};

/** Mutation root */
export type MutationUpdateDeploymentRecordArtifactsArgs = {
  artifacts: ArtifactsInput;
  deploymentRecordId?: InputMaybe<Scalars["Long"]["input"]>;
};

/** Mutation root */
export type MutationUpdateEditorComponentArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  coverImageExId?: InputMaybe<Scalars["String"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  exId: Scalars["String"]["input"];
  name?: InputMaybe<Scalars["String"]["input"]>;
  projectExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationUpdateFreeSupportServiceImageVersionArgs = {
  accountId: Scalars["Long"]["input"];
  imageVersion: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationUpdateFreeTrialCampaignTimeRangeArgs = {
  range?: InputMaybe<TimeRangeInput>;
};

/** Mutation root */
export type MutationUpdateIndividualInvoiceProfileArgs = {
  exId: Scalars["String"]["input"];
  input: IndividualInvoiceProfileInputInput;
};

/** Mutation root */
export type MutationUpdateInvoiceRequestFailureArgs = {
  failureReason: Scalars["String"]["input"];
  requestExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationUpdateInvoiceRequestSuccessArgs = {
  invoiceFileUrl: Scalars["String"]["input"];
  requestExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationUpdateNewSchemaZedVersionArgs = {
  version: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationUpdateOauth2RegisteredClientArgs = {
  clientId: Scalars["String"]["input"];
  clientSecret: Scalars["String"]["input"];
  newClientName?: InputMaybe<Scalars["String"]["input"]>;
  newRedirectUrls?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  newScopes?: InputMaybe<Array<InputMaybe<Oauth2Scope>>>;
};

/** Mutation root */
export type MutationUpdateOneProjectWechatTokenArgs = {
  projectExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationUpdateOrganizationNameArgs = {
  newOrgName: Scalars["String"]["input"];
  organizationExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationUpdateOrganizationPlanTypeArgs = {
  effectiveAt: Scalars["OffsetDateTime"]["input"];
  expireAt: Scalars["OffsetDateTime"]["input"];
  organizationId: Scalars["Long"]["input"];
  planType: PlanType;
};

/** Mutation root */
export type MutationUpdatePaidSupportServiceImageVersionArgs = {
  accountId: Scalars["Long"]["input"];
  imageVersion: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationUpdatePaymentStatusArgs = {
  orderId: Scalars["Long"]["input"];
  paymentId: Scalars["Long"]["input"];
};

/** Mutation root */
export type MutationUpdatePreCreatedProjectCapacityArgs = {
  capacity: Scalars["Long"]["input"];
  templateId?: InputMaybe<Scalars["Long"]["input"]>;
  ziroomServerType?: InputMaybe<ZiroomServerType>;
};

/** Mutation root */
export type MutationUpdateProductArgs = {
  active?: InputMaybe<Scalars["Boolean"]["input"]>;
  detail?: InputMaybe<ProductDetailInputInput>;
  productExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationUpdateProductQuantityInCartArgs = {
  productId: Scalars["Long"]["input"];
  projectExId: Scalars["String"]["input"];
  quantity: Scalars["Int"]["input"];
};

/** Mutation root */
export type MutationUpdateProjectBalancePaySettingArgs = {
  balancePaySetting: BalancePaySettingInput;
  projectExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationUpdateProjectDomainServerArgs = {
  deploymentEnvConfigExId?: InputMaybe<Scalars["String"]["input"]>;
  projectExId?: InputMaybe<Scalars["String"]["input"]>;
};

/** Mutation root */
export type MutationUpdateProjectPlanArgs = {
  expireAt?: InputMaybe<Scalars["OffsetDateTime"]["input"]>;
  projectId: Scalars["Long"]["input"];
  projectPlanType: ProjectPlanType;
};

/** Mutation root */
export type MutationUpdateProjectRoleArgs = {
  collaboratorType: CollaboratorType;
  config?: InputMaybe<ShareConfigInput>;
  projectExId: Scalars["String"]["input"];
  targetAccountExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationUpdateProjectRoleV2Args = {
  collaboratorType: CollaboratorType;
  config?: InputMaybe<ShareConfigInput>;
  projectExId: Scalars["String"]["input"];
  targetAccountExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationUpdateProjectTemplateDefaultUpgradeBannerScriptArgs = {
  script: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationUpdatePromoCodeArgs = {
  code?: InputMaybe<Scalars["String"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  exId: Scalars["String"]["input"];
  expireAt?: InputMaybe<Scalars["OffsetDateTime"]["input"]>;
  promoCodeProductRules?: InputMaybe<Array<ProductCommissionRuleDtoInput>>;
  startAt?: InputMaybe<Scalars["OffsetDateTime"]["input"]>;
};

/** Mutation root */
export type MutationUpdateRedemptionCodeArgs = {
  code?: InputMaybe<Scalars["String"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  exId: Scalars["String"]["input"];
  totalAmount?: InputMaybe<Scalars["Long"]["input"]>;
};

/** Mutation root */
export type MutationUpdateSharingUrlForViewerArgs = {
  templateExId: Scalars["String"]["input"];
  urlForViewer: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationUpdateSupportServiceImageVersionPartlyArgs = {
  imageVersion: Scalars["String"]["input"];
  ziroomIds: Array<InputMaybe<Scalars["Long"]["input"]>>;
};

/** Mutation root */
export type MutationUpdateTemplateStepAsCompletedArgs = {
  stepExId?: InputMaybe<Scalars["String"]["input"]>;
};

/** Mutation root */
export type MutationUpdateWebUrlArgs = {
  cloudConfigurationExId?: InputMaybe<Scalars["String"]["input"]>;
};

/** Mutation root */
export type MutationUpdateWebhookEndpointArgs = {
  exId: Scalars["String"]["input"];
  url?: InputMaybe<Scalars["String"]["input"]>;
};

/** Mutation root */
export type MutationUpdateWechatAutoReplyArgs = {
  contents: Array<WechatAutoReplyContentInputInput>;
  exId: Scalars["String"]["input"];
  name: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationUpdateWechatAutoReplyEventRuleArgs = {
  eventType: WechatAutoReplyEventType;
  exId: Scalars["String"]["input"];
  replyExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationUpdateWechatAutoReplyMessageRuleArgs = {
  exId: Scalars["String"]["input"];
  fallback: Scalars["Boolean"]["input"];
  keywordAndMatchTypes?: InputMaybe<Array<KeywordAndMatchTypeInput>>;
  name: Scalars["String"]["input"];
  replyExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationUpdateWechatMiniProgramAppDeploymentRecordArtifactsArgs = {
  artifacts: WechatMiniProgramAppArtifactsInput;
  deploymentRecordId?: InputMaybe<Scalars["Long"]["input"]>;
};

/** Mutation root */
export type MutationUpdateWechatTokenByAppIdArgs = {
  authorizerAppId?: InputMaybe<Scalars["String"]["input"]>;
};

/** Mutation root */
export type MutationUpdateZedStateArgs = {
  key?: InputMaybe<Scalars["String"]["input"]>;
  operator: KeyValueOperator;
  platform: Platform;
  projectExId: Scalars["String"]["input"];
  value?: InputMaybe<Scalars["Json"]["input"]>;
};

/** Mutation root */
export type MutationUpdateZiroomServerDeploymentByIdArgs = {
  ziroomServerId: Scalars["Long"]["input"];
};

/** Mutation root */
export type MutationUpgradeProjectPlanForOrganizationArgs = {
  projectExId: Scalars["String"]["input"];
  projectPlanType: ProjectPlanType;
};

/** Mutation root */
export type MutationUpgradeSchemaZedVersionForZvmArgs = {
  domainName: Scalars["String"]["input"];
  schemaVersion: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationUploadCertificateArgs = {
  entity?: InputMaybe<CertificateEntityInput>;
};

/** Mutation root */
export type MutationVacuumFullProjectTableArgs = {
  projectExId: Scalars["String"]["input"];
  tableName: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationValidateAndDeployArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  projectExId: Scalars["String"]["input"];
  schemaExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationValidateSchemaIdIsLatestArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  projectExId: Scalars["String"]["input"];
  schemaExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationVerifyBetaWeappArgs = {
  projectExId: Scalars["String"]["input"];
  verifyInfo: BetaWeappVerifyInfoInput;
};

/** Mutation root */
export type MutationVideoPresignedUrlArgs = {
  acl?: InputMaybe<CannedAccessControlList>;
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  appVersionExId?: InputMaybe<Scalars["String"]["input"]>;
  projectExId: Scalars["String"]["input"];
  videoFormat: MediaFormat;
  videoMd5Base64: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationWebOwnershipVerificationPresignedUrlArgs = {
  acl?: InputMaybe<CannedAccessControlList>;
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  appVersionExId?: InputMaybe<Scalars["String"]["input"]>;
  format: MediaFormat;
  md5Base64: Scalars["String"]["input"];
  name?: InputMaybe<Scalars["String"]["input"]>;
  projectExId: Scalars["String"]["input"];
  suffix?: InputMaybe<Scalars["String"]["input"]>;
};

/** Mutation root */
export type MutationWithdrawLatestAuditArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  projectExId: Scalars["String"]["input"];
};

/** Mutation root */
export type MutationZTypeMigrationArgs = {
  jobType: SchemaMigrationJobType;
};

/** Mutation root */
export type MutationZiroomGcArgs = {
  cloudConfigurationId: Scalars["Long"]["input"];
};

/** Mutation root */
export type MutationZvmGeneratorCallbackArgs = {
  errorDetail?: InputMaybe<Scalars["Json"]["input"]>;
  failedPageByUrls?: InputMaybe<Array<InputMaybe<FailedPageByUrlInput>>>;
  message?: InputMaybe<Scalars["Json"]["input"]>;
  pageNum: Scalars["Int"]["input"];
  status: TriggerZvmGeneratorStatus;
  triggerZvmGeneratorRecordId: Scalars["Long"]["input"];
};

export type NodeTemplateVariable = {
  __typename: "NodeTemplateVariable";
  defaultValue?: Maybe<Scalars["Json"]["output"]>;
  description?: Maybe<Scalars["String"]["output"]>;
  name?: Maybe<Scalars["String"]["output"]>;
  required: Scalars["Boolean"]["output"];
  type?: Maybe<ColumnType>;
};

export type NodeTemplateVariableInput = {
  defaultValue?: InputMaybe<Scalars["Json"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  required: Scalars["Boolean"]["input"];
  type?: InputMaybe<ColumnType>;
};

export enum OAuth2AuthorizationGrantType {
  AuthorizationCode = "AUTHORIZATION_CODE",
  ClientCredentials = "CLIENT_CREDENTIALS",
  JwtBearer = "JWT_BEARER",
  Password = "PASSWORD",
}

export enum OAuth2ClientAuthenticationMethod {
  ClientSecretBasic = "CLIENT_SECRET_BASIC",
  ClientSecretJwt = "CLIENT_SECRET_JWT",
  ClientSecretPost = "CLIENT_SECRET_POST",
  PrivateKeyJwt = "PRIVATE_KEY_JWT",
}

export type OAuth2Config = SsoConfig & {
  __typename: "OAuth2Config";
  enabled: Scalars["Boolean"]["output"];
  expirationDuration?: Maybe<Scalars["Long"]["output"]>;
  id: Scalars["String"]["output"];
  protocol?: Maybe<SsoProtocol>;
  provider: OAuth2ProviderConfig;
  providerName: Scalars["String"]["output"];
  registration: OAuth2RegistrationConfig;
  type: SsoType;
};

export enum OAuth2Provider {
  Alipay = "ALIPAY",
  Dingtalk = "DINGTALK",
  Facebook = "FACEBOOK",
  Feishu = "FEISHU",
  Google = "GOOGLE",
  Qq = "QQ",
  Wechat = "WECHAT",
  WechatServiceAccount = "WECHAT_SERVICE_ACCOUNT",
}

export type OAuth2ProviderConfig = {
  __typename: "OAuth2ProviderConfig";
  authorizationUri: Scalars["String"]["output"];
  issuerUri?: Maybe<Scalars["String"]["output"]>;
  jwkSetUri?: Maybe<Scalars["String"]["output"]>;
  tokenUri: Scalars["String"]["output"];
  userIdAttribute: Scalars["String"]["output"];
  userInfoUri: Scalars["String"]["output"];
};

export type OAuth2RegistrationConfig = {
  __typename: "OAuth2RegistrationConfig";
  authorizationGrantType: OAuth2AuthorizationGrantType;
  clientAuthenticationMethod: OAuth2ClientAuthenticationMethod;
  clientId: Scalars["String"]["output"];
  clientSecret: Scalars["String"]["output"];
  extraLoginParameterNameAndDefaultValues?: Maybe<
    Scalars["Map_String_VariableScalar"]["output"]
  >;
  loginUri: Scalars["String"]["output"];
  redirectUri: Scalars["String"]["output"];
  scope: Array<Maybe<Scalars["String"]["output"]>>;
};

export type Oauth2RegisteredClient = {
  __typename: "Oauth2RegisteredClient";
  clientId?: Maybe<Scalars["String"]["output"]>;
  clientIdIssuedAt?: Maybe<Scalars["Instant"]["output"]>;
  clientName?: Maybe<Scalars["String"]["output"]>;
  clientSecret?: Maybe<Scalars["String"]["output"]>;
  redirectUrls?: Maybe<Array<Maybe<Scalars["String"]["output"]>>>;
  scopes?: Maybe<Array<Maybe<Scalars["String"]["output"]>>>;
};

export enum Oauth2Scope {
  Openid = "OPENID",
  Profile = "PROFILE",
}

export type OrderCreationInput = {
  currency: Currency;
  cycle: PaymentCycle;
  purchaserEmail: Scalars["String"]["input"];
  purchaserName: Scalars["String"]["input"];
  purchaserPhoneNumber: Scalars["String"]["input"];
  type: PlanType;
};

export type OrderProduct = {
  __typename: "OrderProduct";
  order?: Maybe<PurchaseOrder>;
  product?: Maybe<Product>;
  productDetails?: Maybe<PurchasedProductDetail>;
};

export enum OrderStatus {
  Cancelled = "CANCELLED",
  Pending = "PENDING",
  Successful = "SUCCESSFUL",
}

export type Organization = {
  __typename: "Organization";
  capabilities: Array<CapabilityAndLimit>;
  createdAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  displayName?: Maybe<Scalars["String"]["output"]>;
  exId: Scalars["String"]["output"];
  name?: Maybe<Scalars["String"]["output"]>;
  ownerName?: Maybe<Scalars["String"]["output"]>;
  permissionEnabled: Scalars["Boolean"]["output"];
  permissionRoleLimit: Scalars["Int"]["output"];
  planExpireAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  planType?: Maybe<PlanType>;
};

export enum OrganizationExpirationStatus {
  Expired = "EXPIRED",
  ExpiringSoon = "EXPIRING_SOON",
  InExpirationBursting = "IN_EXPIRATION_BURSTING",
  NotExpiringSoon = "NOT_EXPIRING_SOON",
}

export type OrganizationMember = {
  __typename: "OrganizationMember";
  createdAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  memberAccountId: Scalars["Long"]["output"];
  organizationId: Scalars["Long"]["output"];
  role: MemberRole;
  updatedAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
};

export type OttPayConfig = {
  __typename: "OttPayConfig";
  callbackUrl?: Maybe<Scalars["String"]["output"]>;
  merchantId?: Maybe<Scalars["String"]["output"]>;
  merchantKey?: Maybe<Scalars["String"]["output"]>;
  operatorId?: Maybe<Scalars["String"]["output"]>;
};

export type PageInfo = {
  __typename: "PageInfo";
  endCursor?: Maybe<ConnectionCursor>;
  hasNextPage: Scalars["Boolean"]["output"];
  hasPreviousPage: Scalars["Boolean"]["output"];
  startCursor?: Maybe<ConnectionCursor>;
};

export type Pair_CouponTemplate_Long = {
  __typename: "Pair_CouponTemplate_Long";
  key?: Maybe<CouponTemplate>;
  left?: Maybe<CouponTemplate>;
  right?: Maybe<Scalars["Long"]["output"]>;
  value?: Maybe<Scalars["Long"]["output"]>;
};

export type ParentButtonInput = {
  name?: InputMaybe<Scalars["String"]["input"]>;
  subButtons?: InputMaybe<Array<InputMaybe<MenuButtonInputInput>>>;
};

export type Payment = {
  __typename: "Payment";
  amount?: Maybe<Scalars["BigDecimal"]["output"]>;
  createdAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  currency?: Maybe<Currency>;
  outTradeNo?: Maybe<Scalars["String"]["output"]>;
  paymentType?: Maybe<PaymentType>;
  status?: Maybe<PaymentStatus>;
  transactionNo?: Maybe<Scalars["String"]["output"]>;
  updatedAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
};

export enum PaymentChannel {
  App = "APP",
  MiniProgram = "MINI_PROGRAM",
  Web = "WEB",
}

export enum PaymentConfigVersion {
  V1 = "V1",
  V2 = "V2",
}

export enum PaymentCycle {
  Monthly = "MONTHLY",
  Quarterly = "QUARTERLY",
  Yearly = "YEARLY",
}

export type PaymentCyclePrice = {
  __typename: "PaymentCyclePrice";
  currency?: Maybe<Currency>;
  displayPricePerMonth?: Maybe<Scalars["BigDecimal"]["output"]>;
  paymentCycle?: Maybe<PaymentCycle>;
  price?: Maybe<Scalars["BigDecimal"]["output"]>;
};

export enum PaymentMethod {
  OneTimePayment = "ONE_TIME_PAYMENT",
  RecurringPayment = "RECURRING_PAYMENT",
}

export enum PaymentPageType {
  Iframe = "IFRAME",
  Url = "URL",
}

export type PaymentResult = {
  orderExId?: Maybe<Scalars["String"]["output"]>;
  paymentExId?: Maybe<Scalars["String"]["output"]>;
  paymentType?: Maybe<PaymentType>;
};

export enum PaymentStatus {
  Cancelled = "CANCELLED",
  Created = "CREATED",
  CreateFailed = "CREATE_FAILED",
  Failed = "FAILED",
  PartiallyRefunded = "PARTIALLY_REFUNDED",
  Pending = "PENDING",
  Refunded = "REFUNDED",
  Refunding = "REFUNDING",
  RefundFailed = "REFUND_FAILED",
  Successful = "SUCCESSFUL",
}

export enum PaymentType {
  AliPay = "ALI_PAY",
  BalancePay = "BALANCE_PAY",
  StripePay = "STRIPE_PAY",
  WechatPay = "WECHAT_PAY",
}

export type PaymentTypeAndMethod = {
  __typename: "PaymentTypeAndMethod";
  paymentMethod: PaymentMethod;
  paymentType: PaymentType;
};

export enum Permission {
  AccountRoleCrud = "ACCOUNT_ROLE_CRUD",
  BackendOnly = "BACKEND_ONLY",
  BillingManage = "BILLING_MANAGE",
  CloudConfigurationCrud = "CLOUD_CONFIGURATION_CRUD",
  ComponentTemplateCrud = "COMPONENT_TEMPLATE_CRUD",
  DangerousControl = "DANGEROUS_CONTROL",
  EducationalDiscount = "EDUCATIONAL_DISCOUNT",
  FeatureControl = "FEATURE_CONTROL",
  FeatureManagement = "FEATURE_MANAGEMENT",
  Hashcode = "HASHCODE",
  ImitateAccount = "IMITATE_ACCOUNT",
  ModuleCrud = "MODULE_CRUD",
  Oauth2ClientRegistration = "OAUTH2_CLIENT_REGISTRATION",
  ProjectTemplateCrud = "PROJECT_TEMPLATE_CRUD",
  RecallMessage = "RECALL_MESSAGE",
  RedeemCode = "REDEEM_CODE",
  RedemptionCodeCrud = "REDEMPTION_CODE_CRUD",
  RoleCrud = "ROLE_CRUD",
  SchemaCopy = "SCHEMA_COPY",
  SendBatchMessages = "SEND_BATCH_MESSAGES",
  SendMessage = "SEND_MESSAGE",
  TemplateManage = "TEMPLATE_MANAGE",
  TutorialManagement = "TUTORIAL_MANAGEMENT",
  WechatAudit = "WECHAT_AUDIT",
  WechatPlatformManage = "WECHAT_PLATFORM_MANAGE",
  ZedAccess = "ZED_ACCESS",
}

export type PhoneNumberAuthConfig = {
  __typename: "PhoneNumberAuthConfig";
  enabled: Scalars["Boolean"]["output"];
  expirationDuration?: Maybe<Scalars["Long"]["output"]>;
};

export enum PhoneNumberBindingState {
  Bound = "BOUND",
  Merging = "MERGING",
  Unbound = "UNBOUND",
}

export type PipelinePlatformAndStatus = {
  __typename: "PipelinePlatformAndStatus";
  pipelinePlatformStatus?: Maybe<PipelinePlatformStatus>;
  platform?: Maybe<BuildTarget>;
};

export enum PipelinePlatformStatus {
  Canceled = "CANCELED",
  Deploying = "DEPLOYING",
  Failed = "FAILED",
  Finished = "FINISHED",
}

export type PlanDetail = ProductDetail & {
  __typename: "PlanDetail";
  chineseName?: Maybe<Scalars["String"]["output"]>;
  currency?: Maybe<Currency>;
  englishName?: Maybe<Scalars["String"]["output"]>;
  paymentCycle?: Maybe<PaymentCycle>;
  planType?: Maybe<PlanType>;
  price?: Maybe<Scalars["BigDecimal"]["output"]>;
};

export type PlanFeature = {
  __typename: "PlanFeature";
  featureName?: Maybe<Scalars["String"]["output"]>;
};

export enum PlanFeatureCategory {
  Building = "BUILDING",
  Capability = "CAPABILITY",
  Publishing = "PUBLISHING",
  Resource = "RESOURCE",
  Support = "SUPPORT",
}

export enum PlanType {
  Business = "BUSINESS",
  Coffee = "COFFEE",
  Commercial = "COMMERCIAL",
  Corporate = "CORPORATE",
  Employee = "EMPLOYEE",
  Enterprise = "ENTERPRISE",
  Free = "FREE",
  Isv = "ISV",
  MomenBusiness = "MOMEN_BUSINESS",
  MomenCorporate = "MOMEN_CORPORATE",
  MomenEmployee = "MOMEN_EMPLOYEE",
  MomenEnterprise = "MOMEN_ENTERPRISE",
  MomenFree = "MOMEN_FREE",
  MomenPersonal = "MOMEN_PERSONAL",
  Personal = "PERSONAL",
  Premium = "PREMIUM",
  Pro = "PRO",
  Team = "TEAM",
  Ultimate = "ULTIMATE",
  ZionCorporate = "ZION_CORPORATE",
  ZionEducation = "ZION_EDUCATION",
}

export type PlanTypeInfo = {
  __typename: "PlanTypeInfo";
  capabilities: Array<CapabilityAndLimit>;
  categoryAndFeatures?: Maybe<Array<CategoryAndFeatures>>;
  chineseName: Scalars["String"]["output"];
  collaboratorLimit: Scalars["Int"]["output"];
  dauLimit: Scalars["Int"]["output"];
  englishName: Scalars["String"]["output"];
  id?: Maybe<Scalars["Long"]["output"]>;
  nextLevelPlan?: Maybe<PlanType>;
  noWatermarkLimit: Scalars["Int"]["output"];
  planChineseDescription: Scalars["String"]["output"];
  planEnglishDescription: Scalars["String"]["output"];
  planType?: Maybe<PlanType>;
  price: Array<PaymentCyclePrice>;
};

export enum Platform {
  Mobile = "MOBILE",
  Web = "WEB",
  Wechat = "WECHAT",
}

export type PlatformAuditEnabledState = {
  __typename: "PlatformAuditEnabledState";
  auditEnabled: Scalars["Boolean"]["output"];
  platform: Platform;
};

export enum PopupType {
  AiPromotion = "AI_PROMOTION",
  OrganizationPlanMigration = "ORGANIZATION_PLAN_MIGRATION",
  ProjectCreation = "PROJECT_CREATION",
  WechatMiniProgramRegistration = "WECHAT_MINI_PROGRAM_REGISTRATION",
}

export enum PrefType {
  DynamicDataShowFullPath = "DYNAMIC_DATA_SHOW_FULL_PATH",
  Language = "LANGUAGE",
  MaterialDisplay = "MATERIAL_DISPLAY",
}

export type PreferenceEntity = {
  __typename: "PreferenceEntity";
  prefType?: Maybe<PrefType>;
  value?: Maybe<Scalars["String"]["output"]>;
};

export type PreviewBetaResponse = {
  __typename: "PreviewBetaResponse";
  code?: Maybe<Scalars["String"]["output"]>;
  success: Scalars["Boolean"]["output"];
};

export type PriceDetails = {
  __typename: "PriceDetails";
  planPrice?: Maybe<Scalars["BigDecimal"]["output"]>;
  serverPrice?: Maybe<Scalars["BigDecimal"]["output"]>;
  totalPrice?: Maybe<Scalars["BigDecimal"]["output"]>;
};

export type PriceInfo = {
  __typename: "PriceInfo";
  currency: Currency;
  price: Scalars["BigDecimal"]["output"];
};

export type Product = {
  __typename: "Product";
  active: Scalars["Boolean"]["output"];
  details?: Maybe<ProductDetail>;
  exId?: Maybe<Scalars["String"]["output"]>;
  id?: Maybe<Scalars["Long"]["output"]>;
  type?: Maybe<ProductType>;
};

export type ProductAndPurchasedDetail = {
  __typename: "ProductAndPurchasedDetail";
  product: Product;
  purchasedProductDetail: PurchasedProductDetail;
};

export type ProductCommissionRuleDtoInput = {
  commissionRuleDto: CommissionRuleDtoInput;
  rootProductType: ProductType;
};

export type ProductDetail = {
  chineseName?: Maybe<Scalars["String"]["output"]>;
  currency?: Maybe<Currency>;
  englishName?: Maybe<Scalars["String"]["output"]>;
  price?: Maybe<Scalars["BigDecimal"]["output"]>;
};

export type ProductDetailAndRenewal = {
  __typename: "ProductDetailAndRenewal";
  paymentExId?: Maybe<Scalars["String"]["output"]>;
  productDetail?: Maybe<PurchasedProjectPlanDetailInterface>;
  projectExId?: Maybe<Scalars["String"]["output"]>;
  renewal: Scalars["Boolean"]["output"];
};

export type ProductDetailInputInput = {
  codeComponentPackage?: InputMaybe<CodeComponentPackageProductDetailInputInput>;
};

export enum ProductType {
  AdditionalClientApp = "ADDITIONAL_CLIENT_APP",
  AdditionalClientAppWithClonedSchema = "ADDITIONAL_CLIENT_APP_WITH_CLONED_SCHEMA",
  AiAssistant = "AI_ASSISTANT",
  CodeComponentPackage = "CODE_COMPONENT_PACKAGE",
  ComputingPowerAddon = "COMPUTING_POWER_ADDON",
  ComputingPowerKit = "COMPUTING_POWER_KIT",
  FreeTrialProjectPlan = "FREE_TRIAL_PROJECT_PLAN",
  FreeTrialProjectPlanWithClonedSchema = "FREE_TRIAL_PROJECT_PLAN_WITH_CLONED_SCHEMA",
  FreeTrialProjectPlanWithTemplate = "FREE_TRIAL_PROJECT_PLAN_WITH_TEMPLATE",
  MultiClientProjectPlan = "MULTI_CLIENT_PROJECT_PLAN",
  Plan = "PLAN",
  ProjectPlan = "PROJECT_PLAN",
  ProjectPlanWithClonedSchema = "PROJECT_PLAN_WITH_CLONED_SCHEMA",
  ProjectPlanWithTemplateV2 = "PROJECT_PLAN_WITH_TEMPLATE_V2",
  TechnicalSupport = "TECHNICAL_SUPPORT",
}

export type ProductTypeDetail = {
  productType?: Maybe<ProductType>;
};

export type ProductTypeDetailsDtoInput = {
  additionalClientAppProductDetails?: InputMaybe<
    Array<InputMaybe<AdditionalClientAppProductTypeDetailInput>>
  >;
  computingPowerAddonProductDetails?: InputMaybe<
    Array<InputMaybe<ComputingPowerAddonProductTypeDetailInput>>
  >;
  computingPowerKitProductDetails?: InputMaybe<
    Array<InputMaybe<ComputingPowerKitProductTypeDetailInput>>
  >;
  projectPlanProductDetails?: InputMaybe<
    Array<InputMaybe<ProjectPlanProductTypeDetailInput>>
  >;
};

export type Project = App & {
  __typename: "Project";
  additional: Scalars["Boolean"]["output"];
  adminToken?: Maybe<Scalars["String"]["output"]>;
  alipaySubscriptionForProjectPlan?: Maybe<AlipaySubscription>;
  allowCopyToOtherProjects: Scalars["Boolean"]["output"];
  androidApkLink?: Maybe<Scalars["String"]["output"]>;
  androidApkQRCodeBase64?: Maybe<Scalars["String"]["output"]>;
  appExId?: Maybe<Scalars["String"]["output"]>;
  appList?: Maybe<Array<App>>;
  appType?: Maybe<AppType>;
  appWithValidationErrorMessagesList?: Maybe<
    Array<AppWithValidationErrorMessages>
  >;
  auditStatus?: Maybe<AuditStatus>;
  authenticationConfig?: Maybe<AuthenticationConfig>;
  brandingRemoved: Scalars["Boolean"]["output"];
  callbackConfigUrlPrefix?: Maybe<Scalars["String"]["output"]>;
  canMigrateToHigherComputingPowerZiroom?: Maybe<Scalars["Boolean"]["output"]>;
  canPublishWebToProd: Scalars["Boolean"]["output"];
  capabilities?: Maybe<Array<Maybe<CapabilityAndLimit>>>;
  category?: Maybe<ProjectContentCategory>;
  cloneable: Scalars["Boolean"]["output"];
  collaboratorType: CollaboratorType;
  collaboratorTypeByLevel?: Maybe<
    Scalars["Map_CollaboratorLevel_CollaboratorTypeScalar"]["output"]
  >;
  collaborators?: Maybe<Array<Maybe<Account>>>;
  collaboratorsAndType?: Maybe<Array<AccountAndCollaborateType>>;
  createdAt: Scalars["OffsetDateTime"]["output"];
  dataVisualizers?: Maybe<Array<DataVisualizer>>;
  debugScriptUrl?: Maybe<Scalars["String"]["output"]>;
  deleted: Scalars["Boolean"]["output"];
  deployedDataModel?: Maybe<Scalars["Json"]["output"]>;
  deploymentEnvConfigs?: Maybe<Array<Maybe<DeploymentEnvConfig>>>;
  deploymentEnvStatus?: Maybe<DeploymentEnvStatus>;
  deploymentStatus?: Maybe<DeploymentEventStatus>;
  devEnvironmentEnable: Scalars["Boolean"]["output"];
  exId: Scalars["String"]["output"];
  expireAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  forBeginnerGuide: Scalars["Boolean"]["output"];
  hasBeenAuthorizedByWechatMiniProgram: Scalars["Boolean"]["output"];
  hasBindCloudConfiguration: Scalars["Boolean"]["output"];
  hasCustomDomain?: Maybe<Scalars["Boolean"]["output"]>;
  hasPublished: Scalars["Boolean"]["output"];
  highestPurchasedProjectPlanType?: Maybe<ProjectPlanType>;
  importedCodeComponents?: Maybe<Array<Maybe<ProjectCodeComponent>>>;
  inActiveSingleTenantComputingPowerKit?: Maybe<Scalars["Boolean"]["output"]>;
  isExpired: Scalars["Boolean"]["output"];
  isRenewable: Scalars["Boolean"]["output"];
  lastAllPipelinePlatformStatus: Array<BuildTargetPipelineStatus>;
  lastCompletedPipelinePlatformStatus: Array<BuildTargetPipelineStatus>;
  lastDeployedDataModel?: Maybe<Scalars["Json"]["output"]>;
  lastDeployedProjectConfig?: Maybe<ProjectConfig>;
  lastDeployedServerSchema?: Maybe<Scalars["Json"]["output"]>;
  lastDeployedServerSchemaExId?: Maybe<Scalars["String"]["output"]>;
  lastOpenedAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  latestSchema?: Maybe<CrdtSchema>;
  logConfig?: Maybe<ZedLogConfig>;
  mobileApps?: Maybe<Connection_MobileApp>;
  name: Scalars["String"]["output"];
  organization?: Maybe<Organization>;
  ownedCodeComponents?: Maybe<Array<Maybe<ProjectCodeComponent>>>;
  ownedPurchasedCodeComponents?: Maybe<Array<Maybe<ProjectCodeComponent>>>;
  paymentMethodForProjectPlan?: Maybe<PaymentMethod>;
  projectAccounts?: Maybe<Array<Maybe<ProjectAccount>>>;
  projectConfig?: Maybe<ProjectConfig>;
  projectExId: Scalars["String"]["output"];
  projectName: Scalars["String"]["output"];
  projectOwner?: Maybe<Scalars["String"]["output"]>;
  projectPlan: ProjectPlanInfo;
  projectResourceSufficient?: Maybe<Scalars["Boolean"]["output"]>;
  projectSpace?: Maybe<ProjectSpace>;
  readProjectAccounts?: Maybe<Array<Maybe<AccountReadApp>>>;
  relatedTemplate?: Maybe<ProjectTemplate>;
  renewInfoForProjectPlan?: Maybe<RenewInfoV2>;
  rpsStatsInLast30Days?: Maybe<ProjectRpsStatsInLast30Days>;
  schemaExId?: Maybe<Scalars["String"]["output"]>;
  sharePermission: SharePermission;
  simplifiedCaughtUpServerSchema: SimplifiedServerSchema;
  ssoLoginUri?: Maybe<Scalars["String"]["output"]>;
  ssoRedirectUri?: Maybe<Scalars["String"]["output"]>;
  taroLink?: Maybe<Scalars["String"]["output"]>;
  type?: Maybe<ProjectType>;
  updatedAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  vectorStorageSupported: Scalars["Boolean"]["output"];
  webApps?: Maybe<Connection_WebApp>;
  webCustomDomainCnameRecords?: Maybe<Array<CustoDomainCnameRecord>>;
  webCustomDomainSslReady: Scalars["Boolean"]["output"];
  webCustomDomainStatus?: Maybe<CustomDomainConfigStatus>;
  webFreeProdDomain?: Maybe<Scalars["String"]["output"]>;
  webProdDomain?: Maybe<Scalars["String"]["output"]>;
  webZvmBetaQRCodeBase64?: Maybe<Scalars["String"]["output"]>;
  webZvmBetaSchemaExId?: Maybe<Scalars["String"]["output"]>;
  webZvmBetaUrl?: Maybe<Scalars["String"]["output"]>;
  webZvmQRCodeBase64?: Maybe<Scalars["String"]["output"]>;
  webZvmSchemaExId?: Maybe<Scalars["String"]["output"]>;
  webZvmUrl?: Maybe<Scalars["String"]["output"]>;
  wechatMiniAppLink?: Maybe<Scalars["String"]["output"]>;
  wechatMiniAppPreviewTime?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  wechatMiniAppPreviewVersion?: Maybe<Scalars["String"]["output"]>;
  wechatMiniAppQRCodeBase64?: Maybe<Scalars["String"]["output"]>;
  wechatMiniAppQRCodeLink?: Maybe<Scalars["String"]["output"]>;
  wechatMiniProgramApps?: Maybe<Connection_WechatMiniProgramApp>;
  zedStateByPlatform: Scalars["Map_Platform_JsonNodeScalar"]["output"];
  zeroSubscriptionUrl?: Maybe<Scalars["String"]["output"]>;
  zeroUrl?: Maybe<Scalars["String"]["output"]>;
};

export type ProjectAppWithValidationErrorMessagesListArgs = {
  appVersionExId?: InputMaybe<Scalars["String"]["input"]>;
};

export type ProjectDeploymentEnvConfigsArgs = {
  userDeploymentEnvironments?: InputMaybe<
    Array<InputMaybe<UserDeploymentEnvironment>>
  >;
};

export type ProjectImportedCodeComponentsArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  platform: Platform;
};

export type ProjectMobileAppsArgs = {
  paginator?: InputMaybe<ConnectionPaginatorInput>;
};

export type ProjectOwnedPurchasedCodeComponentsArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  platform: Platform;
};

export type ProjectSsoRedirectUriArgs = {
  protocol: SsoProtocol;
};

export type ProjectWebAppsArgs = {
  paginator?: InputMaybe<ConnectionPaginatorInput>;
};

export type ProjectWechatMiniProgramAppsArgs = {
  paginator?: InputMaybe<ConnectionPaginatorInput>;
};

export type ProjectAccount = {
  __typename: "ProjectAccount";
  account: Account;
  collaboratorType?: Maybe<CollaboratorType>;
  createdAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  id: Scalars["Long"]["output"];
  permission?: Maybe<SharePermission>;
  project: Project;
  updatedAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  zedStateByPlatform?: Maybe<Scalars["Map_Platform_JsonNodeScalar"]["output"]>;
};

export type ProjectCodeComponent = {
  __typename: "ProjectCodeComponent";
  appExId?: Maybe<Scalars["String"]["output"]>;
  codeComponentPackage?: Maybe<CodeComponentPackage>;
  enabled?: Maybe<Scalars["Boolean"]["output"]>;
  exId?: Maybe<Scalars["String"]["output"]>;
  platform?: Maybe<Platform>;
  purchased?: Maybe<Scalars["Boolean"]["output"]>;
  version?: Maybe<Scalars["String"]["output"]>;
};

export type ProjectComment = {
  __typename: "ProjectComment";
  appId?: Maybe<Scalars["Long"]["output"]>;
  content: Scalars["String"]["output"];
  createdAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  createdByAccount: Account;
  deletedAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  exId: Scalars["String"]["output"];
  project: Project;
  resolvedAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  status: ProjectCommentStatus;
  targetId: Scalars["String"]["output"];
  targetType: ProjectCommentTargetType;
  updatedAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
};

export type ProjectCommentEvent = {
  __typename: "ProjectCommentEvent";
  comment: ProjectComment;
  eventType: ProjectCommentEventType;
};

export enum ProjectCommentEventType {
  CommentInserted = "COMMENT_INSERTED",
  CommentUpdated = "COMMENT_UPDATED",
}

export enum ProjectCommentStatus {
  Deleted = "DELETED",
  Open = "OPEN",
  Resolved = "RESOLVED",
}

export enum ProjectCommentTargetType {
  ActionFlow = "ACTION_FLOW",
  Api = "API",
  Component = "COMPONENT",
  DataModelTable = "DATA_MODEL_TABLE",
  Global = "GLOBAL",
  Zai = "ZAI",
}

export type ProjectConfig = {
  __typename: "ProjectConfig";
  aiConfigs?: Maybe<Array<Maybe<AzureOpenAiConfig>>>;
  aliPayConfig?: Maybe<AliPayConfig>;
  aliyunSmsConfig?: Maybe<AliyunSmsConfig>;
  authenticationConfig?: Maybe<AuthenticationConfig>;
  balancePaySetting?: Maybe<BalancePaySetting>;
  businessLicenseImageExId?: Maybe<Scalars["String"]["output"]>;
  conditionConfig?: Maybe<ConditionConfig>;
  emailConfig?: Maybe<EmailConfig>;
  eventTypeByEnabled?: Maybe<
    Scalars["Map_LogEventType_BooleanScalar"]["output"]
  >;
  hasuraConfig?: Maybe<HasuraConfig>;
  mallBookConfig?: Maybe<MallBookConfig>;
  mcConfig?: Maybe<McConfig>;
  mingdaoApiConfig?: Maybe<MingdaoApiConfig>;
  mobileConfig?: Maybe<MobileConfig>;
  mobileWebConfig?: Maybe<MobileWebConfig>;
  ottPayConfig?: Maybe<OttPayConfig>;
  registerToken?: Maybe<Scalars["String"]["output"]>;
  stripePayConfig?: Maybe<StripePayConfig>;
  supportedPlatforms: Array<Platform>;
  thirdPartyApiConfig?: Maybe<ThirdPartyApiConfig>;
  webConfig?: Maybe<WebConfig>;
  webOwnershipVerificationFileIds?: Maybe<
    Array<Maybe<Scalars["String"]["output"]>>
  >;
  wechatAppConfig?: Maybe<WechatAppConfig>;
  wechatPayConfig?: Maybe<WechatPayConfig>;
  wechatWebConfig?: Maybe<WechatWebConfig>;
  zeroSchemaConfig?: Maybe<ZeroSchemaConfig>;
};

export enum ProjectContentCategory {
  Ai = "AI",
  Cms = "CMS",
  ECommerce = "E_COMMERCE",
  Fintech = "FINTECH",
  HealthCare = "HEALTH_CARE",
  LogisticsAndDelivery = "LOGISTICS_AND_DELIVERY",
  OnlineEducation = "ONLINE_EDUCATION",
  Others = "OTHERS",
  RestaurantBooking = "RESTAURANT_BOOKING",
  SocialMedia = "SOCIAL_MEDIA",
  TravelBooking = "TRAVEL_BOOKING",
  WebsiteHomepage = "WEBSITE_HOMEPAGE",
}

export type ProjectCreationResult = {
  __typename: "ProjectCreationResult";
  projectExId?: Maybe<Scalars["String"]["output"]>;
  status?: Maybe<ProjectCreationStatus>;
};

export type ProjectCreationSourceDetail = {
  __typename: "ProjectCreationSourceDetail";
  type?: Maybe<ProjectCreationSourceType>;
};

export type ProjectCreationSourceInputInput = {
  clonedProjectDetail?: InputMaybe<CreateProjectFromClonedProjectInputInput>;
  clonedSchemaDetail?: InputMaybe<CreateProjectFromClonedSchemaInputInput>;
  templateDetail?: InputMaybe<CreateProjectFromTemplateInputInput>;
  type: ProjectCreationSourceType;
};

export enum ProjectCreationSourceType {
  Blank = "BLANK",
  ClonedProject = "CLONED_PROJECT",
  ClonedSchema = "CLONED_SCHEMA",
  Template = "TEMPLATE",
}

export enum ProjectCreationStatus {
  Completed = "COMPLETED",
  Failed = "FAILED",
  Processing = "PROCESSING",
}

export type ProjectPlanDetail = ProductDetail & {
  __typename: "ProjectPlanDetail";
  chineseName?: Maybe<Scalars["String"]["output"]>;
  currency?: Maybe<Currency>;
  englishName?: Maybe<Scalars["String"]["output"]>;
  paymentCycle?: Maybe<PaymentCycle>;
  price?: Maybe<Scalars["BigDecimal"]["output"]>;
  projectPlanType?: Maybe<ProjectPlanType>;
};

export type ProjectPlanExpirationContent = DynamicMessageContent & {
  __typename: "ProjectPlanExpirationContent";
  chineseCapabilityDowngradeMessages?: Maybe<
    Array<Maybe<Scalars["String"]["output"]>>
  >;
  chineseResourceDowngradeMessages?: Maybe<
    Array<Maybe<Scalars["String"]["output"]>>
  >;
  englishCapabilityDowngradeMessages?: Maybe<
    Array<Maybe<Scalars["String"]["output"]>>
  >;
  englishResourceDowngradeMessages?: Maybe<
    Array<Maybe<Scalars["String"]["output"]>>
  >;
  expireAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  projectExId?: Maybe<Scalars["String"]["output"]>;
  projectPlanType?: Maybe<ProjectPlanType>;
  type?: Maybe<DynamicMessageContentType>;
};

export type ProjectPlanInfo = {
  __typename: "ProjectPlanInfo";
  expireAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  inActiveSubscription: Scalars["Boolean"]["output"];
  projectPlanType: ProjectPlanType;
  trial: Scalars["Boolean"]["output"];
};

export type ProjectPlanProductDetailInterface = ProductDetail & {
  __typename: "ProjectPlanProductDetailInterface";
  chineseName?: Maybe<Scalars["String"]["output"]>;
  currency?: Maybe<Currency>;
  englishName?: Maybe<Scalars["String"]["output"]>;
  paymentCycle?: Maybe<PaymentCycle>;
  price?: Maybe<Scalars["BigDecimal"]["output"]>;
  projectPlanType?: Maybe<ProjectPlanType>;
};

export type ProjectPlanProductTypeDetail = ProductTypeDetail & {
  __typename: "ProjectPlanProductTypeDetail";
  paymentCycle?: Maybe<PaymentCycle>;
  productType?: Maybe<ProductType>;
  projectPlanType?: Maybe<ProjectPlanType>;
};

export type ProjectPlanProductTypeDetailInput = {
  paymentCycle?: InputMaybe<PaymentCycle>;
  projectPlanType?: InputMaybe<ProjectPlanType>;
};

export type ProjectPlanPurchaseItemDetailInput = {
  createBlankProjectDetail?: InputMaybe<CreateProjectDetailInput>;
  createClonedMultiClientProjectDetail?: InputMaybe<CreateClonedMultiClientProjectDetailInput>;
  createClonedProjectDetail?: InputMaybe<CreateClonedProjectDetailInput>;
  createProjectFromTemplateDetail?: InputMaybe<CreateProjectFromTemplateDetailInput>;
  currency: Currency;
  freeTrialDays?: InputMaybe<Scalars["Int"]["input"]>;
  paymentCycle: PaymentCycle;
  projectExId?: InputMaybe<Scalars["String"]["input"]>;
  projectPlanType: ProjectPlanType;
  quantity?: InputMaybe<Scalars["Int"]["input"]>;
};

export enum ProjectPlanType {
  MomenBasic = "MOMEN_BASIC",
  MomenFree = "MOMEN_FREE",
  MomenPro = "MOMEN_PRO",
  ZionBasic = "ZION_BASIC",
  ZionFree = "ZION_FREE",
  ZionPro = "ZION_PRO",
}

export type ProjectPlanTypeInfo = {
  __typename: "ProjectPlanTypeInfo";
  capabilities: Array<CapabilityAndLimit>;
  categoryAndFeatures: Array<CategoryAndFeatures>;
  chineseDescription: Scalars["String"]["output"];
  chineseName: Scalars["String"]["output"];
  englishDescription: Scalars["String"]["output"];
  englishName: Scalars["String"]["output"];
  nextLevelPlan?: Maybe<ProjectPlanType>;
  price?: Maybe<Array<PaymentCyclePrice>>;
  projectPlanDiscount?: Maybe<Scalars["Float"]["output"]>;
  projectPlanResourceMap?: Maybe<
    Scalars["Map_ResourceType_LimitScalar"]["output"]
  >;
  projectPlanType?: Maybe<ProjectPlanType>;
  trial: Scalars["Boolean"]["output"];
};

export type ProjectPlanWithClonedSchemaDetail = ProductDetail & {
  __typename: "ProjectPlanWithClonedSchemaDetail";
  chineseName?: Maybe<Scalars["String"]["output"]>;
  currency?: Maybe<Currency>;
  englishName?: Maybe<Scalars["String"]["output"]>;
  paymentCycle?: Maybe<PaymentCycle>;
  price?: Maybe<Scalars["BigDecimal"]["output"]>;
  projectPlanType?: Maybe<ProjectPlanType>;
};

export type ProjectPlanWithTemplateDetail = ProductDetail & {
  __typename: "ProjectPlanWithTemplateDetail";
  chineseName?: Maybe<Scalars["String"]["output"]>;
  currency?: Maybe<Currency>;
  englishName?: Maybe<Scalars["String"]["output"]>;
  paymentCycle?: Maybe<PaymentCycle>;
  price?: Maybe<Scalars["BigDecimal"]["output"]>;
  projectPlanType?: Maybe<ProjectPlanType>;
  templateExId?: Maybe<Scalars["String"]["output"]>;
};

export type ProjectPlanWithTemplateOutput = {
  __typename: "ProjectPlanWithTemplateOutput";
  projectExId?: Maybe<Scalars["String"]["output"]>;
  status?: Maybe<OrderStatus>;
};

export type ProjectPromotion = {
  __typename: "ProjectPromotion";
  templateExId?: Maybe<Scalars["String"]["output"]>;
  type?: Maybe<PromotionType>;
};

export enum ProjectResetStatus {
  Failed = "FAILED",
  Resetting = "RESETTING",
  Successful = "SUCCESSFUL",
}

export type ProjectResourceUsageAndBurstInfo = {
  __typename: "ProjectResourceUsageAndBurstInfo";
  projectResourceUsageInfo: Array<ProjectResourceUsageInfo>;
  unitComputingPower: Scalars["Float"]["output"];
  visitTimesSupportedByComputingPower: Scalars["Int"]["output"];
};

export type ProjectResourceUsageInfo = {
  __typename: "ProjectResourceUsageInfo";
  availableAmountWithNoExhaustionBurst?: Maybe<Scalars["Float"]["output"]>;
  calculatedAt: Scalars["OffsetDateTime"]["output"];
  resourceSourceInfoList?: Maybe<Array<Maybe<ResourceSourceInfo>>>;
  resourceType: ResourceType;
  resourceUsageStatus: ProjectResourceUsageStatus;
  unlimited: Scalars["Boolean"]["output"];
  usedAmount: Scalars["Float"]["output"];
};

export enum ProjectResourceUsageStatus {
  Deactivated = "DEACTIVATED",
  /** @deprecated Deprecated */
  Exhausted = "EXHAUSTED",
  SoonToBeExhausted = "SOON_TO_BE_EXHAUSTED",
  Sufficient = "SUFFICIENT",
}

export type ProjectRpsStatsInLast30Days = {
  __typename: "ProjectRpsStatsInLast30Days";
  exceededNumOfDays: Scalars["Int"]["output"];
  exceededTotal: Scalars["Int"]["output"];
};

export type ProjectSecret = {
  __typename: "ProjectSecret";
  createdAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  exId: Scalars["String"]["output"];
  projectExId?: Maybe<Scalars["String"]["output"]>;
  schemaExId?: Maybe<Scalars["String"]["output"]>;
  secretKey?: Maybe<Scalars["String"]["output"]>;
};

export type ProjectSpace = {
  __typename: "ProjectSpace";
  organization?: Maybe<Organization>;
  projectSpaceType?: Maybe<ProjectSpaceType>;
};

export enum ProjectSpaceType {
  JoinedOrganization = "JOINED_ORGANIZATION",
  Personal = "PERSONAL",
  Share = "SHARE",
  Team = "TEAM",
}

export enum ProjectStatus {
  Created = "CREATED",
  Deleted = "DELETED",
  Draft = "DRAFT",
  Published = "PUBLISHED",
}

export type ProjectTemplate = {
  __typename: "ProjectTemplate";
  accountTemplates?: Maybe<Array<Maybe<AccountTemplate>>>;
  category?: Maybe<Array<Maybe<Scalars["String"]["output"]>>>;
  categoryNames?: Maybe<Array<Maybe<Scalars["String"]["output"]>>>;
  coverImage?: Maybe<Image>;
  creator: Account;
  description?: Maybe<Scalars["String"]["output"]>;
  documentationLink?: Maybe<Scalars["String"]["output"]>;
  exId: Scalars["String"]["output"];
  freeTrialDays: Scalars["Int"]["output"];
  hasUsedFreeTrial: Scalars["Boolean"]["output"];
  minimumRequiredPlan?: Maybe<ProjectPlanType>;
  name?: Maybe<Scalars["String"]["output"]>;
  platforms?: Maybe<Array<Maybe<Platform>>>;
  previewImages: Array<Image>;
  price?: Maybe<Scalars["BigDecimal"]["output"]>;
  promotionType?: Maybe<PromotionType>;
  publishedAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  purchasablePlan?: Maybe<Array<Maybe<ProjectPlanType>>>;
  status?: Maybe<Status>;
  templateApps: Array<TemplateApp>;
  templatePreviewQrCodeLink?: Maybe<Image>;
  templateWebPreviewQrCodeLink?: Maybe<Image>;
  tutorialVideoUrl?: Maybe<Scalars["String"]["output"]>;
  type?: Maybe<ProjectType>;
  upgradeBanner?: Maybe<Scalars["String"]["output"]>;
  urlForViewer?: Maybe<Scalars["String"]["output"]>;
  usageCount: Scalars["Int"]["output"];
  visibility?: Maybe<Visibility>;
  webTrialUrl?: Maybe<Scalars["String"]["output"]>;
};

export type ProjectTemplateCommissionDtoInput = {
  commissionAccountExId: Scalars["String"]["input"];
  productCommissionRules: Array<ProductCommissionRuleDtoInput>;
  projectValidityPeriod?: InputMaybe<Scalars["Period"]["input"]>;
};

export type ProjectTemplateCreationInputInput = {
  category?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  commission?: InputMaybe<ProjectTemplateCommissionDtoInput>;
  coverImageId?: InputMaybe<Scalars["Long"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  documentationLink?: InputMaybe<Scalars["String"]["input"]>;
  freeTrialDays?: InputMaybe<Scalars["Int"]["input"]>;
  minimumRequiredPlan?: InputMaybe<ProjectPlanType>;
  name: Scalars["String"]["input"];
  platforms: Array<InputMaybe<Platform>>;
  previewImageIds?: InputMaybe<Array<InputMaybe<Scalars["Long"]["input"]>>>;
  price?: InputMaybe<Scalars["BigDecimal"]["input"]>;
  promotionType?: InputMaybe<PromotionType>;
  trialCodeId?: InputMaybe<Scalars["Long"]["input"]>;
  upgradeBanner?: InputMaybe<Scalars["String"]["input"]>;
  urlForViewer?: InputMaybe<Scalars["String"]["input"]>;
  webTrialCodeId?: InputMaybe<Scalars["Long"]["input"]>;
  webTrialUrl?: InputMaybe<Scalars["String"]["input"]>;
};

export type ProjectTemplateModifyInputInput = {
  category?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  coverImageId?: InputMaybe<Scalars["Long"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  platforms?: InputMaybe<Array<InputMaybe<Platform>>>;
  previewImageIds?: InputMaybe<Array<InputMaybe<Scalars["Long"]["input"]>>>;
};

export enum ProjectType {
  MultiClient = "MULTI_CLIENT",
  SingleClient = "SINGLE_CLIENT",
}

export type ProjectVersion = {
  __typename: "ProjectVersion";
  authorAccountId?: Maybe<Account>;
  description?: Maybe<Scalars["String"]["output"]>;
  exId?: Maybe<Scalars["String"]["output"]>;
  name?: Maybe<Scalars["String"]["output"]>;
  projectExId?: Maybe<Scalars["String"]["output"]>;
  status?: Maybe<ProjectVersionStatus>;
};

export enum ProjectVersionStatus {
  Deleted = "DELETED",
  DumpingDatabase = "DUMPING_DATABASE",
  Failed = "FAILED",
  Finished = "FINISHED",
  Initialized = "INITIALIZED",
}

export type ProjectWithWechatIds = {
  __typename: "ProjectWithWechatIds";
  projectExId?: Maybe<Scalars["String"]["output"]>;
  wechatIds?: Maybe<Array<Maybe<Scalars["String"]["output"]>>>;
};

export type PromoCode = {
  __typename: "PromoCode";
  allMarketRewardRules?: Maybe<Array<MarketRewardRule>>;
  code?: Maybe<Scalars["String"]["output"]>;
  description?: Maybe<Scalars["String"]["output"]>;
  exId: Scalars["String"]["output"];
  expireAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  marketRewardRule?: Maybe<MarketRewardRule>;
  owner: Account;
  startAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
};

export type PromoCodeMarketRewardRuleArgs = {
  eventType: MarketRewardEventType;
};

export enum PromotionType {
  Ai = "AI",
  Others = "OTHERS",
}

export type PurchaseItemDetailInputInput = {
  additionalClientPurchaseItemDetail?: InputMaybe<AdditionalClientPurchaseItemDetailInput>;
  codeComponentPackagePurchaseItemDetail?: InputMaybe<CodeComponentPackagePurchaseItemDetailInput>;
  computingPowerAddonPurchaseItemDetail?: InputMaybe<ComputingPowerAddonPurchaseItemDetailInput>;
  computingPowerCartPurchaseItemDetail?: InputMaybe<ComputingPowerCartPurchaseItemDetailInput>;
  multiClientProjectPlanPurchaseItemDetail?: InputMaybe<MultiClientProjectPlanPurchaseItemDetailInput>;
  projectPlanPurchaseItemDetail?: InputMaybe<ProjectPlanPurchaseItemDetailInput>;
  singleTenantPurchaseItemDetail?: InputMaybe<SingleTenantComputingPowerKitPurchaseItemDetailInput>;
  technicalSupportPurchaseItemDetail?: InputMaybe<TechnicalSupportPurchaseItemDetailInput>;
};

export type PurchaseOrder = {
  __typename: "PurchaseOrder";
  amount: Scalars["BigDecimal"]["output"];
  canInvoiceOnline: Scalars["Boolean"]["output"];
  createdAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  currency: Currency;
  directPurchase: Scalars["Boolean"]["output"];
  exId: Scalars["String"]["output"];
  invoicableAmount: Scalars["BigDecimal"]["output"];
  orderName: Scalars["String"]["output"];
  orderProducts?: Maybe<Array<Maybe<OrderProduct>>>;
  project?: Maybe<Project>;
  projectName?: Maybe<Scalars["String"]["output"]>;
  promoCode?: Maybe<PromoCode>;
  purchaser: Account;
  status: OrderStatus;
  successfulPayments: Array<Payment>;
  updatedAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
};

export type PurchasedMultiClientProjectPlanDetail =
  PurchasedProjectPlanDetailInterface & {
    __typename: "PurchasedMultiClientProjectPlanDetail";
    additionalAppIds?: Maybe<Array<Maybe<Scalars["Long"]["output"]>>>;
    additionalCount: Scalars["Int"]["output"];
    createAdditionalAppDetails?: Maybe<Array<Maybe<CreateAppDetail>>>;
    createProjectDetail?: Maybe<CreateProjectDetail>;
    currency?: Maybe<Currency>;
    effectiveAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
    expireAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
    paymentCycle?: Maybe<PaymentCycle>;
    price?: Maybe<Scalars["BigDecimal"]["output"]>;
    pricePerAdditionalClient?: Maybe<Scalars["BigDecimal"]["output"]>;
    productName?: Maybe<Scalars["String"]["output"]>;
    productPrice?: Maybe<Scalars["BigDecimal"]["output"]>;
    productType?: Maybe<ProductType>;
    projectId?: Maybe<Scalars["Long"]["output"]>;
    projectPlanType?: Maybe<ProjectPlanType>;
    quantity: Scalars["Int"]["output"];
    renew: Scalars["Boolean"]["output"];
    retainAdditionalAppIds?: Maybe<Array<Maybe<Scalars["Long"]["output"]>>>;
    standardPrice?: Maybe<Scalars["BigDecimal"]["output"]>;
  };

export type PurchasedProductDetail = {
  __typename: "PurchasedProductDetail";
  currency?: Maybe<Currency>;
  effectiveAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  expireAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  paymentCycle?: Maybe<PaymentCycle>;
  price?: Maybe<Scalars["BigDecimal"]["output"]>;
  productName?: Maybe<Scalars["String"]["output"]>;
  productPrice?: Maybe<Scalars["BigDecimal"]["output"]>;
  productType?: Maybe<ProductType>;
  quantity: Scalars["Int"]["output"];
};

export type PurchasedProjectPlanDetail = PurchasedProjectPlanDetailInterface & {
  __typename: "PurchasedProjectPlanDetail";
  currency?: Maybe<Currency>;
  effectiveAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  expireAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  paymentCycle?: Maybe<PaymentCycle>;
  price?: Maybe<Scalars["BigDecimal"]["output"]>;
  productName?: Maybe<Scalars["String"]["output"]>;
  productPrice?: Maybe<Scalars["BigDecimal"]["output"]>;
  productType?: Maybe<ProductType>;
  projectId?: Maybe<Scalars["Long"]["output"]>;
  projectPlanType?: Maybe<ProjectPlanType>;
  quantity: Scalars["Int"]["output"];
};

export type PurchasedProjectPlanDetailInterface = {
  currency?: Maybe<Currency>;
  effectiveAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  expireAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  paymentCycle?: Maybe<PaymentCycle>;
  price?: Maybe<Scalars["BigDecimal"]["output"]>;
  productName?: Maybe<Scalars["String"]["output"]>;
  productPrice?: Maybe<Scalars["BigDecimal"]["output"]>;
  productType?: Maybe<ProductType>;
  projectPlanType?: Maybe<ProjectPlanType>;
  quantity: Scalars["Int"]["output"];
};

export type PurchasedProjectPlanWithClonedSchemaDetail =
  PurchasedProjectPlanDetailInterface & {
    __typename: "PurchasedProjectPlanWithClonedSchemaDetail";
    category?: Maybe<ProjectContentCategory>;
    copyData?: Maybe<Scalars["Boolean"]["output"]>;
    currency?: Maybe<Currency>;
    effectiveAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
    expireAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
    organizationId: Scalars["Long"]["output"];
    paymentCycle?: Maybe<PaymentCycle>;
    platform?: Maybe<Platform>;
    price?: Maybe<Scalars["BigDecimal"]["output"]>;
    productName?: Maybe<Scalars["String"]["output"]>;
    productPrice?: Maybe<Scalars["BigDecimal"]["output"]>;
    productType?: Maybe<ProductType>;
    projectId?: Maybe<Scalars["Long"]["output"]>;
    projectName?: Maybe<Scalars["String"]["output"]>;
    projectPlanType?: Maybe<ProjectPlanType>;
    projectSpaceType?: Maybe<ProjectSpaceType>;
    quantity: Scalars["Int"]["output"];
    sourceSchemaId: Scalars["Long"]["output"];
  };

export type PurchasedProjectPlanWithTemplateDetailV2 =
  PurchasedProjectPlanDetailInterface & {
    __typename: "PurchasedProjectPlanWithTemplateDetailV2";
    appIds?: Maybe<Array<Maybe<Scalars["Long"]["output"]>>>;
    category?: Maybe<ProjectContentCategory>;
    currency?: Maybe<Currency>;
    effectiveAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
    expireAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
    freeTrialDays?: Maybe<Scalars["Int"]["output"]>;
    organizationId?: Maybe<Scalars["Long"]["output"]>;
    paymentCycle?: Maybe<PaymentCycle>;
    price?: Maybe<Scalars["BigDecimal"]["output"]>;
    productName?: Maybe<Scalars["String"]["output"]>;
    productPrice?: Maybe<Scalars["BigDecimal"]["output"]>;
    productType?: Maybe<ProductType>;
    projectId?: Maybe<Scalars["Long"]["output"]>;
    projectName?: Maybe<Scalars["String"]["output"]>;
    projectPlanType?: Maybe<ProjectPlanType>;
    projectSpaceType?: Maybe<ProjectSpaceType>;
    quantity: Scalars["Int"]["output"];
    templateId?: Maybe<Scalars["Long"]["output"]>;
    templateName?: Maybe<Scalars["String"]["output"]>;
  };

/** Query root */
export type Query = {
  __typename: "Query";
  accountByUsername?: Maybe<Account>;
  accountExIdAndDisplayNameByEmail?: Maybe<AccountExIdAndName>;
  accountExIdAndDisplayNameByPhoneNumber?: Maybe<AccountExIdAndName>;
  /** 获取用户的所有角色 */
  accountRoles?: Maybe<Array<Maybe<Role>>>;
  accountTemplateList?: Maybe<Connection_AccountTemplate>;
  acquiredAppAiTokenResourceList?: Maybe<Array<AcquiredResourceRecord>>;
  activeSingleTenantKit?: Maybe<ComputingPowerKit>;
  additionalClientAppDetail?: Maybe<AdditionalClientAppPriceInfo>;
  aliMiniProgramProjectDetailQrcode: Scalars["String"]["output"];
  aliyunSmsSignatureStatus?: Maybe<AliyunSmsSignatureResponse>;
  aliyunSmsTemplatesStatus: Array<AliyunSmsTemplateResult>;
  allAccounts?: Maybe<Connection_Account>;
  allAdvancedFunctionalityTutorial?: Maybe<
    Array<Maybe<AdvancedFunctionalityTutorial>>
  >;
  allAppsConnection?: Maybe<Connection_App>;
  allCategories?: Maybe<Array<Maybe<CategoryOfTemplate>>>;
  allCloudConfigurations?: Maybe<Array<Maybe<CloudConfiguration>>>;
  allComputingPowerAddonPrices: Array<ComputingPowerAddonInfo>;
  allComputingPowerAddons: Array<ComputingPowerAddonInfo>;
  allComputingPowerKitPrices: Array<ComputingPowerKitInfo>;
  allComputingPowerKits: Array<ComputingPowerKitInfo>;
  allCountries?: Maybe<Array<Maybe<Country>>>;
  allInvoiceRequests?: Maybe<Connection_InvoiceRequest>;
  allInvoiceRequestsByStatus?: Maybe<Array<InvoiceRequest>>;
  allMarketRewardRecords?: Maybe<Array<MarketRewardRecord>>;
  allMarketRewardRecordsByPromoCodeId?: Maybe<Array<MarketRewardRecord>>;
  allMarketRewardRecordsByRedemptionCodeId?: Maybe<Array<MarketRewardRecord>>;
  allMarketRewardRecordsByRuleIds?: Maybe<Array<MarketRewardRecord>>;
  allOauth2Clients?: Maybe<Array<Maybe<Oauth2RegisteredClient>>>;
  allPaidOrders?: Maybe<Connection_PurchaseOrder>;
  /** 获取所有权限 */
  allPermission?: Maybe<Array<Maybe<Permission>>>;
  allPlanTypes: Array<Maybe<PlanTypeInfo>>;
  allProjectIdsToDowngradeZiroomServer?: Maybe<
    Array<Maybe<Scalars["Long"]["output"]>>
  >;
  allProjectPlanInfo?: Maybe<Array<ProjectPlanTypeInfo>>;
  allProjects?: Maybe<Array<Maybe<Project>>>;
  /** 获取所有角色 */
  allRoles?: Maybe<Array<Maybe<Role>>>;
  allTechnicalSupportProductInfo?: Maybe<
    Array<Maybe<TechnicalSupportProductInfo>>
  >;
  allTemplateSteps?: Maybe<Array<Maybe<StepAndStatus>>>;
  apiConfigFromCurl?: Maybe<ApiDebugResult>;
  apiFromMingdao?: Maybe<ApiDebugResult>;
  apiFromOpenApiDocument?: Maybe<ApiDebugResult>;
  appConfigAndSchema?: Maybe<AppConfigAndSchema>;
  authorizeInfo?: Maybe<AuthorizeInfo>;
  authorizerList?: Maybe<Array<Maybe<Authorizer>>>;
  backendOnlyToken?: Maybe<Scalars["String"]["output"]>;
  balanceAmount: Scalars["BigDecimal"]["output"];
  balanceTransactionRecords?: Maybe<Connection_BalanceTransactionRecord>;
  beginnerGuide?: Maybe<BeginnerGuide>;
  beginnerGuideTemplateExId?: Maybe<Scalars["String"]["output"]>;
  betaWechatAppIdExpired: Scalars["Boolean"]["output"];
  billingUrl?: Maybe<Scalars["String"]["output"]>;
  buildAppIcon?: Maybe<Array<Maybe<BuildAppIcon>>>;
  builtInSsoConfigs?: Maybe<Array<SsoConfig>>;
  canMigrateToHigherComputingPowerZiroom: Scalars["Boolean"]["output"];
  capabilitiesWithUnreadDowngradeNotification?: Maybe<Array<Maybe<Capability>>>;
  /** backend only */
  capabilityLimitsForBackendOnly: Array<CapabilityAndLimit>;
  checkAppNameDuplicate: Scalars["Boolean"]["output"];
  checkCapabilitiesExceed?: Maybe<CapabilityAndLimitCheckResult>;
  checkProjectNameDuplicate: Scalars["Boolean"]["output"];
  checkZedVersion: Scalars["Boolean"]["output"];
  codeComponentPackageByExId?: Maybe<CodeComponentPackage>;
  codeComponentPackageByExIds?: Maybe<Array<Maybe<CodeComponentPackage>>>;
  collaboratorTypeAndDefaultSharePermissions: Array<CollaboratorTypeAndDefaultSharePermission>;
  commissionUserCount: Scalars["Int"]["output"];
  companyInvoiceProfiles: Array<CompanyInvoiceProfile>;
  computingPowerAddonPrices: Array<ComputingPowerAddonInfo>;
  computingPowerAddons: Array<ComputingPowerAddonInfo>;
  computingPowerCartItems?: Maybe<Array<ComputingPowerCartItem>>;
  computingPowerKitPrices: Array<ComputingPowerKitInfo>;
  computingPowerKits: Array<ComputingPowerKitInfo>;
  computingPowerOrderInfo?: Maybe<Connection_ComputingPowerOrderInfo>;
  confirmedAuthPageUrl?: Maybe<Scalars["String"]["output"]>;
  contactQRCode?: Maybe<Scalars["String"]["output"]>;
  copilotSubscriptionCount: Scalars["Long"]["output"];
  couponTemplates?: Maybe<Array<CouponTemplate>>;
  coursePrice: PriceInfo;
  crdtSchemaBySchemaExId?: Maybe<CrdtSchema>;
  currentZiroomServerInfo: ZiroomServerInfo;
  customComponentListByExIds?: Maybe<Array<Maybe<CustomComponent>>>;
  customDomainList: Array<Maybe<CustomDomain>>;
  customerServiceWechatQRCode?: Maybe<Scalars["String"]["output"]>;
  dailyResourceUsageHistory: Scalars["Map_OffsetDateTime_DoubleScalar"]["output"];
  dataVisualizer?: Maybe<DataVisualizer>;
  dbBackupFiles?: Maybe<Array<Maybe<CloudObject>>>;
  debugInfo?: Maybe<Scalars["Json"]["output"]>;
  decode: Scalars["Long"]["output"];
  decodeMulti?: Maybe<Array<Maybe<Scalars["Long"]["output"]>>>;
  decodes?: Maybe<Array<Maybe<Scalars["Long"]["output"]>>>;
  deductionTypeByProjectName?: Maybe<ProjectContentCategory>;
  deploymentErrorLog?: Maybe<Array<Maybe<DeploymentErrorLog>>>;
  deploymentOutputLog?: Maybe<Array<Maybe<DeploymentOutput>>>;
  devProjectVersion?: Maybe<ProjectVersion>;
  dingtalkJsApiSignature: SdkSignature;
  ecosystemContactQRCode?: Maybe<Scalars["String"]["output"]>;
  editableProjectsConnection?: Maybe<Connection_Project>;
  encode?: Maybe<Scalars["String"]["output"]>;
  encodeMulti?: Maybe<Scalars["String"]["output"]>;
  excessiveWechatMiniProgramPackageInfo?: Maybe<WechatMiniProgramPackageInfo>;
  existCodeComponentPackage: Scalars["Boolean"]["output"];
  existCodeComponentPackageVersion: Scalars["Boolean"]["output"];
  existsByEmail: Scalars["Boolean"]["output"];
  existsByPhoneNumber: Scalars["Boolean"]["output"];
  expectedZiroomServerInfo: ZiroomServerInfo;
  fallbackWechatAutoReplyMessageRule?: Maybe<WechatAutoReplyMessageRule>;
  /** backend only query */
  faviconUrl?: Maybe<Scalars["String"]["output"]>;
  features: Array<FeatureStatus>;
  fetchAppDetailByExId?: Maybe<App>;
  fetchAppDetailByExIdWithoutReconcile?: Maybe<App>;
  fetchJsonByProjectExIdFromCrdtModel?: Maybe<Scalars["Json"]["output"]>;
  fetchJsonBySchemaIdFromCrdtModel?: Maybe<Scalars["Json"]["output"]>;
  findActiveSingleTenantResourceInfoAndThrowOnExpireTimeMismatch?: Maybe<
    Array<ComputingPowerResourceInfo>
  >;
  findAllCategoriesLinkedToAnyTemplate?: Maybe<
    Array<Maybe<CategoryOfTemplate>>
  >;
  findAllCouponsDescByCreateTime?: Maybe<Array<AccountHasCoupon>>;
  findAllProjectIdsThatHasGrantedThirdPartyAuthorization?: Maybe<
    Array<Maybe<Scalars["Long"]["output"]>>
  >;
  findAllProjectTemplate: Array<ProjectTemplate>;
  findAllRedemptionCodesDescById?: Maybe<Array<Maybe<RedemptionCode>>>;
  findByCategoryExId?: Maybe<Array<Maybe<ProjectTemplate>>>;
  findCouponsByStatus?: Maybe<Connection_AccountHasCoupon>;
  findEditorComponents?: Maybe<Connection_EditorComponent>;
  findOtherProjectsAuthorizedWithWechatAppId?: Maybe<Array<Maybe<Project>>>;
  findPromoCodeByCode: PromoCode;
  findPromoCodeById: PromoCode;
  findRedemptionCodeByCode: RedemptionCode;
  findSortedCouponAndOrderDetails?: Maybe<Array<CouponAndOrderDetail>>;
  findVerificationCode?: Maybe<Scalars["String"]["output"]>;
  findViewerByEmail?: Maybe<AccountAndCollaborateType>;
  findViewerByPhoneNumber?: Maybe<AccountAndCollaborateType>;
  findWechatMiniProgramAudit?: Maybe<Array<Maybe<WechatMiniprogramAudit>>>;
  findWrongStateProjectIds?: Maybe<Array<Maybe<Scalars["Long"]["output"]>>>;
  firstTimeAudit: Scalars["Boolean"]["output"];
  freeTrialCampaignLaunched: Scalars["Boolean"]["output"];
  fuzzySearchEditorComponents?: Maybe<Connection_EditorComponent>;
  fuzzySearchMemberName?: Maybe<Connection_Account>;
  fuzzySearchOrganizationName?: Maybe<Connection_Organization>;
  fuzzySearchProjectName?: Maybe<Connection_Project>;
  /** backend only query */
  generateBuildAppConfigWithRecordId: BuildAppConfig;
  generateDefaultProjectNameByTemplateId?: Maybe<Scalars["String"]["output"]>;
  /** backend only query */
  generateMultiClientMobileBuildAppConfigWithRecordId: BuildAppConfig;
  /** backend only query */
  generateMultiClientWechatBuildAppConfigWithRecordId: BuildAppConfig;
  generateShareToken?: Maybe<ShareToken>;
  generateShareTokenV2?: Maybe<CollaborativeSharedResource_ShareToken>;
  getBannerItems?: Maybe<Connection_BannerItem>;
  getCodeComponentDocFileUrl?: Maybe<Scalars["String"]["output"]>;
  getEvaluationResultById: EvaluationResult;
  getEvaluationResults: Array<Maybe<EvaluationResult>>;
  getEvaluationSessionById: EvaluationSession;
  getEvaluationSessions: Array<Maybe<EvaluationSession>>;
  getFileByExId: StoredFile;
  getFileById: StoredFile;
  getGoldenSetById: GoldenSet;
  getGoldenSets: Array<Maybe<GoldenSet>>;
  getImageByExId: Image;
  getImageById: Image;
  getImageListByExIds?: Maybe<Array<Maybe<Image>>>;
  getImageListByIds?: Maybe<Array<Maybe<Image>>>;
  getImages?: Maybe<Connection_StoredImage>;
  getQueryById?: Maybe<Scalars["String"]["output"]>;
  getRubricByContext: Array<Maybe<Rubric>>;
  getRubricById: Rubric;
  getTabBarIcons: Array<Maybe<StoredImage>>;
  getVideoByExId: Video;
  getVideoById: Video;
  hasSubmittedNonTestingAuditToday: Scalars["Boolean"]["output"];
  imitate?: Maybe<AccountInfo>;
  individualInvoiceProfiles: Array<IndividualInvoiceProfile>;
  inspectMingdaoProjectApi: Array<Maybe<Scalars["Json"]["output"]>>;
  invitationURL?: Maybe<Scalars["String"]["output"]>;
  invitedUserCount: Scalars["Int"]["output"];
  kubeClientHealthCheck: Scalars["Boolean"]["output"];
  latestAuditStatus?: Maybe<WechatApiGetLatestAuditStatusResponseEntity>;
  latestWechatMiniProgramAudit?: Maybe<WechatMiniprogramAudit>;
  latestWechatMiniProgramAuthInfo?: Maybe<WechatMiniProgramAuthEvent>;
  lookupAccount?: Maybe<Account>;
  marketRewardEventTypeAndRules: Scalars["Map_MarketRewardEventType_List_MarketRewardRuleScalar"]["output"];
  maxCpuCoresForProject: Scalars["Float"]["output"];
  mergeServiceQRCode?: Maybe<Scalars["String"]["output"]>;
  messages?: Maybe<Connection_Message>;
  monthlyResourceUsageHistory: Scalars["Map_OffsetDateTime_DoubleScalar"]["output"];
  negativeInvoiceAmount: Scalars["BigDecimal"]["output"];
  newOnBoardingTemplateId?: Maybe<Scalars["String"]["output"]>;
  nonRealTimeDisplayedResourceTypes?: Maybe<Array<ResourceType>>;
  notifyAndCleanUp: Scalars["Boolean"]["output"];
  onlineConsultationPricePerHour: PriceInfo;
  organizationExpirationStatus: OrganizationExpirationStatus;
  outflowUsageForLastSixMonthsAscByMonth: Array<Scalars["Float"]["output"]>;
  ownedCodeComponentPackages?: Maybe<Array<Maybe<CodeComponentPackage>>>;
  ownedCustomComponentGroupedByRepoUrl?: Maybe<
    Scalars["Map_String_List_CustomComponentScalar"]["output"]
  >;
  ownedCustomComponentList?: Maybe<Array<Maybe<CustomComponent>>>;
  paymentCycleExpireAt: Scalars["OffsetDateTime"]["output"];
  pendingOrderProductDetailsPaidByAli?: Maybe<
    Array<Maybe<ProductDetailAndRenewal>>
  >;
  pendingZiroomProjectAppointment?: Maybe<ZiroomProjectMigrationAppointment>;
  planType: PlanTypeInfo;
  popupHasRead: Scalars["Boolean"]["output"];
  preAuthPageUrl?: Maybe<Scalars["String"]["output"]>;
  priceDetails: PriceDetails;
  productAndPurchasedDetails: Array<Maybe<ProductAndPurchasedDetail>>;
  project?: Maybe<Project>;
  projectAccounts?: Maybe<Connection_Account>;
  projectComments: Connection_ProjectComment;
  projectCommentsCount: Scalars["Long"]["output"];
  projectPlanUpgradeUsage?: Maybe<ResourceUsage>;
  projectRpsTimescale: Array<RpsAtInstant>;
  projectSchemaVersions?: Maybe<Connection_ProjectVersion>;
  projectTemplateDetail?: Maybe<ProjectTemplate>;
  projectTemplates?: Maybe<Connection_ProjectTemplate>;
  projectTemplatesForAuditor?: Maybe<Connection_ProjectTemplate>;
  projectWithWechatIds?: Maybe<ProjectWithWechatIds>;
  projectsFromJoinedOrganizationsConnection?: Maybe<Connection_Project>;
  projectsFromPersonalSpaceConnection?: Maybe<Connection_Project>;
  projectsFromTeamSpaceConnection?: Maybe<Connection_Project>;
  publicImageByExId: Image;
  publicProjectTemplates?: Maybe<Connection_ProjectTemplate>;
  publicVideoByExId: Video;
  purchaseOrderByExId?: Maybe<PurchaseOrder>;
  refreshToken?: Maybe<AccountInfo>;
  renderTypeByAvailableAndTag?: Maybe<
    Scalars["Map_SeoRenderingMethod_RenderingMethodAvailableAndTagScalar"]["output"]
  >;
  resourceUsageAndBurstInfo: ProjectResourceUsageAndBurstInfo;
  resourceUsageInfo: Array<ProjectResourceUsageInfo>;
  runtimeConfig?: Maybe<Scalars["Json"]["output"]>;
  schemaBySchemaExId?: Maybe<Scalars["Json"]["output"]>;
  searchCompanyInfo?: Maybe<CompanyInfo>;
  searchCouponTemplates?: Maybe<Array<CouponTemplate>>;
  searchSchemaWithSpecificRule?: Maybe<Scalars["String"]["output"]>;
  sendOrganizationInvitation: Scalars["Boolean"]["output"];
  sessionHistory?: Maybe<Connection_CopilotSession>;
  shareableCollaboratorTypes: Array<CollaboratorType>;
  sharedAppsConnection?: Maybe<Connection_App>;
  sharedProjectsConnection?: Maybe<Connection_Project>;
  singleTenantComputingPowerPrice: SingleTenantComputingPowerPriceInfo;
  sortedResourceSourceInfo?: Maybe<Array<Maybe<ResourceSourceInfo>>>;
  specificWechatAutoReplyMessageRules: Array<WechatAutoReplyMessageRule>;
  supportedCustomModelDescriptor?: Maybe<SupportedCustomModelDescriptor>;
  supportedPaymentTypeAndMethods?: Maybe<Array<PaymentTypeAndMethod>>;
  templateExIdForPromotion?: Maybe<ProjectPromotion>;
  thirdPartyApiDebug: InvocationResult;
  tokenNeverExpired?: Maybe<Scalars["String"]["output"]>;
  totalPageNumRenderedBySSG: Scalars["Int"]["output"];
  /** backend only mutation */
  triggerZvmGeneratorStatusByRecordId?: Maybe<TriggerZvmGeneratorStatus>;
  tutorialInfo?: Maybe<AdvancedFunctionalityTutorial>;
  unreadMessageCount: Array<CountByCategory>;
  unreadMessagesToPopup?: Maybe<Connection_Message>;
  upgradeProjectPlanBanner?: Maybe<Banner>;
  user?: Maybe<Account>;
  userPreferences?: Maybe<Array<Maybe<PreferenceEntity>>>;
  userQuestions?: Maybe<Array<Maybe<UserQuestion>>>;
  userQuestionsByVersion: Array<UserQuestion>;
  userQuestionsV2: Array<UserQuestion>;
  userQuestionsV3: Array<UserQuestion>;
  userTutorialPreference?: Maybe<Array<Maybe<UserTutorialPreference>>>;
  validateComponentMapJson?: Maybe<Scalars["String"]["output"]>;
  validateInvitation?: Maybe<Organization>;
  validateLegalTableName: Scalars["Boolean"]["output"];
  validateZedVersionStatus?: Maybe<SchemaZedVersionValidationResult>;
  verifyDeveloperPassword: Scalars["Boolean"]["output"];
  viewerCount: Scalars["Long"]["output"];
  viewersConnection?: Maybe<Connection_AccountAndCollaborateType>;
  visibleAfCustomCodeTemplates?: Maybe<Array<Maybe<AfCodeTemplate>>>;
  webOwnershipVerificationFileUrl?: Maybe<Array<Maybe<FileAndWebRootPath>>>;
  webPublishPageBanner?: Maybe<Banner>;
  webhookEndpoint: WebhookEndpoint;
  wechatAutoReplies: Array<WechatAutoReply>;
  wechatAutoReplyEventRules: Array<WechatAutoReplyEventRule>;
  wechatAutoReplyPrompt: Scalars["String"]["output"];
  wechatMessageTemplateList?: Maybe<Array<Maybe<WechatMessageTemplate>>>;
  wechatMiniProgramPackageInfo?: Maybe<WechatMiniProgramPackageInfo>;
  wxworkCallbackUrls?: Maybe<WxworkCallBackUrlSetting>;
  wxworkPreAuthPageUrl?: Maybe<Scalars["String"]["output"]>;
  zedVersion?: Maybe<Scalars["String"]["output"]>;
  ziroomMigrationBanner?: Maybe<Scalars["String"]["output"]>;
};

/** Query root */
export type QueryAccountByUsernameArgs = {
  username?: InputMaybe<Scalars["String"]["input"]>;
};

/** Query root */
export type QueryAccountExIdAndDisplayNameByEmailArgs = {
  email: Scalars["String"]["input"];
};

/** Query root */
export type QueryAccountExIdAndDisplayNameByPhoneNumberArgs = {
  phoneNumber: Scalars["String"]["input"];
};

/** Query root */
export type QueryAccountRolesArgs = {
  accountExId: Scalars["String"]["input"];
};

/** Query root */
export type QueryAccountTemplateListArgs = {
  paginator?: InputMaybe<ConnectionPaginatorInput>;
};

/** Query root */
export type QueryAcquiredAppAiTokenResourceListArgs = {
  projectExId: Scalars["String"]["input"];
};

/** Query root */
export type QueryActiveSingleTenantKitArgs = {
  projectExId: Scalars["String"]["input"];
};

/** Query root */
export type QueryAdditionalClientAppDetailArgs = {
  currency: Currency;
  projectExId: Scalars["String"]["input"];
};

/** Query root */
export type QueryAliMiniProgramProjectDetailQrcodeArgs = {
  projectExId: Scalars["String"]["input"];
};

/** Query root */
export type QueryAliyunSmsSignatureStatusArgs = {
  projectExId: Scalars["String"]["input"];
};

/** Query root */
export type QueryAliyunSmsTemplatesStatusArgs = {
  projectExId: Scalars["String"]["input"];
};

/** Query root */
export type QueryAllAccountsArgs = {
  paginator?: InputMaybe<ConnectionPaginatorInput>;
};

/** Query root */
export type QueryAllAppsConnectionArgs = {
  paginator?: InputMaybe<ConnectionPaginatorInput>;
};

/** Query root */
export type QueryAllComputingPowerAddonsArgs = {
  projectExId: Scalars["String"]["input"];
};

/** Query root */
export type QueryAllComputingPowerKitsArgs = {
  projectExId: Scalars["String"]["input"];
};

/** Query root */
export type QueryAllInvoiceRequestsArgs = {
  paginator?: InputMaybe<ConnectionPaginatorInput>;
};

/** Query root */
export type QueryAllInvoiceRequestsByStatusArgs = {
  status: InvoiceStatus;
};

/** Query root */
export type QueryAllMarketRewardRecordsByPromoCodeIdArgs = {
  promoCodeId: Scalars["Long"]["input"];
};

/** Query root */
export type QueryAllMarketRewardRecordsByRedemptionCodeIdArgs = {
  redemptionCodeId: Scalars["Long"]["input"];
};

/** Query root */
export type QueryAllMarketRewardRecordsByRuleIdsArgs = {
  ruleIds?: InputMaybe<Array<Scalars["Long"]["input"]>>;
};

/** Query root */
export type QueryAllPaidOrdersArgs = {
  paginator?: InputMaybe<ConnectionPaginatorInput>;
};

/** Query root */
export type QueryAllTemplateStepsArgs = {
  templateExId?: InputMaybe<Scalars["String"]["input"]>;
};

/** Query root */
export type QueryApiConfigFromCurlArgs = {
  curl: Scalars["String"]["input"];
};

/** Query root */
export type QueryApiFromMingdaoArgs = {
  projectExId: Scalars["String"]["input"];
};

/** Query root */
export type QueryApiFromOpenApiDocumentArgs = {
  fileExId?: InputMaybe<Scalars["String"]["input"]>;
};

/** Query root */
export type QueryAppConfigAndSchemaArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  projectExId: Scalars["String"]["input"];
  projectVersionExId?: InputMaybe<Scalars["String"]["input"]>;
};

/** Query root */
export type QueryAuthorizeInfoArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  projectExId: Scalars["String"]["input"];
};

/** Query root */
export type QueryAuthorizerListArgs = {
  count: Scalars["Int"]["input"];
  offset: Scalars["Int"]["input"];
};

/** Query root */
export type QueryBalanceTransactionRecordsArgs = {
  paginator?: InputMaybe<ConnectionPaginatorInput>;
  status?: InputMaybe<BalanceTransactionStatus>;
  type?: InputMaybe<BalanceTransactionType>;
};

/** Query root */
export type QueryBetaWechatAppIdExpiredArgs = {
  projectExId: Scalars["String"]["input"];
};

/** Query root */
export type QueryBuildAppIconArgs = {
  exIds: Array<InputMaybe<Scalars["String"]["input"]>>;
};

/** Query root */
export type QueryCanMigrateToHigherComputingPowerZiroomArgs = {
  projectExId: Scalars["String"]["input"];
};

/** Query root */
export type QueryCapabilitiesWithUnreadDowngradeNotificationArgs = {
  projectExId: Scalars["String"]["input"];
};

/** Query root */
export type QueryCapabilityLimitsForBackendOnlyArgs = {
  projectExId: Scalars["String"]["input"];
};

/** Query root */
export type QueryCheckAppNameDuplicateArgs = {
  appName: Scalars["String"]["input"];
  projectExId: Scalars["String"]["input"];
};

/** Query root */
export type QueryCheckCapabilitiesExceedArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  appVersionExId?: InputMaybe<Scalars["String"]["input"]>;
  projectExId: Scalars["String"]["input"];
};

/** Query root */
export type QueryCheckProjectNameDuplicateArgs = {
  projectName: Scalars["String"]["input"];
};

/** Query root */
export type QueryCheckZedVersionArgs = {
  requestZedVersion?: InputMaybe<Scalars["String"]["input"]>;
};

/** Query root */
export type QueryCodeComponentPackageByExIdArgs = {
  packageExId: Scalars["String"]["input"];
};

/** Query root */
export type QueryCodeComponentPackageByExIdsArgs = {
  packageExIds: Array<Scalars["String"]["input"]>;
};

/** Query root */
export type QueryCommissionUserCountArgs = {
  accountExId: Scalars["String"]["input"];
  commissionRole: CommissionRole;
  commissionStatus: CommissionStatus;
};

/** Query root */
export type QueryComputingPowerAddonPricesArgs = {
  currency: Currency;
};

/** Query root */
export type QueryComputingPowerAddonsArgs = {
  currency: Currency;
  projectExId: Scalars["String"]["input"];
};

/** Query root */
export type QueryComputingPowerCartItemsArgs = {
  projectExId: Scalars["String"]["input"];
};

/** Query root */
export type QueryComputingPowerKitPricesArgs = {
  currency: Currency;
};

/** Query root */
export type QueryComputingPowerKitsArgs = {
  currency: Currency;
  projectExId: Scalars["String"]["input"];
};

/** Query root */
export type QueryComputingPowerOrderInfoArgs = {
  infoType?: InputMaybe<ComputingPowerOrderInfoType>;
  paginator?: InputMaybe<ConnectionPaginatorInput>;
  projectExId: Scalars["String"]["input"];
};

/** Query root */
export type QueryConfirmedAuthPageUrlArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  projectExId: Scalars["String"]["input"];
};

/** Query root */
export type QueryContactQrCodeArgs = {
  contactQRCodeType?: InputMaybe<ContactQrCodeType>;
};

/** Query root */
export type QueryCopilotSubscriptionCountArgs = {
  projectExId: Scalars["String"]["input"];
  sessionType: CopilotSessionType;
};

/** Query root */
export type QueryCrdtSchemaBySchemaExIdArgs = {
  schemaExId: Scalars["String"]["input"];
};

/** Query root */
export type QueryCurrentZiroomServerInfoArgs = {
  projectExId: Scalars["String"]["input"];
};

/** Query root */
export type QueryCustomComponentListByExIdsArgs = {
  exIds: Array<InputMaybe<Scalars["String"]["input"]>>;
};

/** Query root */
export type QueryCustomDomainListArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  projectExId: Scalars["String"]["input"];
};

/** Query root */
export type QueryDailyResourceUsageHistoryArgs = {
  projectExId: Scalars["String"]["input"];
  resourceType: ResourceType;
};

/** Query root */
export type QueryDataVisualizerArgs = {
  appVersionExId?: InputMaybe<Scalars["String"]["input"]>;
  dataVisualizerExId: Scalars["String"]["input"];
};

/** Query root */
export type QueryDbBackupFilesArgs = {
  projectExId: Scalars["String"]["input"];
};

/** Query root */
export type QueryDebugInfoArgs = {
  projectExId: Scalars["String"]["input"];
};

/** Query root */
export type QueryDecodeArgs = {
  text: Scalars["String"]["input"];
};

/** Query root */
export type QueryDecodeMultiArgs = {
  text: Scalars["String"]["input"];
};

/** Query root */
export type QueryDecodesArgs = {
  exIds: Array<InputMaybe<Scalars["String"]["input"]>>;
};

/** Query root */
export type QueryDeductionTypeByProjectNameArgs = {
  name: Scalars["String"]["input"];
};

/** Query root */
export type QueryDeploymentErrorLogArgs = {
  appVersionExId?: InputMaybe<Scalars["String"]["input"]>;
  buildTargets: Array<BuildTarget>;
  projectExId: Scalars["String"]["input"];
};

/** Query root */
export type QueryDeploymentOutputLogArgs = {
  projectExId: Scalars["String"]["input"];
  status?: InputMaybe<Array<InputMaybe<DeploymentEventStatus>>>;
};

/** Query root */
export type QueryDevProjectVersionArgs = {
  projectExId: Scalars["String"]["input"];
};

/** Query root */
export type QueryDingtalkJsApiSignatureArgs = {
  corpId: Scalars["String"]["input"];
  url: Scalars["String"]["input"];
};

/** Query root */
export type QueryEditableProjectsConnectionArgs = {
  paginator?: InputMaybe<ConnectionPaginatorInput>;
};

/** Query root */
export type QueryEncodeArgs = {
  id: Scalars["Long"]["input"];
};

/** Query root */
export type QueryEncodeMultiArgs = {
  ids: Array<InputMaybe<Scalars["Long"]["input"]>>;
};

/** Query root */
export type QueryExcessiveWechatMiniProgramPackageInfoArgs = {
  projectExId: Scalars["String"]["input"];
};

/** Query root */
export type QueryExistCodeComponentPackageArgs = {
  packageExId: Scalars["String"]["input"];
};

/** Query root */
export type QueryExistCodeComponentPackageVersionArgs = {
  packageExId: Scalars["String"]["input"];
  version: Scalars["String"]["input"];
};

/** Query root */
export type QueryExistsByEmailArgs = {
  email: Scalars["String"]["input"];
};

/** Query root */
export type QueryExistsByPhoneNumberArgs = {
  phoneNumber: Scalars["String"]["input"];
};

/** Query root */
export type QueryExpectedZiroomServerInfoArgs = {
  projectExId: Scalars["String"]["input"];
};

/** Query root */
export type QueryFaviconUrlArgs = {
  imageExId: Scalars["String"]["input"];
  projectExId: Scalars["String"]["input"];
};

/** Query root */
export type QueryFeaturesArgs = {
  projectExId?: InputMaybe<Scalars["String"]["input"]>;
};

/** Query root */
export type QueryFetchAppDetailByExIdArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  appVersionExId?: InputMaybe<Scalars["String"]["input"]>;
  projectExId: Scalars["String"]["input"];
};

/** Query root */
export type QueryFetchAppDetailByExIdWithoutReconcileArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  appVersionExId?: InputMaybe<Scalars["String"]["input"]>;
  projectExId: Scalars["String"]["input"];
};

/** Query root */
export type QueryFetchJsonByProjectExIdFromCrdtModelArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  projectExId: Scalars["String"]["input"];
  versionExId?: InputMaybe<Scalars["String"]["input"]>;
  withPatches: Scalars["Boolean"]["input"];
};

/** Query root */
export type QueryFetchJsonBySchemaIdFromCrdtModelArgs = {
  schemaId: Scalars["Long"]["input"];
  withPatches: Scalars["Boolean"]["input"];
};

/** Query root */
export type QueryFindActiveSingleTenantResourceInfoAndThrowOnExpireTimeMismatchArgs =
  {
    projectExId: Scalars["String"]["input"];
  };

/** Query root */
export type QueryFindByCategoryExIdArgs = {
  categoryExId?: InputMaybe<Scalars["String"]["input"]>;
};

/** Query root */
export type QueryFindCouponsByStatusArgs = {
  couponStatus: CouponStatus;
  paginator?: InputMaybe<ConnectionPaginatorInput>;
};

/** Query root */
export type QueryFindEditorComponentsArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  paginator?: InputMaybe<ConnectionPaginatorInput>;
  platform: Platform;
  projectExId: Scalars["String"]["input"];
};

/** Query root */
export type QueryFindOtherProjectsAuthorizedWithWechatAppIdArgs = {
  appId: Scalars["String"]["input"];
  projectExId: Scalars["String"]["input"];
};

/** Query root */
export type QueryFindPromoCodeByCodeArgs = {
  code: Scalars["String"]["input"];
};

/** Query root */
export type QueryFindPromoCodeByIdArgs = {
  id: Scalars["Long"]["input"];
};

/** Query root */
export type QueryFindRedemptionCodeByCodeArgs = {
  code: Scalars["String"]["input"];
};

/** Query root */
export type QueryFindSortedCouponAndOrderDetailsArgs = {
  purchaseItemDetailInputs: Array<PurchaseItemDetailInputInput>;
};

/** Query root */
export type QueryFindVerificationCodeArgs = {
  sentTo: Scalars["String"]["input"];
  type: VerificationCodeType;
};

/** Query root */
export type QueryFindViewerByEmailArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  email: Scalars["String"]["input"];
  projectExId: Scalars["String"]["input"];
};

/** Query root */
export type QueryFindViewerByPhoneNumberArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  phoneNumber: Scalars["String"]["input"];
  projectExId: Scalars["String"]["input"];
};

/** Query root */
export type QueryFindWechatMiniProgramAuditArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  projectExId: Scalars["String"]["input"];
};

/** Query root */
export type QueryFirstTimeAuditArgs = {
  projectExId: Scalars["String"]["input"];
};

/** Query root */
export type QueryFuzzySearchEditorComponentsArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  nameToFuzzySearch: Scalars["String"]["input"];
  paginator?: InputMaybe<ConnectionPaginatorInput>;
  platform: Platform;
  projectExId: Scalars["String"]["input"];
};

/** Query root */
export type QueryFuzzySearchMemberNameArgs = {
  memberName: Scalars["String"]["input"];
  orgExId?: InputMaybe<Scalars["String"]["input"]>;
  paginator?: InputMaybe<ConnectionPaginatorInput>;
};

/** Query root */
export type QueryFuzzySearchOrganizationNameArgs = {
  orgName: Scalars["String"]["input"];
  paginator?: InputMaybe<ConnectionPaginatorInput>;
};

/** Query root */
export type QueryFuzzySearchProjectNameArgs = {
  paginator?: InputMaybe<ConnectionPaginatorInput>;
  projectName: Scalars["String"]["input"];
};

/** Query root */
export type QueryGenerateBuildAppConfigWithRecordIdArgs = {
  deploymentRecordId: Scalars["Long"]["input"];
  targetZedVersion?: InputMaybe<Scalars["String"]["input"]>;
};

/** Query root */
export type QueryGenerateDefaultProjectNameByTemplateIdArgs = {
  templateExId?: InputMaybe<Scalars["String"]["input"]>;
};

/** Query root */
export type QueryGenerateMultiClientMobileBuildAppConfigWithRecordIdArgs = {
  deploymentRecordId: Scalars["Long"]["input"];
  targetZedVersion?: InputMaybe<Scalars["String"]["input"]>;
};

/** Query root */
export type QueryGenerateMultiClientWechatBuildAppConfigWithRecordIdArgs = {
  deploymentRecordId: Scalars["Long"]["input"];
  targetZedVersion?: InputMaybe<Scalars["String"]["input"]>;
};

/** Query root */
export type QueryGenerateShareTokenArgs = {
  collaboratorType: CollaboratorType;
  projectExId: Scalars["String"]["input"];
  shareConfig?: InputMaybe<ShareConfigInput>;
};

/** Query root */
export type QueryGenerateShareTokenV2Args = {
  collaboratorType: CollaboratorType;
  projectExId: Scalars["String"]["input"];
  shareConfig?: InputMaybe<ShareConfigInput>;
};

/** Query root */
export type QueryGetBannerItemsArgs = {
  paginator?: InputMaybe<ConnectionPaginatorInput>;
};

/** Query root */
export type QueryGetCodeComponentDocFileUrlArgs = {
  packageExId: Scalars["String"]["input"];
};

/** Query root */
export type QueryGetEvaluationResultByIdArgs = {
  id: Scalars["String"]["input"];
};

/** Query root */
export type QueryGetEvaluationResultsArgs = {
  filters?: InputMaybe<ResultFilters>;
};

/** Query root */
export type QueryGetEvaluationSessionByIdArgs = {
  id: Scalars["String"]["input"];
};

/** Query root */
export type QueryGetEvaluationSessionsArgs = {
  filters?: InputMaybe<SessionFilters>;
};

/** Query root */
export type QueryGetFileByExIdArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  fileExId: Scalars["String"]["input"];
  projectExId: Scalars["String"]["input"];
};

/** Query root */
export type QueryGetFileByIdArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  fileId: Scalars["Long"]["input"];
  projectExId: Scalars["String"]["input"];
};

/** Query root */
export type QueryGetGoldenSetByIdArgs = {
  id: Scalars["String"]["input"];
};

/** Query root */
export type QueryGetGoldenSetsArgs = {
  filters?: InputMaybe<GoldenSetFilters>;
};

/** Query root */
export type QueryGetImageByExIdArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  imageExId: Scalars["String"]["input"];
  projectExId?: InputMaybe<Scalars["String"]["input"]>;
};

/** Query root */
export type QueryGetImageByIdArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  imageId: Scalars["Long"]["input"];
  projectExId?: InputMaybe<Scalars["String"]["input"]>;
};

/** Query root */
export type QueryGetImageListByExIdsArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  imageExIds?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>>>;
  projectExId: Scalars["String"]["input"];
};

/** Query root */
export type QueryGetImageListByIdsArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  imageIds?: InputMaybe<Array<InputMaybe<Scalars["Long"]["input"]>>>;
  projectExId: Scalars["String"]["input"];
};

/** Query root */
export type QueryGetImagesArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  paginator?: InputMaybe<ConnectionPaginatorInput>;
  projectExId: Scalars["String"]["input"];
};

/** Query root */
export type QueryGetQueryByIdArgs = {
  queryId: Scalars["Long"]["input"];
};

/** Query root */
export type QueryGetRubricByContextArgs = {
  context: CopilotInput;
};

/** Query root */
export type QueryGetRubricByIdArgs = {
  id: Scalars["String"]["input"];
};

/** Query root */
export type QueryGetVideoByExIdArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  projectExId: Scalars["String"]["input"];
  videoExId: Scalars["String"]["input"];
};

/** Query root */
export type QueryGetVideoByIdArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  projectExId: Scalars["String"]["input"];
  videoId: Scalars["Long"]["input"];
};

/** Query root */
export type QueryHasSubmittedNonTestingAuditTodayArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  projectExId: Scalars["String"]["input"];
};

/** Query root */
export type QueryImitateArgs = {
  accountExIdToImitate?: InputMaybe<Scalars["String"]["input"]>;
  accountIdToImitate?: InputMaybe<Scalars["Long"]["input"]>;
  email?: InputMaybe<Scalars["String"]["input"]>;
  phoneNumber?: InputMaybe<Scalars["String"]["input"]>;
  projectExIdToImitate?: InputMaybe<Scalars["String"]["input"]>;
  usernameToImitate?: InputMaybe<Scalars["String"]["input"]>;
};

/** Query root */
export type QueryInspectMingdaoProjectApiArgs = {
  projectExId: Scalars["String"]["input"];
};

/** Query root */
export type QueryInvitationUrlArgs = {
  organizationExId: Scalars["String"]["input"];
};

/** Query root */
export type QueryInvitedUserCountArgs = {
  accountExId: Scalars["String"]["input"];
};

/** Query root */
export type QueryLatestAuditStatusArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  projectExId: Scalars["String"]["input"];
};

/** Query root */
export type QueryLatestWechatMiniProgramAuditArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  projectExId: Scalars["String"]["input"];
};

/** Query root */
export type QueryLatestWechatMiniProgramAuthInfoArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  projectExId: Scalars["String"]["input"];
};

/** Query root */
export type QueryLookupAccountArgs = {
  email?: InputMaybe<Scalars["String"]["input"]>;
  phoneNumber?: InputMaybe<Scalars["String"]["input"]>;
};

/** Query root */
export type QueryMarketRewardEventTypeAndRulesArgs = {
  promoCodeId: Scalars["Long"]["input"];
};

/** Query root */
export type QueryMessagesArgs = {
  category?: InputMaybe<Category>;
  filterContent?: InputMaybe<Scalars["String"]["input"]>;
  paginator?: InputMaybe<ConnectionPaginatorInput>;
};

/** Query root */
export type QueryMonthlyResourceUsageHistoryArgs = {
  projectExId: Scalars["String"]["input"];
  resourceType: ResourceType;
};

/** Query root */
export type QueryNotifyAndCleanUpArgs = {
  configId: Scalars["Long"]["input"];
  plusDays: Scalars["Int"]["input"];
};

/** Query root */
export type QueryOrganizationExpirationStatusArgs = {
  projectExId: Scalars["String"]["input"];
};

/** Query root */
export type QueryOutflowUsageForLastSixMonthsAscByMonthArgs = {
  projectExId: Scalars["String"]["input"];
};

/** Query root */
export type QueryPaymentCycleExpireAtArgs = {
  paidForPlanType: PlanType;
  paymentCycle: PaymentCycle;
};

/** Query root */
export type QueryPendingOrderProductDetailsPaidByAliArgs = {
  projectExId?: InputMaybe<Scalars["String"]["input"]>;
};

/** Query root */
export type QueryPendingZiroomProjectAppointmentArgs = {
  projectExId: Scalars["String"]["input"];
};

/** Query root */
export type QueryPlanTypeArgs = {
  planType: PlanType;
};

/** Query root */
export type QueryPopupHasReadArgs = {
  popupType?: InputMaybe<PopupType>;
};

/** Query root */
export type QueryPreAuthPageUrlArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  projectExId: Scalars["String"]["input"];
};

/** Query root */
export type QueryPriceDetailsArgs = {
  paymentCycle: PaymentCycle;
  planType: PlanType;
};

/** Query root */
export type QueryProductAndPurchasedDetailsArgs = {
  purchaseItemDetailInputs: Array<PurchaseItemDetailInputInput>;
};

/** Query root */
export type QueryProjectArgs = {
  projectExId: Scalars["String"]["input"];
};

/** Query root */
export type QueryProjectAccountsArgs = {
  paginator?: InputMaybe<ConnectionPaginatorInput>;
  projectExId: Scalars["String"]["input"];
};

/** Query root */
export type QueryProjectCommentsArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  paginator?: InputMaybe<ConnectionPaginatorInput>;
  projectExId: Scalars["String"]["input"];
  targetId?: InputMaybe<Scalars["String"]["input"]>;
  targetType?: InputMaybe<ProjectCommentTargetType>;
};

/** Query root */
export type QueryProjectCommentsCountArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  projectExId: Scalars["String"]["input"];
  targetId?: InputMaybe<Scalars["String"]["input"]>;
  targetType?: InputMaybe<ProjectCommentTargetType>;
};

/** Query root */
export type QueryProjectRpsTimescaleArgs = {
  projectExId: Scalars["String"]["input"];
};

/** Query root */
export type QueryProjectSchemaVersionsArgs = {
  paginator?: InputMaybe<ConnectionPaginatorInput>;
  projectExId: Scalars["String"]["input"];
};

/** Query root */
export type QueryProjectTemplateDetailArgs = {
  templateExId?: InputMaybe<Scalars["String"]["input"]>;
};

/** Query root */
export type QueryProjectTemplatesArgs = {
  category?: InputMaybe<Scalars["String"]["input"]>;
  paginator?: InputMaybe<ConnectionPaginatorInput>;
  platform?: InputMaybe<Platform>;
  status?: InputMaybe<Status>;
  visibility: Visibility;
};

/** Query root */
export type QueryProjectTemplatesForAuditorArgs = {
  category?: InputMaybe<Scalars["String"]["input"]>;
  paginator?: InputMaybe<ConnectionPaginatorInput>;
  platform?: InputMaybe<Platform>;
  status?: InputMaybe<Status>;
  visibility?: InputMaybe<Visibility>;
};

/** Query root */
export type QueryProjectWithWechatIdsArgs = {
  projectExId: Scalars["String"]["input"];
};

/** Query root */
export type QueryProjectsFromJoinedOrganizationsConnectionArgs = {
  orgExId: Scalars["String"]["input"];
  paginator?: InputMaybe<ConnectionPaginatorInput>;
};

/** Query root */
export type QueryProjectsFromPersonalSpaceConnectionArgs = {
  paginator?: InputMaybe<ConnectionPaginatorInput>;
};

/** Query root */
export type QueryProjectsFromTeamSpaceConnectionArgs = {
  paginator?: InputMaybe<ConnectionPaginatorInput>;
};

/** Query root */
export type QueryPublicImageByExIdArgs = {
  imageExId: Scalars["String"]["input"];
};

/** Query root */
export type QueryPublicProjectTemplatesArgs = {
  category?: InputMaybe<Scalars["String"]["input"]>;
  paginator?: InputMaybe<ConnectionPaginatorInput>;
  platform?: InputMaybe<Platform>;
};

/** Query root */
export type QueryPublicVideoByExIdArgs = {
  videoExId: Scalars["String"]["input"];
};

/** Query root */
export type QueryPurchaseOrderByExIdArgs = {
  exId: Scalars["String"]["input"];
};

/** Query root */
export type QueryRenderTypeByAvailableAndTagArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  projectExId: Scalars["String"]["input"];
};

/** Query root */
export type QueryResourceUsageAndBurstInfoArgs = {
  nonRealTimeDisplayedResourceTypes?: InputMaybe<
    Array<InputMaybe<ResourceType>>
  >;
  projectExId: Scalars["String"]["input"];
};

/** Query root */
export type QueryResourceUsageInfoArgs = {
  nonRealTimeDisplayedResourceTypes?: InputMaybe<
    Array<InputMaybe<ResourceType>>
  >;
  projectExId: Scalars["String"]["input"];
};

/** Query root */
export type QueryRuntimeConfigArgs = {
  decId: Scalars["Long"]["input"];
};

/** Query root */
export type QuerySchemaBySchemaExIdArgs = {
  schemaExId: Scalars["String"]["input"];
};

/** Query root */
export type QuerySearchCompanyInfoArgs = {
  searchKey: Scalars["String"]["input"];
};

/** Query root */
export type QuerySearchCouponTemplatesArgs = {
  keyword: Scalars["String"]["input"];
};

/** Query root */
export type QuerySearchSchemaWithSpecificRuleArgs = {
  searchRule?: InputMaybe<SearchSchemaRuleInput>;
};

/** Query root */
export type QuerySendOrganizationInvitationArgs = {
  organizationExId: Scalars["String"]["input"];
  sendTo: Scalars["String"]["input"];
};

/** Query root */
export type QuerySessionHistoryArgs = {
  paginator?: InputMaybe<ConnectionPaginatorInput>;
  projectExId: Scalars["String"]["input"];
  sessionType?: InputMaybe<CopilotSessionType>;
};

/** Query root */
export type QueryShareableCollaboratorTypesArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  dataVisualizerExId?: InputMaybe<Scalars["String"]["input"]>;
  projectExId: Scalars["String"]["input"];
};

/** Query root */
export type QuerySharedAppsConnectionArgs = {
  paginator?: InputMaybe<ConnectionPaginatorInput>;
};

/** Query root */
export type QuerySharedProjectsConnectionArgs = {
  paginator?: InputMaybe<ConnectionPaginatorInput>;
};

/** Query root */
export type QuerySingleTenantComputingPowerPriceArgs = {
  currency: Currency;
  period?: InputMaybe<Scalars["Period"]["input"]>;
  projectExId: Scalars["String"]["input"];
  purchaseOperation: ComputingPowerKitPurchaseOperation;
  quantity?: InputMaybe<Scalars["Int"]["input"]>;
};

/** Query root */
export type QuerySortedResourceSourceInfoArgs = {
  projectId: Scalars["Long"]["input"];
  resourceType?: InputMaybe<ResourceType>;
};

/** Query root */
export type QuerySupportedPaymentTypeAndMethodsArgs = {
  channel?: InputMaybe<PaymentChannel>;
  purchaseItemDetailInputs: Array<PurchaseItemDetailInputInput>;
};

/** Query root */
export type QueryTemplateExIdForPromotionArgs = {
  projectExId: Scalars["String"]["input"];
};

/** Query root */
export type QueryThirdPartyApiDebugArgs = {
  body?: InputMaybe<Scalars["Json"]["input"]>;
  caX509PemBase64?: InputMaybe<Scalars["String"]["input"]>;
  method: HttpMethod;
  requestHeaders: Scalars["Map_String_ObjectScalar"]["input"];
  urlFormat: Scalars["String"]["input"];
  urlPathParameters: Scalars["Map_String_StringScalar"]["input"];
  urlQueryParameters: Scalars["Map_String_StringScalar"]["input"];
};

/** Query root */
export type QueryTotalPageNumRenderedBySsgArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  projectExId: Scalars["String"]["input"];
};

/** Query root */
export type QueryTriggerZvmGeneratorStatusByRecordIdArgs = {
  triggerZvmGeneratorRecordId: Scalars["Long"]["input"];
};

/** Query root */
export type QueryTutorialInfoArgs = {
  functionality: Functionality;
};

/** Query root */
export type QueryUnreadMessageCountArgs = {
  popupArea?: InputMaybe<SiteArea>;
  projectExId?: InputMaybe<Scalars["String"]["input"]>;
};

/** Query root */
export type QueryUnreadMessagesToPopupArgs = {
  category?: InputMaybe<Category>;
  paginator?: InputMaybe<ConnectionPaginatorInput>;
  popupArea: SiteArea;
  projectExId?: InputMaybe<Scalars["String"]["input"]>;
};

/** Query root */
export type QueryUserQuestionsByVersionArgs = {
  version: UserQuestionVersion;
};

/** Query root */
export type QueryValidateComponentMapJsonArgs = {
  componentMapJson?: InputMaybe<Scalars["Json"]["input"]>;
};

/** Query root */
export type QueryValidateInvitationArgs = {
  invitationExId: Scalars["String"]["input"];
};

/** Query root */
export type QueryValidateLegalTableNameArgs = {
  existTableSet: Array<InputMaybe<Scalars["String"]["input"]>>;
  tableName: Scalars["String"]["input"];
};

/** Query root */
export type QueryVerifyDeveloperPasswordArgs = {
  password: Scalars["String"]["input"];
};

/** Query root */
export type QueryViewerCountArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  projectExId: Scalars["String"]["input"];
};

/** Query root */
export type QueryViewersConnectionArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  paginator?: InputMaybe<ConnectionPaginatorInput>;
  projectExId: Scalars["String"]["input"];
};

/** Query root */
export type QueryWebOwnershipVerificationFileUrlArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  projectExId: Scalars["String"]["input"];
  versionExId?: InputMaybe<Scalars["String"]["input"]>;
};

/** Query root */
export type QueryWebPublishPageBannerArgs = {
  projectExId: Scalars["String"]["input"];
};

/** Query root */
export type QueryWebhookEndpointArgs = {
  exId: Scalars["String"]["input"];
};

/** Query root */
export type QueryWechatMessageTemplateListArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  projectExId: Scalars["String"]["input"];
};

/** Query root */
export type QueryWechatMiniProgramPackageInfoArgs = {
  projectExId: Scalars["String"]["input"];
};

/** Query root */
export type QueryWxworkCallbackUrlsArgs = {
  projectExId: Scalars["String"]["input"];
};

/** Query root */
export type QueryWxworkPreAuthPageUrlArgs = {
  projectExId: Scalars["String"]["input"];
};

/** Query root */
export type QueryZiroomMigrationBannerArgs = {
  projectExId: Scalars["String"]["input"];
};

export type QueueInput = {
  host?: InputMaybe<Scalars["String"]["input"]>;
  password?: InputMaybe<Scalars["String"]["input"]>;
  port?: InputMaybe<Scalars["String"]["input"]>;
  user?: InputMaybe<Scalars["String"]["input"]>;
  vhostApiUrl?: InputMaybe<Scalars["String"]["input"]>;
};

export enum ReasonToUseZion {
  ToBecomeZionDeveloper = "TO_BECOME_ZION_DEVELOPER",
  ToBuildCompanyProject = "TO_BUILD_COMPANY_PROJECT",
  ToBuildCustomizedProject = "TO_BUILD_CUSTOMIZED_PROJECT",
  ToBuildPersonalProject = "TO_BUILD_PERSONAL_PROJECT",
}

export type RedemptionCode = {
  __typename: "RedemptionCode";
  allMarketRewardRules?: Maybe<Array<MarketRewardRule>>;
  code?: Maybe<Scalars["String"]["output"]>;
  createdAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  description?: Maybe<Scalars["String"]["output"]>;
  exId: Scalars["String"]["output"];
  marketRewardRule?: Maybe<MarketRewardRule>;
  totalAmount: Scalars["Long"]["output"];
  usedAmount: Scalars["Long"]["output"];
  usedUp: Scalars["Boolean"]["output"];
};

export type RedemptionCodeInputInput = {
  code?: InputMaybe<Scalars["String"]["input"]>;
  description: Scalars["String"]["input"];
  effectiveAt?: InputMaybe<Scalars["OffsetDateTime"]["input"]>;
  expireAt?: InputMaybe<Scalars["OffsetDateTime"]["input"]>;
  newUserOnly: Scalars["Boolean"]["input"];
  rewardDetails: Array<MarketRewardDetailInputInput>;
  totalAmount: Scalars["Long"]["input"];
};

export type RegionConfig = {
  __typename: "RegionConfig";
  accessKey?: Maybe<Scalars["String"]["output"]>;
  accessSecret?: Maybe<Scalars["String"]["output"]>;
  endpoint?: Maybe<Scalars["String"]["output"]>;
  internalEndpoint?: Maybe<Scalars["String"]["output"]>;
  pathStyleAccessEnabled: Scalars["Boolean"]["output"];
  region?: Maybe<Scalars["String"]["output"]>;
  uploadTriggerApiKey?: Maybe<Scalars["String"]["output"]>;
  uploadTriggerLambdaUrl?: Maybe<Scalars["String"]["output"]>;
};

export type RegionConfigInput = {
  accessKey?: InputMaybe<Scalars["String"]["input"]>;
  accessSecret?: InputMaybe<Scalars["String"]["input"]>;
  endpoint?: InputMaybe<Scalars["String"]["input"]>;
  internalEndpoint?: InputMaybe<Scalars["String"]["input"]>;
  pathStyleAccessEnabled: Scalars["Boolean"]["input"];
  region?: InputMaybe<Scalars["String"]["input"]>;
  uploadTriggerApiKey?: InputMaybe<Scalars["String"]["input"]>;
  uploadTriggerLambdaUrl?: InputMaybe<Scalars["String"]["input"]>;
};

export type RenewInfoV2 = {
  __typename: "RenewInfoV2";
  activeRenew: Scalars["Boolean"]["output"];
  paymentMethod?: Maybe<PaymentMethod>;
  remainingDays: Scalars["Long"]["output"];
};

export enum ResizeMode {
  Fill = "FILL",
  Fixed = "FIXED",
  Lfit = "LFIT",
  Mfit = "MFIT",
  Pad = "PAD",
}

export type ResizeOptionInput = {
  height?: InputMaybe<Scalars["Int"]["input"]>;
  mode?: InputMaybe<ResizeMode>;
  width?: InputMaybe<Scalars["Int"]["input"]>;
};

export type ResourceSourceInfo = {
  __typename: "ResourceSourceInfo";
  availableAmount: Scalars["Float"]["output"];
  expirationStatus: ExpirationStatus;
  expireAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  resourceType: ResourceType;
  sourceType: SourceTypeOfProjectResource;
  usedAmount: Scalars["Float"]["output"];
};

export enum ResourceType {
  AppAiToken = "APP_AI_TOKEN",
  AutomaticActionFlow = "AUTOMATIC_ACTION_FLOW",
  BlockStorage = "BLOCK_STORAGE",
  Cpu = "CPU",
  Memory = "MEMORY",
  ObjectStorage = "OBJECT_STORAGE",
  Outflow = "OUTFLOW",
  Rps = "RPS",
  Sms = "SMS",
}

export type ResourceUsage = {
  __typename: "ResourceUsage";
  resourceType?: Maybe<ResourceType>;
  totalResource?: Maybe<Limit>;
  usedResource?: Maybe<Limit>;
};

export type ResultFilters = {
  copilotOutputId?: InputMaybe<Scalars["String"]["input"]>;
  evaluatorId?: InputMaybe<Scalars["String"]["input"]>;
  rubricId?: InputMaybe<Scalars["String"]["input"]>;
};

export type Role = {
  __typename: "Role";
  roleName?: Maybe<Scalars["String"]["output"]>;
};

export type RpsAtInstant = {
  __typename: "RpsAtInstant";
  rps: Scalars["Float"]["output"];
  time?: Maybe<Scalars["OffsetDateTime"]["output"]>;
};

export type Rubric = {
  __typename: "Rubric";
  criterion: Array<Criteria>;
  goldenSetId: Scalars["String"]["output"];
  id: Scalars["String"]["output"];
  userInputId: Scalars["String"]["output"];
};

export type RuntimeAlertInputInput = {
  ziroomPostgresOom?: InputMaybe<ZiroomPostgresOomAlertInputInput>;
  ziroomSupportServiceOom?: InputMaybe<ZiroomSupportServiceOomAlertInputInput>;
};

export type SamlConfig = SsoConfig & {
  __typename: "SamlConfig";
  enabled: Scalars["Boolean"]["output"];
  expirationDuration?: Maybe<Scalars["Long"]["output"]>;
  id?: Maybe<Scalars["String"]["output"]>;
  protocol?: Maybe<SsoProtocol>;
  providerName?: Maybe<Scalars["String"]["output"]>;
};

export type SchemaCrdtPatch = {
  __typename: "SchemaCrdtPatch";
  authorAccountExId: Scalars["String"]["output"];
  content: Scalars["Json"]["output"];
  createdAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  exId: Scalars["String"]["output"];
  patchBase64: Scalars["String"]["output"];
  projectSchemaExId?: Maybe<Scalars["String"]["output"]>;
  sessionId?: Maybe<Scalars["String"]["output"]>;
  uuid?: Maybe<Scalars["UUID"]["output"]>;
  webAppSchemaExId?: Maybe<Scalars["String"]["output"]>;
  wechatMiniProgramAppSchemaExId?: Maybe<Scalars["String"]["output"]>;
  zedVersion?: Maybe<Scalars["String"]["output"]>;
};

export type SchemaCrdtPatchCreationDtoInput = {
  content: Scalars["Json"]["input"];
  patchBase64: Scalars["String"]["input"];
  uuid: Scalars["UUID"]["input"];
};

export type SchemaCrdtPatches = {
  __typename: "SchemaCrdtPatches";
  lastPatchExId?: Maybe<Scalars["String"]["output"]>;
  patches?: Maybe<Array<Maybe<SchemaCrdtPatch>>>;
};

export enum SchemaMigrationJobType {
  AddFileColumnToMessageContent = "ADD_FILE_COLUMN_TO_MESSAGE_CONTENT",
  AddVideoColumnToMessageContent = "ADD_VIDEO_COLUMN_TO_MESSAGE_CONTENT",
  ComponentRefactor = "COMPONENT_REFACTOR",
  ConvertFormatAndMappingToFormula = "CONVERT_FORMAT_AND_MAPPING_TO_FORMULA",
  DataModelRmSpacesInDisplayName = "DATA_MODEL_RM_SPACES_IN_DISPLAY_NAME",
  FixDataBindingInTargetActionFlowNodes = "FIX_DATA_BINDING_IN_TARGET_ACTION_FLOW_NODES",
  MigrateAiModelToCustomIdentifier = "MIGRATE_AI_MODEL_TO_CUSTOM_IDENTIFIER",
  MigrateToTypeDefinition = "MIGRATE_TO_TYPE_DEFINITION",
  SingletonConcatToSingleValueDb = "SINGLETON_CONCAT_TO_SINGLE_VALUE_DB",
  TableTypeInputToBigintAsId = "TABLE_TYPE_INPUT_TO_BIGINT_AS_ID",
  TriggerInputDbConcatToSingle = "TRIGGER_INPUT_DB_CONCAT_TO_SINGLE",
}

export type SchemaPathItemInput = {
  index?: InputMaybe<Scalars["Int"]["input"]>;
  key?: InputMaybe<Scalars["String"]["input"]>;
};

export enum SchemaSynchronizedFeature {
  AlipayConfig = "ALIPAY_CONFIG",
  /** @deprecated Deprecated */
  OpenPayment = "OPEN_PAYMENT",
  /** @deprecated Deprecated */
  OpenZai = "OPEN_ZAI",
  Payment = "PAYMENT",
  StripePaymentConfig = "STRIPE_PAYMENT_CONFIG",
  WechatPaymentConfig = "WECHAT_PAYMENT_CONFIG",
  Zai = "ZAI",
}

export type SchemaSynchronizedFeatureOperationInput = {
  enableFeature: Scalars["Boolean"]["input"];
  feature: SchemaSynchronizedFeature;
};

export type SchemaUploadEndV3 = SchemaUploadNotificationV3 & {
  __typename: "SchemaUploadEndV3";
  appId?: Maybe<Scalars["Long"]["output"]>;
  continuous: Scalars["Boolean"]["output"];
  projectId: Scalars["Long"]["output"];
  schemaExId?: Maybe<Scalars["String"]["output"]>;
  schemaId: Scalars["Long"]["output"];
};

export type SchemaUploadNotificationV3 = {
  appId?: Maybe<Scalars["Long"]["output"]>;
  projectId: Scalars["Long"]["output"];
};

export type SchemaUploadStartV3 = SchemaUploadNotificationV3 & {
  __typename: "SchemaUploadStartV3";
  appId?: Maybe<Scalars["Long"]["output"]>;
  projectId: Scalars["Long"]["output"];
};

export type SchemaZedVersionValidationResult = {
  __typename: "SchemaZedVersionValidationResult";
  createSchemaZedVersion?: Maybe<Scalars["String"]["output"]>;
  latestZedVersion?: Maybe<Scalars["String"]["output"]>;
  schemaMigrationCompleted: Scalars["Boolean"]["output"];
};

export type SdkSignature = {
  __typename: "SdkSignature";
  agents: Array<Maybe<Agent>>;
  nonceStr: Scalars["String"]["output"];
  signature: Scalars["String"]["output"];
  timeStamp: Scalars["Long"]["output"];
};

export type SearchSchemaRuleInput = {
  key?: InputMaybe<Scalars["String"]["input"]>;
  valueMatcher?: InputMaybe<ValueMatcherInput>;
};

export enum SendMethod {
  Email = "EMAIL",
  Sms = "SMS",
}

export type SessionFilters = {
  copilotOutputId?: InputMaybe<Scalars["String"]["input"]>;
  evaluatorId?: InputMaybe<Scalars["String"]["input"]>;
  evaluatorType?: InputMaybe<EvaluatorType>;
  rubricId?: InputMaybe<Scalars["String"]["input"]>;
};

export type SetDataBindingToolArgsInput = {
  humanInputMessage?: InputMaybe<CopilotHumanInputMessageInput>;
  schemaPath: Array<InputMaybe<SchemaPathItemInput>>;
  toolCallBatchExecErrorMessage?: InputMaybe<CopilotToolCallBatchExecErrorMessageInput>;
  toolCallBatchResponseMessage?: InputMaybe<CopilotToolCallBatchResponseMessageInput>;
};

export type SetPhoneNumberFailure = {
  __typename: "SetPhoneNumberFailure";
  failureDetail: Scalars["Json"]["output"];
  type: SetPhoneNumberFailureType;
};

export enum SetPhoneNumberFailureType {
  PhoneNumberAlreadyExists = "PHONE_NUMBER_ALREADY_EXISTS",
}

export type SetPhoneNumberResult = {
  __typename: "SetPhoneNumberResult";
  accountInfo?: Maybe<AccountInfo>;
  failure?: Maybe<SetPhoneNumberFailure>;
  set: Scalars["Boolean"]["output"];
};

export type ShareConfigInput = {
  expiredDays: Scalars["Int"]["input"];
  permission?: InputMaybe<SharePermissionInput>;
};

export type SharePermission = {
  __typename: "SharePermission";
  cloneEnable: Scalars["Boolean"]["output"];
};

export type SharePermissionInput = {
  cloneEnable: Scalars["Boolean"]["input"];
};

export type ShareToken = {
  __typename: "ShareToken";
  code?: Maybe<Scalars["String"]["output"]>;
  collaboratorType?: Maybe<CollaboratorType>;
  expireAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  permission?: Maybe<SharePermission>;
  usageLimit: Scalars["Int"]["output"];
  usedCount: Scalars["Int"]["output"];
};

export enum SignStatus {
  Fail = "FAIL",
  Success = "SUCCESS",
}

export enum SignatureAlgorithm {
  Es256 = "ES256",
  Es384 = "ES384",
  Es512 = "ES512",
  Hs256 = "HS256",
  Hs384 = "HS384",
  Hs512 = "HS512",
  None = "NONE",
  Ps256 = "PS256",
  Ps384 = "PS384",
  Ps512 = "PS512",
  Rs256 = "RS256",
  Rs384 = "RS384",
  Rs512 = "RS512",
}

export type SimplifiedServerSchema = {
  __typename: "SimplifiedServerSchema";
  actionFlows?: Maybe<Scalars["Json"]["output"]>;
  apis?: Maybe<Scalars["Json"]["output"]>;
  dataModel?: Maybe<Scalars["Json"]["output"]>;
  enabledCallbackConfigurations?: Maybe<Scalars["Json"]["output"]>;
  zAiConfigs?: Maybe<Scalars["Json"]["output"]>;
};

export type SingleTenantComputingPowerKitPurchaseItemDetailInput = {
  currency: Currency;
  period?: InputMaybe<Scalars["Period"]["input"]>;
  projectExId: Scalars["String"]["input"];
  purchaseOperation: ComputingPowerKitPurchaseOperation;
  quantity?: InputMaybe<Scalars["Int"]["input"]>;
};

export type SingleTenantComputingPowerPriceInfo = {
  __typename: "SingleTenantComputingPowerPriceInfo";
  actualUnitPrice: Scalars["BigDecimal"]["output"];
  currency: Currency;
  effectiveAt: Scalars["OffsetDateTime"]["output"];
  expireAt: Scalars["OffsetDateTime"]["output"];
  originalUnitPrice: Scalars["BigDecimal"]["output"];
  quantity: Scalars["Int"]["output"];
};

export enum SiteArea {
  Editor = "EDITOR",
  OfficialSite = "OFFICIAL_SITE",
  UserCenter = "USER_CENTER",
}

export enum SourceTypeOfProjectResource {
  ComputingPowerAddonResource = "COMPUTING_POWER_ADDON_RESOURCE",
  ComputingPowerKitResource = "COMPUTING_POWER_KIT_RESOURCE",
  OrganizationComputingPowerAddonResource = "ORGANIZATION_COMPUTING_POWER_ADDON_RESOURCE",
  OrganizationComputingPowerKitResource = "ORGANIZATION_COMPUTING_POWER_KIT_RESOURCE",
  OrganizationExclusiveResource = "ORGANIZATION_EXCLUSIVE_RESOURCE",
  OrganizationSharedResource = "ORGANIZATION_SHARED_RESOURCE",
  ProjectPlanResource = "PROJECT_PLAN_RESOURCE",
}

export type SsoConfig = {
  enabled: Scalars["Boolean"]["output"];
  expirationDuration?: Maybe<Scalars["Long"]["output"]>;
  id?: Maybe<Scalars["String"]["output"]>;
  protocol?: Maybe<SsoProtocol>;
  providerName?: Maybe<Scalars["String"]["output"]>;
};

export enum SsoProtocol {
  Oauth2 = "OAUTH2",
  Saml = "SAML",
}

export enum SsoType {
  CustomSso = "CUSTOM_SSO",
  Facebook = "FACEBOOK",
  Google = "GOOGLE",
}

export enum Status {
  InReview = "IN_REVIEW",
  Private = "PRIVATE",
  Published = "PUBLISHED",
  Reject = "REJECT",
}

export type StepAndChapterInput = {
  step?: InputMaybe<TemplateStep>;
  stepChapter?: InputMaybe<StepChapter>;
};

export type StepAndStatus = {
  __typename: "StepAndStatus";
  chapter?: Maybe<StepChapter>;
  chapterSequence: Scalars["Int"]["output"];
  completed: Scalars["Boolean"]["output"];
  sequenceId: Scalars["Long"]["output"];
  step?: Maybe<TemplateStep>;
  stepExId?: Maybe<Scalars["String"]["output"]>;
};

export enum StepChapter {
  AddingComponent = "ADDING_COMPONENT",
  Alignment = "ALIGNMENT",
  DataModel = "DATA_MODEL",
  Interaction = "INTERACTION",
  Mirror = "MIRROR",
  Publish = "PUBLISH",
  StaticData = "STATIC_DATA",
}

export type StoredFile = {
  __typename: "StoredFile";
  createdAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  id: Scalars["Long"]["output"];
  name?: Maybe<Scalars["String"]["output"]>;
  url: Scalars["String"]["output"];
};

export type StoredFileUrlArgs = {
  projectExId?: InputMaybe<Scalars["String"]["input"]>;
};

export type StoredImage = {
  __typename: "StoredImage";
  createdAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  exId: Scalars["String"]["output"];
  url: Scalars["String"]["output"];
};

export type StoredImageUrlArgs = {
  option?: InputMaybe<ImageProcessOptionInput>;
  projectExId?: InputMaybe<Scalars["String"]["input"]>;
};

export type StoredVideo = {
  __typename: "StoredVideo";
  createdAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  exId: Scalars["String"]["output"];
  url: Scalars["String"]["output"];
};

export type StoredVideoUrlArgs = {
  projectExId?: InputMaybe<Scalars["String"]["input"]>;
};

export type StripeAccount = {
  __typename: "StripeAccount";
  stripeAccountId?: Maybe<Scalars["String"]["output"]>;
};

export enum StripeClientSecretType {
  PaymentIntent = "PAYMENT_INTENT",
  SetupIntent = "SETUP_INTENT",
}

export type StripePayConfig = {
  __typename: "StripePayConfig";
  callbackUrl?: Maybe<Scalars["String"]["output"]>;
  endpointSecret?: Maybe<Scalars["String"]["output"]>;
  paymentConfigVersion?: Maybe<PaymentConfigVersion>;
  stripePrivateKey?: Maybe<Scalars["String"]["output"]>;
  stripePublicKey?: Maybe<Scalars["String"]["output"]>;
};

export type StripePayConfigInput = {
  callbackUrl?: InputMaybe<Scalars["String"]["input"]>;
  endpointSecret?: InputMaybe<Scalars["String"]["input"]>;
  paymentConfigVersion?: InputMaybe<PaymentConfigVersion>;
  stripePrivateKey?: InputMaybe<Scalars["String"]["input"]>;
  stripePublicKey?: InputMaybe<Scalars["String"]["input"]>;
};

export type StripeResult = PaymentResult & {
  __typename: "StripeResult";
  checkoutUrlForFreeTrial?: Maybe<Scalars["String"]["output"]>;
  clientSecret: Scalars["String"]["output"];
  clientSecretType: StripeClientSecretType;
  orderExId: Scalars["String"]["output"];
  paymentExId: Scalars["String"]["output"];
  paymentId: Scalars["Long"]["output"];
  paymentType?: Maybe<PaymentType>;
};

/** Subscription root */
export type Subscription = {
  __typename: "Subscription";
  accountAndCollaborateType?: Maybe<CollaborationInfo>;
  currentComputingPowerCartItems?: Maybe<Array<ComputingPowerCartItem>>;
  currentPlanType?: Maybe<PlanType>;
  dummyOnWechatMiniProgramAuditStatusUpdate?: Maybe<WechatApiGetLatestAuditStatusResponseEntity>;
  editorComponentsChanged: Scalars["Boolean"]["output"];
  findWechatMiniProgramAuditOnStatusChanged?: Maybe<
    Array<Maybe<WechatMiniprogramAudit>>
  >;
  hasBeenAuthorizedByWechatMiniProgramV2?: Maybe<Scalars["Boolean"]["output"]>;
  hasNewCoupon: Scalars["Boolean"]["output"];
  hasNewIssuedBalance: Scalars["Boolean"]["output"];
  hasNewMessage: Scalars["Boolean"]["output"];
  onAppCreated: App;
  onAppDeploymentStatusChanged: App;
  onAppDetailChanged: App;
  onBackendOnlyAppPublished: Project;
  onBeginnerGuidePublisher?: Maybe<BeginnerGuide>;
  onComputingPowerOrderStatusChanged?: Maybe<OrderStatus>;
  onCopilotSessionUpdate?: Maybe<CopilotMessage>;
  onCustomDomainListStatusChange?: Maybe<Array<Maybe<CustomDomain>>>;
  onCustomDomainStatusChange?: Maybe<CustomDomain>;
  onDataVisualizerDeleted?: Maybe<Scalars["Boolean"]["output"]>;
  onDataVisualizerDetailChanged: DataVisualizer;
  onDataVisualizerUpload?: Maybe<DataVisualizerUploadNotification>;
  onDataVisualizersChanged: Array<DataVisualizer>;
  onDeployedSchemaChanged?: Maybe<Scalars["Boolean"]["output"]>;
  onDeploymentStatusChangedForDec: DeploymentEnvConfig;
  onDevEnvironmentStatus?: Maybe<DevEnvironmentStatus>;
  onEducationDiscountCreation?: Maybe<EducationDiscountAndInstitution>;
  onLatestEnvMergeRecordStatusUpdated?: Maybe<EnvMergeRecord>;
  onLatestEnvSyncRecordStatusUpdated?: Maybe<EnvMergeRecord>;
  onLatestSchemaGenerated?: Maybe<Scalars["String"]["output"]>;
  onNewCrdtPatchV2?: Maybe<SchemaCrdtPatches>;
  onNewlyReadAuditStatus?: Maybe<Scalars["Boolean"]["output"]>;
  onNewlyReadDeploymentStatus?: Maybe<Scalars["Boolean"]["output"]>;
  onOrderStatusChanged: PurchaseOrder;
  onPaymentStatusChanged?: Maybe<PaymentStatus>;
  onProjectAuditEnabledStateChange: Array<PlatformAuditEnabledState>;
  onProjectCommentEvent: ProjectCommentEvent;
  onProjectCreationStatusChanged?: Maybe<ProjectCreationResult>;
  onProjectDelete?: Maybe<Scalars["Boolean"]["output"]>;
  onProjectEditingAccounts?: Maybe<Array<Maybe<Account>>>;
  onProjectPlanOrderStatusChanged?: Maybe<OrderStatus>;
  onProjectPlanWithTemplateOrderStatusChanged?: Maybe<ProjectPlanWithTemplateOutput>;
  onProjectResetStatusChanged?: Maybe<ProjectResetStatus>;
  onProjectVersionStatus?: Maybe<ProjectVersionStatus>;
  onSchemaUploadV3?: Maybe<SchemaUploadNotificationV3>;
  onSelectComponent?: Maybe<Scalars["String"]["output"]>;
  onTaskChange?: Maybe<Task>;
  onWechatAccountBinding?: Maybe<Account>;
  onWechatAuthorizationStatusChange?: Maybe<WechatAuthorizationStatus>;
  onWechatBetaAppAuthChanged?: Maybe<Scalars["Boolean"]["output"]>;
  onWechatConfigUpdate?: Maybe<WechatAppConfig>;
  onWechatConfigUpdateV2?: Maybe<WechatAppConfig>;
  onWechatMiniProgramAuditStatusUpdate?: Maybe<WechatApiGetLatestAuditStatusResponseEntity>;
  onWechatMiniProgramAuthEvent: WechatMiniProgramAuthEvent;
  onWechatQrAuthAttemptStatusChanged?: Maybe<WechatQrAuthAttempt>;
  onWxworkAuthorizationEvent: WxworkAuthorizationEvent;
  onWxworkConfigUpdate?: Maybe<WxworkAuthConfig>;
  onWxworkSuiteStatusChangedEvent: WxworkSuiteStatusChangedEvent;
  onZiroomProjectMigrationStatusChanged?: Maybe<ZiroomProjectMigrationRecord>;
  wechatPublishPageBanner?: Maybe<WechatPublishPageBanner>;
};

/** Subscription root */
export type SubscriptionAccountAndCollaborateTypeArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  projectExId: Scalars["String"]["input"];
};

/** Subscription root */
export type SubscriptionCurrentComputingPowerCartItemsArgs = {
  projectExId: Scalars["String"]["input"];
};

/** Subscription root */
export type SubscriptionDummyOnWechatMiniProgramAuditStatusUpdateArgs = {
  projectExId: Scalars["String"]["input"];
};

/** Subscription root */
export type SubscriptionEditorComponentsChangedArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  projectExId: Scalars["String"]["input"];
};

/** Subscription root */
export type SubscriptionFindWechatMiniProgramAuditOnStatusChangedArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  projectExId: Scalars["String"]["input"];
};

/** Subscription root */
export type SubscriptionHasBeenAuthorizedByWechatMiniProgramV2Args = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  projectExId: Scalars["String"]["input"];
};

/** Subscription root */
export type SubscriptionHasNewMessageArgs = {
  popupArea?: InputMaybe<SiteArea>;
  projectExId?: InputMaybe<Scalars["String"]["input"]>;
};

/** Subscription root */
export type SubscriptionOnAppCreatedArgs = {
  projectExId: Scalars["String"]["input"];
};

/** Subscription root */
export type SubscriptionOnAppDeploymentStatusChangedArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  projectExId: Scalars["String"]["input"];
};

/** Subscription root */
export type SubscriptionOnAppDetailChangedArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  appVersionExId?: InputMaybe<Scalars["String"]["input"]>;
  projectExId: Scalars["String"]["input"];
};

/** Subscription root */
export type SubscriptionOnBackendOnlyAppPublishedArgs = {
  projectExId: Scalars["String"]["input"];
};

/** Subscription root */
export type SubscriptionOnComputingPowerOrderStatusChangedArgs = {
  projectExId: Scalars["String"]["input"];
};

/** Subscription root */
export type SubscriptionOnCopilotSessionUpdateArgs = {
  sessionExId: Scalars["String"]["input"];
};

/** Subscription root */
export type SubscriptionOnCustomDomainListStatusChangeArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  projectExId: Scalars["String"]["input"];
};

/** Subscription root */
export type SubscriptionOnCustomDomainStatusChangeArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  customDomainExId: Scalars["String"]["input"];
  projectExId: Scalars["String"]["input"];
};

/** Subscription root */
export type SubscriptionOnDataVisualizerDeletedArgs = {
  dataVisualizerExId: Scalars["String"]["input"];
};

/** Subscription root */
export type SubscriptionOnDataVisualizerDetailChangedArgs = {
  dataVisualizerExId: Scalars["String"]["input"];
};

/** Subscription root */
export type SubscriptionOnDataVisualizerUploadArgs = {
  appVersionExId?: InputMaybe<Scalars["String"]["input"]>;
  projectExId: Scalars["String"]["input"];
};

/** Subscription root */
export type SubscriptionOnDataVisualizersChangedArgs = {
  appVersionExId?: InputMaybe<Scalars["String"]["input"]>;
  projectExId: Scalars["String"]["input"];
};

/** Subscription root */
export type SubscriptionOnDeployedSchemaChangedArgs = {
  projectExId: Scalars["String"]["input"];
  projectVersionExId: Scalars["String"]["input"];
};

/** Subscription root */
export type SubscriptionOnDeploymentStatusChangedForDecArgs = {
  deploymentEnvConfigExId: Scalars["String"]["input"];
};

/** Subscription root */
export type SubscriptionOnDevEnvironmentStatusArgs = {
  projectExId: Scalars["String"]["input"];
};

/** Subscription root */
export type SubscriptionOnLatestEnvMergeRecordStatusUpdatedArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  fromProjectVersionExId?: InputMaybe<Scalars["String"]["input"]>;
  projectExId: Scalars["String"]["input"];
  toProjectVersionExId?: InputMaybe<Scalars["String"]["input"]>;
};

/** Subscription root */
export type SubscriptionOnLatestEnvSyncRecordStatusUpdatedArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  fromProjectVersionExId?: InputMaybe<Scalars["String"]["input"]>;
  projectExId: Scalars["String"]["input"];
  toProjectVersionExId?: InputMaybe<Scalars["String"]["input"]>;
};

/** Subscription root */
export type SubscriptionOnLatestSchemaGeneratedArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  projectExId: Scalars["String"]["input"];
};

/** Subscription root */
export type SubscriptionOnNewCrdtPatchV2Args = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  latestPatchExIdInClient?: InputMaybe<Scalars["String"]["input"]>;
  projectExId: Scalars["String"]["input"];
  shouldExcludeSameSessionDiffs?: InputMaybe<Scalars["Boolean"]["input"]>;
  versionExId?: InputMaybe<Scalars["String"]["input"]>;
};

/** Subscription root */
export type SubscriptionOnNewlyReadAuditStatusArgs = {
  projectExId: Scalars["String"]["input"];
};

/** Subscription root */
export type SubscriptionOnNewlyReadDeploymentStatusArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  appVersionExId?: InputMaybe<Scalars["String"]["input"]>;
  buildTarget: BuildTarget;
  projectExId: Scalars["String"]["input"];
};

/** Subscription root */
export type SubscriptionOnOrderStatusChangedArgs = {
  orderExId: Scalars["String"]["input"];
};

/** Subscription root */
export type SubscriptionOnPaymentStatusChangedArgs = {
  paymentExId: Scalars["String"]["input"];
};

/** Subscription root */
export type SubscriptionOnProjectAuditEnabledStateChangeArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  appVersionExId?: InputMaybe<Scalars["String"]["input"]>;
  projectExId: Scalars["String"]["input"];
};

/** Subscription root */
export type SubscriptionOnProjectCommentEventArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  projectExId: Scalars["String"]["input"];
  shouldExcludeSameSessionEvent: Scalars["Boolean"]["input"];
};

/** Subscription root */
export type SubscriptionOnProjectCreationStatusChangedArgs = {
  uniqueId: Scalars["String"]["input"];
};

/** Subscription root */
export type SubscriptionOnProjectDeleteArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  projectExId: Scalars["String"]["input"];
};

/** Subscription root */
export type SubscriptionOnProjectEditingAccountsArgs = {
  projectExId: Scalars["String"]["input"];
};

/** Subscription root */
export type SubscriptionOnProjectPlanOrderStatusChangedArgs = {
  projectExId: Scalars["String"]["input"];
};

/** Subscription root */
export type SubscriptionOnProjectPlanWithTemplateOrderStatusChangedArgs = {
  paymentExId: Scalars["String"]["input"];
};

/** Subscription root */
export type SubscriptionOnProjectResetStatusChangedArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  projectExId: Scalars["String"]["input"];
};

/** Subscription root */
export type SubscriptionOnProjectVersionStatusArgs = {
  projectExId: Scalars["String"]["input"];
  projectVersionExId: Scalars["String"]["input"];
};

/** Subscription root */
export type SubscriptionOnSchemaUploadV3Args = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  appVersionExId?: InputMaybe<Scalars["String"]["input"]>;
  projectExId: Scalars["String"]["input"];
  shouldExcludeSameSessionEvent?: InputMaybe<Scalars["Boolean"]["input"]>;
};

/** Subscription root */
export type SubscriptionOnSelectComponentArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  projectExId: Scalars["String"]["input"];
};

/** Subscription root */
export type SubscriptionOnWechatAuthorizationStatusChangeArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  projectExId: Scalars["String"]["input"];
};

/** Subscription root */
export type SubscriptionOnWechatBetaAppAuthChangedArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  projectExId: Scalars["String"]["input"];
};

/** Subscription root */
export type SubscriptionOnWechatConfigUpdateArgs = {
  projectExId: Scalars["String"]["input"];
};

/** Subscription root */
export type SubscriptionOnWechatConfigUpdateV2Args = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  projectExId: Scalars["String"]["input"];
};

/** Subscription root */
export type SubscriptionOnWechatMiniProgramAuditStatusUpdateArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  projectExId: Scalars["String"]["input"];
};

/** Subscription root */
export type SubscriptionOnWechatMiniProgramAuthEventArgs = {
  appExId?: InputMaybe<Scalars["String"]["input"]>;
  projectExId: Scalars["String"]["input"];
};

/** Subscription root */
export type SubscriptionOnWechatQrAuthAttemptStatusChangedArgs = {
  wechatQrAuthAttemptExId: Scalars["String"]["input"];
};

/** Subscription root */
export type SubscriptionOnWxworkAuthorizationEventArgs = {
  projectExId: Scalars["String"]["input"];
};

/** Subscription root */
export type SubscriptionOnWxworkConfigUpdateArgs = {
  projectExId: Scalars["String"]["input"];
};

/** Subscription root */
export type SubscriptionOnWxworkSuiteStatusChangedEventArgs = {
  projectExId: Scalars["String"]["input"];
};

/** Subscription root */
export type SubscriptionOnZiroomProjectMigrationStatusChangedArgs = {
  projectExId: Scalars["String"]["input"];
  versionExId?: InputMaybe<Scalars["String"]["input"]>;
};

export enum SuiteInfoStatus {
  Invalid = "INVALID",
  NotSet = "NOT_SET",
  ToBeVerified = "TO_BE_VERIFIED",
  Verified = "VERIFIED",
  VerifiedAndSynchronized = "VERIFIED_AND_SYNCHRONIZED",
}

export enum SupportServiceVersion {
  V2 = "V2",
  V3 = "V3",
}

export type SupportedCustomModelDescriptor = {
  __typename: "SupportedCustomModelDescriptor";
  chatModelDescriptors?: Maybe<Array<Maybe<Scalars["Json"]["output"]>>>;
  embeddingModelDescriptors?: Maybe<Array<Maybe<Scalars["Json"]["output"]>>>;
};

export type SynchronizationDataErrorLog = DeploymentErrorLog & {
  __typename: "SynchronizationDataErrorLog";
  createdAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  errorType?: Maybe<ErrorType>;
  errors?: Maybe<Array<Maybe<SynchronizationDataItemError>>>;
  status?: Maybe<SynchronizationDataResponseStatus>;
};

export type SynchronizationDataItemError = {
  __typename: "SynchronizationDataItemError";
  dataType?: Maybe<SynchronizationDataType>;
  message?: Maybe<Scalars["String"]["output"]>;
  type?: Maybe<Type>;
};

export enum SynchronizationDataResponseStatus {
  MultipleError = "MULTIPLE_ERROR",
  Success = "SUCCESS",
  UnexpectedError = "UNEXPECTED_ERROR",
  UnknownError = "UNKNOWN_ERROR",
  ValidationError = "VALIDATION_ERROR",
}

export enum SynchronizationDataType {
  ActionFlowDefinitions = "ACTION_FLOW_DEFINITIONS",
  CallbackConfiguration = "CALLBACK_CONFIGURATION",
  EventTriggerConfig = "EVENT_TRIGGER_CONFIG",
  McAdminConfig = "MC_ADMIN_CONFIG",
  MediaData = "MEDIA_DATA",
  MigrationFileKeys = "MIGRATION_FILE_KEYS",
  PermissionRole = "PERMISSION_ROLE",
  QuartzJobConfig = "QUARTZ_JOB_CONFIG",
  ResourceControlConfig = "RESOURCE_CONTROL_CONFIG",
  SqlScript = "SQL_SCRIPT",
  TriggerChange = "TRIGGER_CHANGE",
  VectorDataInit = "VECTOR_DATA_INIT",
  WxworkConfig = "WXWORK_CONFIG",
}

export type Task = {
  __typename: "Task";
  id: Scalars["Long"]["output"];
};

export type TechnicalSupportDetail = ProductDetail & {
  __typename: "TechnicalSupportDetail";
  chineseName?: Maybe<Scalars["String"]["output"]>;
  currency?: Maybe<Currency>;
  englishName?: Maybe<Scalars["String"]["output"]>;
  hours: Scalars["Int"]["output"];
  price?: Maybe<Scalars["BigDecimal"]["output"]>;
};

export type TechnicalSupportProductInfo = {
  __typename: "TechnicalSupportProductInfo";
  currency?: Maybe<Currency>;
  hours: Scalars["Int"]["output"];
  price?: Maybe<Scalars["BigDecimal"]["output"]>;
  productExId?: Maybe<Scalars["String"]["output"]>;
};

export type TechnicalSupportPurchaseItemDetailInput = {
  currency: Currency;
  productExId: Scalars["String"]["input"];
  quantity: Scalars["Int"]["input"];
};

export type TemplateApp = {
  __typename: "TemplateApp";
  appType?: Maybe<AppType>;
  exId?: Maybe<Scalars["String"]["output"]>;
  name?: Maybe<Scalars["String"]["output"]>;
};

export enum TemplateStep {
  Action = "ACTION",
  AddColumn = "ADD_COLUMN",
  AddTableField = "ADD_TABLE_FIELD",
  Alignment = "ALIGNMENT",
  DataManipulation = "DATA_MANIPULATION",
  IdentifyStaticDataModificationLocation = "IDENTIFY_STATIC_DATA_MODIFICATION_LOCATION",
  LearnAddingComponents = "LEARN_ADDING_COMPONENTS",
  LearnAddingOnClickAction = "LEARN_ADDING_ON_CLICK_ACTION",
  LearnAddingTableFields = "LEARN_ADDING_TABLE_FIELDS",
  LearnBackendDeployment = "LEARN_BACKEND_DEPLOYMENT",
  LearnComponentSelection = "LEARN_COMPONENT_SELECTION",
  LearnContainerSelectionFromLeftDrawer = "LEARN_CONTAINER_SELECTION_FROM_LEFT_DRAWER",
  LearnDataBaseDataModification = "LEARN_DATA_BASE_DATA_MODIFICATION",
  LearnDisplayingMultipleLinesOfText = "LEARN_DISPLAYING_MULTIPLE_LINES_OF_TEXT",
  LearnDraggingComponentBoxes = "LEARN_DRAGGING_COMPONENT_BOXES",
  LearnHowToAccessMc = "LEARN_HOW_TO_ACCESS_MC",
  LearnHowToBindDynamicData = "LEARN_HOW_TO_BIND_DYNAMIC_DATA",
  LearnHowToExpandActions = "LEARN_HOW_TO_EXPAND_ACTIONS",
  LearnHowToFillOutRow = "LEARN_HOW_TO_FILL_OUT_ROW",
  LearnHowToInsertRow = "LEARN_HOW_TO_INSERT_ROW",
  LearnHowToNavigateToPages = "LEARN_HOW_TO_NAVIGATE_TO_PAGES",
  LearnHowToPrepublish = "LEARN_HOW_TO_PREPUBLISH",
  LearnHowToViewPrepublishedProjects = "LEARN_HOW_TO_VIEW_PREPUBLISHED_PROJECTS",
  LearnLinkingDataInNavigationActions = "LEARN_LINKING_DATA_IN_NAVIGATION_ACTIONS",
  LearnModifyingDefaultStylesOfTextComponents = "LEARN_MODIFYING_DEFAULT_STYLES_OF_TEXT_COMPONENTS",
  LearnPageLayout = "LEARN_PAGE_LAYOUT",
  LearnSelectComponent = "LEARN_SELECT_COMPONENT",
  LearnStaticDataModification = "LEARN_STATIC_DATA_MODIFICATION",
  LearnTextComponentLayoutModification = "LEARN_TEXT_COMPONENT_LAYOUT_MODIFICATION",
  LearnToChangeComponentWidth = "LEARN_TO_CHANGE_COMPONENT_WIDTH",
  LearnToMakeTextComponentFitHeight = "LEARN_TO_MAKE_TEXT_COMPONENT_FIT_HEIGHT",
  LearnToViewDataModel = "LEARN_TO_VIEW_DATA_MODEL",
  LearnUseFocusMode = "LEARN_USE_FOCUS_MODE",
  LearnWhereToAddActions = "LEARN_WHERE_TO_ADD_ACTIONS",
  LearnWhereToAddComponentsToPage = "LEARN_WHERE_TO_ADD_COMPONENTS_TO_PAGE",
  LearnWhereToBindDynamicData = "LEARN_WHERE_TO_BIND_DYNAMIC_DATA",
  LearnWhereToPublishProjects = "LEARN_WHERE_TO_PUBLISH_PROJECTS",
  Mirror = "MIRROR",
  Publish = "PUBLISH",
  UseLivePreview = "USE_LIVE_PREVIEW",
}

export type TextContentDetail = WechatAutoReplyContentDetail & {
  __typename: "TextContentDetail";
  content?: Maybe<Scalars["String"]["output"]>;
  type?: Maybe<WechatAutoReplyContentType>;
};

export type TextContentDetailInput = {
  content?: InputMaybe<Scalars["String"]["input"]>;
};

export type ThirdPartyApiConfig = {
  __typename: "ThirdPartyApiConfig";
  enabled?: Maybe<Scalars["Boolean"]["output"]>;
  graphqlSchemaDefinitionObjectKey?: Maybe<Scalars["String"]["output"]>;
  graphqlSchemaObjectKey?: Maybe<Scalars["String"]["output"]>;
  thirdPartyApiConfigObjectKeyList?: Maybe<
    Array<Maybe<Scalars["String"]["output"]>>
  >;
  thirdPartyApiSchemaDefinitionObjectKey?: Maybe<Scalars["String"]["output"]>;
  thirdPartyApiSchemaObjectKey?: Maybe<Scalars["String"]["output"]>;
};

export type TimeRangeInput = {
  endAt?: InputMaybe<Scalars["OffsetDateTime"]["input"]>;
  startAt?: InputMaybe<Scalars["OffsetDateTime"]["input"]>;
};

export type TipContent = {
  __typename: "TipContent";
  chineseContent: Scalars["String"]["output"];
  englishContent: Scalars["String"]["output"];
  hyperLink?: Maybe<Scalars["String"]["output"]>;
};

export enum TrialPeriod {
  MonthTrial = "MONTH_TRIAL",
  ThreeDaysTrial = "THREE_DAYS_TRIAL",
  TwoWeekTrial = "TWO_WEEK_TRIAL",
  WeekTrial = "WEEK_TRIAL",
}

export enum TriggerZvmGeneratorStatus {
  Canceled = "CANCELED",
  Failed = "FAILED",
  InProgress = "IN_PROGRESS",
  Pending = "PENDING",
  Successful = "SUCCESSFUL",
}

export enum Type {
  BadSqlGrammar = "BAD_SQL_GRAMMAR",
  DuplicateKey = "DUPLICATE_KEY",
  MigrationFileNotExecute = "MIGRATION_FILE_NOT_EXECUTE",
  MigrationFileNotExistsInOss = "MIGRATION_FILE_NOT_EXISTS_IN_OSS",
  Unknown = "UNKNOWN",
}

export type UserAnswerChoiceInput = {
  answerContent?: InputMaybe<Scalars["String"]["input"]>;
  choiceId: Scalars["Long"]["input"];
};

export type UserAnswerInput = {
  answerContentByChoiceId?: InputMaybe<
    Scalars["Map_Long_StringScalar"]["input"]
  >;
  choices?: InputMaybe<Array<InputMaybe<UserAnswerChoiceInput>>>;
  questionAnswerContent?: InputMaybe<Scalars["String"]["input"]>;
  selectedChoiceIds?: InputMaybe<Array<InputMaybe<Scalars["Long"]["input"]>>>;
};

export enum UserAnswerType {
  BlankFilling = "BLANK_FILLING",
  MultipleChoice = "MULTIPLE_CHOICE",
  SingleChoice = "SINGLE_CHOICE",
}

export type UserChoice = {
  __typename: "UserChoice";
  chineseText: Scalars["String"]["output"];
  englishText: Scalars["String"]["output"];
  exId: Scalars["String"]["output"];
  icon?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["Long"]["output"];
  nextFillInBlank?: Maybe<UserFillInBlank>;
  nextQuestionId?: Maybe<Scalars["Long"]["output"]>;
  questionExId: Scalars["String"]["output"];
  questionId: Scalars["Long"]["output"];
  tipContent?: Maybe<TipContent>;
};

export enum UserDeploymentEnvironment {
  Production = "PRODUCTION",
  Uat = "UAT",
}

export type UserFillInBlank = {
  __typename: "UserFillInBlank";
  chinesePlaceholder?: Maybe<Scalars["String"]["output"]>;
  englishPlaceholder?: Maybe<Scalars["String"]["output"]>;
};

/**
 * A user input represents a test case prompt or query that will be sent
 * to the copilot being evaluated.
 */
export type UserInput = {
  __typename: "UserInput";
  /** The actual prompt or query content */
  content: Scalars["String"]["output"];
  /** Timestamp when input was added */
  createdAt: Scalars["String"]["output"];
  /** Account ID of creator */
  createdBy?: Maybe<Scalars["String"]["output"]>;
  /** Unique identifier */
  id: Scalars["String"]["output"];
};

export type UserInputInput = {
  content: Scalars["String"]["input"];
  createdBy?: InputMaybe<Scalars["String"]["input"]>;
};

export type UserQuestion = {
  __typename: "UserQuestion";
  chineseText: Scalars["String"]["output"];
  choices: Array<UserChoice>;
  englishText: Scalars["String"]["output"];
  exId: Scalars["String"]["output"];
  fillInBlank?: Maybe<UserFillInBlank>;
  id: Scalars["Long"]["output"];
  placeholderI18nKey?: Maybe<Scalars["String"]["output"]>;
  productType: ApplicationProductType;
  required: Scalars["Boolean"]["output"];
  tipContent?: Maybe<TipContent>;
  type: UserAnswerType;
};

export type UserQuestionAndAnswerInput = {
  answer: UserAnswerInput;
  questionId: Scalars["Long"]["input"];
};

export enum UserQuestionVersion {
  V1 = "V1",
  V2 = "V2",
  V3 = "V3",
  V4 = "V4",
}

export type UserTutorialPreference = {
  __typename: "UserTutorialPreference";
  accountId: Scalars["Long"]["output"];
  functionality?: Maybe<Functionality>;
  showTutorial: Scalars["Boolean"]["output"];
};

export type UsernameAuthConfig = {
  __typename: "UsernameAuthConfig";
  enabled: Scalars["Boolean"]["output"];
  expirationDuration?: Maybe<Scalars["Long"]["output"]>;
};

export type UtmParamInput = {
  utmCampaign?: InputMaybe<Scalars["String"]["input"]>;
  utmContent?: InputMaybe<Scalars["String"]["input"]>;
  utmMedium?: InputMaybe<Scalars["String"]["input"]>;
  utmSource?: InputMaybe<Scalars["String"]["input"]>;
  utmTerm?: InputMaybe<Scalars["String"]["input"]>;
};

export type ValueMatcherInput = {
  targetValue?: InputMaybe<Scalars["Json"]["input"]>;
  valueTransformJoltScripts?: InputMaybe<
    Array<InputMaybe<Scalars["Map_String_ObjectScalar"]["input"]>>
  >;
};

export enum VerificationCodeType {
  BindAccountWechatOauthInfo = "BIND_ACCOUNT_WECHAT_OAUTH_INFO",
  DeleteAccount = "DELETE_ACCOUNT",
  Registration = "REGISTRATION",
  ResetEmail = "RESET_EMAIL",
  ResetPassword = "RESET_PASSWORD",
  SetPhoneNumber = "SET_PHONE_NUMBER",
}

export enum VerificationRecordType {
  Certification = "CERTIFICATION",
  HostOwnership = "HOST_OWNERSHIP",
  Proxy = "PROXY",
}

export type VerifyResult = {
  __typename: "VerifyResult";
  verifyMessage?: Maybe<Scalars["String"]["output"]>;
  verifyResult: Scalars["Boolean"]["output"];
};

export type Video = {
  __typename: "Video";
  url: Scalars["String"]["output"];
};

export type VideoUrlArgs = {
  projectExId?: InputMaybe<Scalars["String"]["input"]>;
};

export type VideoPresignedResult = {
  __typename: "VideoPresignedResult";
  contentType?: Maybe<Scalars["String"]["output"]>;
  downloadUrl?: Maybe<Scalars["String"]["output"]>;
  uploadHeaders?: Maybe<Scalars["Map_String_StringScalar"]["output"]>;
  uploadUrl?: Maybe<Scalars["String"]["output"]>;
  videoExId?: Maybe<Scalars["String"]["output"]>;
  videoId: Scalars["Long"]["output"];
};

export type ViewButtonInput = {
  name?: InputMaybe<Scalars["String"]["input"]>;
  url?: InputMaybe<Scalars["String"]["input"]>;
};

export enum Visibility {
  Private = "PRIVATE",
  Public = "PUBLIC",
}

export type WebApp = App & {
  __typename: "WebApp";
  additional: Scalars["Boolean"]["output"];
  appExId?: Maybe<Scalars["String"]["output"]>;
  appType?: Maybe<AppType>;
  canPublishWebToProd: Scalars["Boolean"]["output"];
  collaboratorType: CollaboratorType;
  collaboratorTypeByLevel?: Maybe<
    Scalars["Map_CollaboratorLevel_CollaboratorTypeScalar"]["output"]
  >;
  collaboratorsAndType?: Maybe<Array<AccountAndCollaborateType>>;
  config?: Maybe<WebConfig>;
  createdAt: Scalars["OffsetDateTime"]["output"];
  deleted: Scalars["Boolean"]["output"];
  devEnvironmentEnable: Scalars["Boolean"]["output"];
  exId?: Maybe<Scalars["String"]["output"]>;
  expireAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  hasCustomDomain?: Maybe<Scalars["Boolean"]["output"]>;
  hasPublished: Scalars["Boolean"]["output"];
  isExpired: Scalars["Boolean"]["output"];
  isRenewable: Scalars["Boolean"]["output"];
  lastAllPipelinePlatformStatus: Array<BuildTargetPipelineStatus>;
  lastCompletedPipelinePlatformStatus: Array<BuildTargetPipelineStatus>;
  lastOpenedAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  latestDeployedServerSchema?: Maybe<Scalars["Json"]["output"]>;
  latestSchema?: Maybe<CrdtSchema>;
  name: Scalars["String"]["output"];
  project: Project;
  projectExId: Scalars["String"]["output"];
  readWebAppAccounts?: Maybe<Array<Maybe<AccountReadApp>>>;
  sharePermission: SharePermission;
  status?: Maybe<WebAppStatus>;
  webConfig?: Maybe<WebConfig>;
  webCustomDomainCnameRecords?: Maybe<Array<CustoDomainCnameRecord>>;
  webCustomDomainSslReady: Scalars["Boolean"]["output"];
  webCustomDomainStatus?: Maybe<CustomDomainConfigStatus>;
  webFreeProdDomain?: Maybe<Scalars["String"]["output"]>;
  webProdDomain?: Maybe<Scalars["String"]["output"]>;
  webZvmBetaQRCodeBase64?: Maybe<Scalars["String"]["output"]>;
  webZvmBetaSchemaExId?: Maybe<Scalars["String"]["output"]>;
  webZvmBetaUrl?: Maybe<Scalars["String"]["output"]>;
  webZvmQRCodeBase64?: Maybe<Scalars["String"]["output"]>;
  webZvmSchemaExId?: Maybe<Scalars["String"]["output"]>;
  webZvmUrl?: Maybe<Scalars["String"]["output"]>;
};

export type WebAppDeploymentOutput = DeploymentErrorLog & {
  __typename: "WebAppDeploymentOutput";
  createdAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  deploymentErrorType?: Maybe<DeploymentErrorType>;
  errorType?: Maybe<ErrorType>;
  log?: Maybe<Scalars["String"]["output"]>;
  status?: Maybe<DeploymentEventStatus>;
};

export enum WebAppStatus {
  Beta = "BETA",
  Created = "CREATED",
  Deleted = "DELETED",
  Published = "PUBLISHED",
}

export type WebAppVersion = {
  __typename: "WebAppVersion";
  appExId?: Maybe<Scalars["String"]["output"]>;
  authorAccountId?: Maybe<Account>;
  createdAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  description?: Maybe<Scalars["String"]["output"]>;
  exId?: Maybe<Scalars["String"]["output"]>;
  name?: Maybe<Scalars["String"]["output"]>;
};

export type WebConfig = {
  __typename: "WebConfig";
  customDomain?: Maybe<Scalars["String"]["output"]>;
  favicon?: Maybe<Scalars["String"]["output"]>;
};

export type WebConfigInput = {
  customDomain?: InputMaybe<Scalars["String"]["input"]>;
  favicon?: InputMaybe<Scalars["String"]["input"]>;
};

export type WebhookEndpoint = {
  __typename: "WebhookEndpoint";
  createdAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  exId: Scalars["String"]["output"];
  updatedAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  url?: Maybe<Scalars["String"]["output"]>;
};

export type WechatApiCodeAndMsgResponseEntity = {
  __typename: "WechatApiCodeAndMsgResponseEntity";
  errcode: Scalars["Int"]["output"];
  errmsg?: Maybe<Scalars["String"]["output"]>;
};

export type WechatApiCodeAndMsgResponseEntityInput = {
  errcode: Scalars["Int"]["input"];
  errmsg?: InputMaybe<Scalars["String"]["input"]>;
};

export type WechatApiGetLatestAuditStatusResponseEntity = {
  __typename: "WechatApiGetLatestAuditStatusResponseEntity";
  auditId?: Maybe<Scalars["String"]["output"]>;
  auditPublishStatus?: Maybe<AuditPublishStatus>;
  createdAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  errcode: Scalars["Int"]["output"];
  errmsg?: Maybe<Scalars["String"]["output"]>;
  published: Scalars["Boolean"]["output"];
  publishedAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  publishedErrorInfo?: Maybe<WechatApiCodeAndMsgResponseEntity>;
  reason?: Maybe<Scalars["String"]["output"]>;
  screenShot?: Maybe<Scalars["String"]["output"]>;
  status?: Maybe<AuditStatus>;
};

export type WechatApiGetLatestAuditStatusResponseEntityInput = {
  ScreenShot?: InputMaybe<Scalars["String"]["input"]>;
  auditid?: InputMaybe<Scalars["String"]["input"]>;
  createdAt?: InputMaybe<Scalars["OffsetDateTime"]["input"]>;
  errcode: Scalars["Int"]["input"];
  errmsg?: InputMaybe<Scalars["String"]["input"]>;
  published: Scalars["Boolean"]["input"];
  publishedAt?: InputMaybe<Scalars["OffsetDateTime"]["input"]>;
  publishedErrorInfo?: InputMaybe<WechatApiCodeAndMsgResponseEntityInput>;
  reason?: InputMaybe<Scalars["String"]["input"]>;
  status?: InputMaybe<AuditStatus>;
};

export type WechatApiSubmitAuditResponseEntity = {
  __typename: "WechatApiSubmitAuditResponseEntity";
  auditId?: Maybe<Scalars["String"]["output"]>;
  createdAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  errcode: Scalars["Int"]["output"];
  errmsg?: Maybe<Scalars["String"]["output"]>;
};

export type WechatAppConfig = {
  __typename: "WechatAppConfig";
  appId?: Maybe<Scalars["String"]["output"]>;
  hasGrantedThirdPartyAuthorization: Scalars["Boolean"]["output"];
  orderListPagePath?: Maybe<Scalars["String"]["output"]>;
  paymentConfigVersion?: Maybe<PaymentConfigVersion>;
  wechatAdminId?: Maybe<Scalars["String"]["output"]>;
  wechatAppId?: Maybe<Scalars["String"]["output"]>;
  wechatAppSecret?: Maybe<Scalars["String"]["output"]>;
  wechatBetaAppExpireAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  wechatBetaAppId?: Maybe<Scalars["String"]["output"]>;
  wechatPaymentApiV3Secret?: Maybe<Scalars["String"]["output"]>;
  wechatPaymentBase64Cert?: Maybe<Scalars["String"]["output"]>;
  wechatPaymentBase64CertFileExId?: Maybe<Scalars["String"]["output"]>;
  wechatPaymentMerchantId?: Maybe<Scalars["String"]["output"]>;
  wechatPaymentMerchantKey?: Maybe<Scalars["String"]["output"]>;
  wechatPaymentNotifyUrl?: Maybe<Scalars["String"]["output"]>;
  wechatPaymentPrivateKey?: Maybe<Scalars["String"]["output"]>;
  wechatPaymentSerialNumber?: Maybe<Scalars["String"]["output"]>;
  wechatPrivateKey?: Maybe<Scalars["String"]["output"]>;
  wechatPrivateKeyFileExId?: Maybe<Scalars["String"]["output"]>;
  wechatQrCodePrefix?: Maybe<Scalars["String"]["output"]>;
};

export type WechatAuthConfig = {
  __typename: "WechatAuthConfig";
  appId?: Maybe<Scalars["String"]["output"]>;
  appSecret?: Maybe<Scalars["String"]["output"]>;
  enabled: Scalars["Boolean"]["output"];
  expirationDuration?: Maybe<Scalars["Long"]["output"]>;
};

export enum WechatAuthorizationStatus {
  PrivateKey = "PRIVATE_KEY",
  ThirdPartyPlatform = "THIRD_PARTY_PLATFORM",
  Unauthorized = "UNAUTHORIZED",
}

export type WechatAutoReply = {
  __typename: "WechatAutoReply";
  contents: Array<WechatAutoReplyContent>;
  createdAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  exId: Scalars["String"]["output"];
  name?: Maybe<Scalars["String"]["output"]>;
  updatedAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
};

export type WechatAutoReplyContent = {
  __typename: "WechatAutoReplyContent";
  createdAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  detail?: Maybe<WechatAutoReplyContentDetail>;
  exId: Scalars["String"]["output"];
  updatedAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
};

export type WechatAutoReplyContentDetail = {
  type?: Maybe<WechatAutoReplyContentType>;
};

export type WechatAutoReplyContentInputInput = {
  image?: InputMaybe<ImageContentDetailInput>;
  miniprogram?: InputMaybe<MiniProgramContentDetailInput>;
  text?: InputMaybe<TextContentDetailInput>;
};

export enum WechatAutoReplyContentType {
  Image = "IMAGE",
  MiniProgram = "MINI_PROGRAM",
  Text = "TEXT",
}

export type WechatAutoReplyEventRule = {
  __typename: "WechatAutoReplyEventRule";
  createdAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  eventType?: Maybe<WechatAutoReplyEventType>;
  exId: Scalars["String"]["output"];
  reply: WechatAutoReply;
  updatedAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
};

export enum WechatAutoReplyEventType {
  Scan = "SCAN",
  Subscribe = "SUBSCRIBE",
  Unsubscribe = "UNSUBSCRIBE",
}

export type WechatAutoReplyMessageKeyword = {
  __typename: "WechatAutoReplyMessageKeyword";
  createdAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  exId: Scalars["String"]["output"];
  keyword?: Maybe<Scalars["String"]["output"]>;
  matchType?: Maybe<WechatAutoReplyMessageKeywordMatchType>;
  updatedAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
};

export enum WechatAutoReplyMessageKeywordMatchType {
  Full = "FULL",
  Partial = "PARTIAL",
}

export type WechatAutoReplyMessageRule = {
  __typename: "WechatAutoReplyMessageRule";
  createdAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  exId: Scalars["String"]["output"];
  fallback: Scalars["Boolean"]["output"];
  keywords: Array<WechatAutoReplyMessageKeyword>;
  name?: Maybe<Scalars["String"]["output"]>;
  reply: WechatAutoReply;
  updatedAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
};

export enum WechatMaterialType {
  Image = "IMAGE",
  Thumb = "THUMB",
  Video = "VIDEO",
  Voice = "VOICE",
}

export type WechatMessageTemplate = {
  __typename: "WechatMessageTemplate";
  templateContent?: Maybe<Scalars["String"]["output"]>;
  templateExample?: Maybe<Scalars["String"]["output"]>;
  templateId?: Maybe<Scalars["String"]["output"]>;
  templateTitle?: Maybe<Scalars["String"]["output"]>;
  type: Scalars["Int"]["output"];
};

export type WechatMiniProgramApp = App & {
  __typename: "WechatMiniProgramApp";
  additional: Scalars["Boolean"]["output"];
  appExId?: Maybe<Scalars["String"]["output"]>;
  appType?: Maybe<AppType>;
  collaboratorType: CollaboratorType;
  collaboratorTypeByLevel?: Maybe<
    Scalars["Map_CollaboratorLevel_CollaboratorTypeScalar"]["output"]
  >;
  collaboratorsAndType?: Maybe<Array<AccountAndCollaborateType>>;
  config?: Maybe<WechatAppConfig>;
  createdAt: Scalars["OffsetDateTime"]["output"];
  debugScriptUrl?: Maybe<Scalars["String"]["output"]>;
  deleted: Scalars["Boolean"]["output"];
  devEnvironmentEnable: Scalars["Boolean"]["output"];
  exId?: Maybe<Scalars["String"]["output"]>;
  expireAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  hasPublished: Scalars["Boolean"]["output"];
  isExpired: Scalars["Boolean"]["output"];
  isRenewable: Scalars["Boolean"]["output"];
  lastCompletedPipelineStatus?: Maybe<BuildTargetPipelineStatus>;
  lastOpenedAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  lastPipelineStatus?: Maybe<BuildTargetPipelineStatus>;
  latestDeployedServerSchema?: Maybe<Scalars["Json"]["output"]>;
  latestSchema?: Maybe<CrdtSchema>;
  name: Scalars["String"]["output"];
  project: Project;
  projectExId: Scalars["String"]["output"];
  readWechatMiniProgramAppAccounts?: Maybe<Array<Maybe<AccountReadApp>>>;
  sharePermission: SharePermission;
  status?: Maybe<WechatMiniProgramAppStatus>;
  wechatAppConfig?: Maybe<WechatAppConfig>;
  wechatMiniAppPreviewTime?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  wechatMiniAppPreviewVersion?: Maybe<Scalars["String"]["output"]>;
  wechatMiniAppQRCodeBase64?: Maybe<Scalars["String"]["output"]>;
};

export type WechatMiniProgramAppDebugScriptUrlArgs = {
  appVersionExId?: InputMaybe<Scalars["String"]["input"]>;
};

export type WechatMiniProgramAppWechatMiniAppPreviewTimeArgs = {
  appVersionExId?: InputMaybe<Scalars["String"]["input"]>;
};

export type WechatMiniProgramAppWechatMiniAppPreviewVersionArgs = {
  appVersionExId?: InputMaybe<Scalars["String"]["input"]>;
};

export type WechatMiniProgramAppWechatMiniAppQrCodeBase64Args = {
  appVersionExId?: InputMaybe<Scalars["String"]["input"]>;
};

export type WechatMiniProgramAppArtifactsInput = {
  debugScriptUrl?: InputMaybe<Scalars["String"]["input"]>;
  taro?: InputMaybe<Scalars["String"]["input"]>;
  wechatAppId?: InputMaybe<Scalars["String"]["input"]>;
  wechatMiniApp?: InputMaybe<Scalars["String"]["input"]>;
  wechatMiniAppPreviewTime?: InputMaybe<Scalars["OffsetDateTime"]["input"]>;
  wechatMiniAppPreviewVersion?: InputMaybe<Scalars["String"]["input"]>;
  wechatMiniAppQRcode?: InputMaybe<Scalars["String"]["input"]>;
  wechatMiniAppQRcodeBase64?: InputMaybe<Scalars["String"]["input"]>;
};

export type WechatMiniProgramAppDeploymentOutput = DeploymentErrorLog & {
  __typename: "WechatMiniProgramAppDeploymentOutput";
  createdAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  deploymentErrorType?: Maybe<DeploymentErrorType>;
  errorType?: Maybe<ErrorType>;
  log?: Maybe<Scalars["String"]["output"]>;
  status?: Maybe<DeploymentEventStatus>;
  updatedAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
};

export enum WechatMiniProgramAppStatus {
  Created = "CREATED",
  Deleted = "DELETED",
  Draft = "DRAFT",
  InAuditReview = "IN_AUDIT_REVIEW",
  Published = "PUBLISHED",
}

export type WechatMiniProgramAppVersion = {
  __typename: "WechatMiniProgramAppVersion";
  appExId?: Maybe<Scalars["String"]["output"]>;
  authorAccountId?: Maybe<Account>;
  createdAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  description?: Maybe<Scalars["String"]["output"]>;
  exId?: Maybe<Scalars["String"]["output"]>;
  name?: Maybe<Scalars["String"]["output"]>;
};

export type WechatMiniProgramAuthBindingInfo = {
  __typename: "WechatMiniProgramAuthBindingInfo";
  accountExId?: Maybe<Scalars["String"]["output"]>;
  projectExId?: Maybe<Scalars["String"]["output"]>;
  projectName?: Maybe<Scalars["String"]["output"]>;
  projectStatus?: Maybe<ProjectStatus>;
  userName?: Maybe<Scalars["String"]["output"]>;
};

export type WechatMiniProgramAuthEvent = {
  __typename: "WechatMiniProgramAuthEvent";
  appId?: Maybe<Scalars["String"]["output"]>;
  appSecret?: Maybe<Scalars["String"]["output"]>;
  errorMessage?: Maybe<Scalars["String"]["output"]>;
  nonPublishedWechatMiniProgramAuthBindingInfo?: Maybe<
    Array<Maybe<WechatMiniProgramAuthBindingInfo>>
  >;
  publishedWechatMiniProgramAuthBindingInfo?: Maybe<
    Array<Maybe<WechatMiniProgramAuthBindingInfo>>
  >;
  status?: Maybe<WechatMiniProgramAuthStatus>;
  wechatMiniProgramName?: Maybe<Scalars["String"]["output"]>;
};

export enum WechatMiniProgramAuthStatus {
  AppidHasBeenBind = "APPID_HAS_BEEN_BIND",
  AppidHasBeenPublished = "APPID_HAS_BEEN_PUBLISHED",
  AuthorizedWithOfficialAccount = "AUTHORIZED_WITH_OFFICIAL_ACCOUNT",
  CodeIsExpired = "CODE_IS_EXPIRED",
  GetAuthorizerInfoFailed = "GET_AUTHORIZER_INFO_FAILED",
  Success = "SUCCESS",
  UserLimited = "USER_LIMITED",
  WechatIncorrectPermissionGrantedError = "WECHAT_INCORRECT_PERMISSION_GRANTED_ERROR",
  WechatMiniProgramAuthError = "WECHAT_MINI_PROGRAM_AUTH_ERROR",
}

export type WechatMiniProgramPackageInfo = {
  __typename: "WechatMiniProgramPackageInfo";
  childrenMrefs?: Maybe<Array<Maybe<Scalars["String"]["output"]>>>;
  excessivePackage?: Maybe<Scalars["String"]["output"]>;
  packageSizeInKB: Scalars["Int"]["output"];
  type?: Maybe<WechatMiniProgramPackageType>;
};

export enum WechatMiniProgramPackageType {
  MainPackage = "MAIN_PACKAGE",
  SubPackage = "SUB_PACKAGE",
  TotalPackage = "TOTAL_PACKAGE",
}

export type WechatMiniProgramUgcDeclareInput = {
  auditDesc?: InputMaybe<Scalars["String"]["input"]>;
  hasAuditTeam?: InputMaybe<Scalars["Int"]["input"]>;
  method?: InputMaybe<Scalars["String"]["input"]>;
  otherSceneDesc?: InputMaybe<Scalars["String"]["input"]>;
  scene?: InputMaybe<Scalars["String"]["input"]>;
};

export type WechatMiniprogramAudit = {
  __typename: "WechatMiniprogramAudit";
  appId?: Maybe<Scalars["String"]["output"]>;
  auditId?: Maybe<Scalars["String"]["output"]>;
  auditPublishStatus?: Maybe<AuditPublishStatus>;
  auditRejectReason?: Maybe<Scalars["String"]["output"]>;
  createdAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  deleted: Scalars["Boolean"]["output"];
  feedbackInfo?: Maybe<Scalars["String"]["output"]>;
  forTestOnly: Scalars["Boolean"]["output"];
  hasExpired: Scalars["Boolean"]["output"];
  latestPublish: Scalars["Boolean"]["output"];
  mediaInfo?: Maybe<Array<Maybe<MediaInfo>>>;
  previewTime?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  previewVersion?: Maybe<Scalars["String"]["output"]>;
  projectId: Scalars["Long"]["output"];
  published: Scalars["Boolean"]["output"];
  publishedAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  publishedErrorInfo?: Maybe<WechatApiCodeAndMsgResponseEntity>;
  schemaId: Scalars["Long"]["output"];
  status?: Maybe<AuditStatus>;
  title?: Maybe<Scalars["String"]["output"]>;
  wechatMiniProgramAdminWechatId?: Maybe<Scalars["String"]["output"]>;
  withdrewAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
};

export type WechatPayConfig = {
  __typename: "WechatPayConfig";
  appId: Scalars["String"]["output"];
  mchId: Scalars["String"]["output"];
  mchKey: Scalars["String"]["output"];
  notifyUrl: Scalars["String"]["output"];
  paymentConfigVersion?: Maybe<PaymentConfigVersion>;
  wechatPaymentBase64CertFileExId?: Maybe<Scalars["String"]["output"]>;
};

export type WechatPayConfigInput = {
  appId: Scalars["String"]["input"];
  mchId: Scalars["String"]["input"];
  mchKey: Scalars["String"]["input"];
  notifyUrl: Scalars["String"]["input"];
  paymentConfigVersion?: InputMaybe<PaymentConfigVersion>;
  wechatPaymentBase64CertFileExId?: InputMaybe<Scalars["String"]["input"]>;
};

export type WechatPaymentResult = PaymentResult & {
  __typename: "WechatPaymentResult";
  orderExId: Scalars["String"]["output"];
  paymentExId: Scalars["String"]["output"];
  paymentId: Scalars["Long"]["output"];
  paymentType?: Maybe<PaymentType>;
  qrcodeBase64?: Maybe<Scalars["String"]["output"]>;
  tradeNo?: Maybe<Scalars["String"]["output"]>;
};

export type WechatPublishPageBanner = {
  __typename: "WechatPublishPageBanner";
  backgroundImgUrl?: Maybe<Scalars["String"]["output"]>;
  qrCodeUrl?: Maybe<Scalars["String"]["output"]>;
  text?: Maybe<Scalars["String"]["output"]>;
};

export enum WechatQrAuthActionType {
  Bind = "BIND",
  RegisterOrLogin = "REGISTER_OR_LOGIN",
}

export type WechatQrAuthAttempt = {
  __typename: "WechatQrAuthAttempt";
  accountInfo?: Maybe<AccountInfo>;
  authActionType?: Maybe<WechatQrAuthActionType>;
  errorMessage?: Maybe<Scalars["String"]["output"]>;
  exId: Scalars["String"]["output"];
  qrCodeUrl: Scalars["String"]["output"];
  status?: Maybe<WechatQrAuthStatus>;
  ticket?: Maybe<Scalars["String"]["output"]>;
};

export enum WechatQrAuthStatus {
  Failed = "FAILED",
  Pending = "PENDING",
  Successful = "SUCCESSFUL",
}

export type WechatTemplateApp = {
  __typename: "WechatTemplateApp";
  appId?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["Long"]["output"];
  lockedByDeploymentEnvConfigId?: Maybe<Scalars["Long"]["output"]>;
  lockedByWechatMiniProgramAppId?: Maybe<Scalars["Long"]["output"]>;
  lockedUntil?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  /** backend only query */
  privateKey?: Maybe<Scalars["String"]["output"]>;
  updatedAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
};

export type WechatWebConfig = {
  __typename: "WechatWebConfig";
  appId?: Maybe<Scalars["String"]["output"]>;
  appSecret?: Maybe<Scalars["String"]["output"]>;
};

export type WxworkAuthConfig = {
  __typename: "WxworkAuthConfig";
  corpId?: Maybe<Scalars["String"]["output"]>;
  enabled: Scalars["Boolean"]["output"];
  encodingAesKey?: Maybe<Scalars["String"]["output"]>;
  expirationDuration?: Maybe<Scalars["Long"]["output"]>;
  providerSecret?: Maybe<Scalars["String"]["output"]>;
  status?: Maybe<SuiteInfoStatus>;
  suiteId?: Maybe<Scalars["String"]["output"]>;
  suiteSecret?: Maybe<Scalars["String"]["output"]>;
  token?: Maybe<Scalars["String"]["output"]>;
};

export type WxworkAuthorizationEvent = {
  __typename: "WxworkAuthorizationEvent";
  suiteId?: Maybe<Scalars["String"]["output"]>;
};

export type WxworkCallBackUrlSetting = {
  __typename: "WxworkCallBackUrlSetting";
  businessConfigUrl?: Maybe<Scalars["String"]["output"]>;
  dataCallbackUrl?: Maybe<Scalars["String"]["output"]>;
  instructionCallbackUrl?: Maybe<Scalars["String"]["output"]>;
  postInstallationCallbackDomain?: Maybe<Scalars["String"]["output"]>;
  projectExId?: Maybe<Scalars["String"]["output"]>;
  trustedDomains?: Maybe<Array<Maybe<Scalars["String"]["output"]>>>;
};

export type WxworkSuiteStatusChangedEvent = {
  __typename: "WxworkSuiteStatusChangedEvent";
  status?: Maybe<SuiteInfoStatus>;
};

export type ZedLogConfig = {
  __typename: "ZedLogConfig";
  adminToken?: Maybe<Scalars["String"]["output"]>;
  endpoint?: Maybe<Scalars["String"]["output"]>;
  evenTypeByEnabled?: Maybe<
    Scalars["Map_LogEventType_BooleanScalar"]["output"]
  >;
  logLevels?: Maybe<Array<Maybe<LogLevel>>>;
};

export type ZeroSchemaConfig = {
  __typename: "ZeroSchemaConfig";
  enabled: Scalars["Boolean"]["output"];
  subscriptionEnabled: Scalars["Boolean"]["output"];
  triggerHackEnabled: Scalars["Boolean"]["output"];
};

export type ZiroomPostgresOomAlertInputInput = {
  ziroomId: Scalars["Long"]["input"];
};

export type ZiroomProjectMigrationAppointment = {
  __typename: "ZiroomProjectMigrationAppointment";
  appointmentTime?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  status?: Maybe<ZiroomProjectMigrationAppointmentStatus>;
};

export enum ZiroomProjectMigrationAppointmentStatus {
  Cancelled = "CANCELLED",
  Executed = "EXECUTED",
  Pending = "PENDING",
}

export type ZiroomProjectMigrationRecord = {
  __typename: "ZiroomProjectMigrationRecord";
  createdAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
  fromZiroomServerInfo?: Maybe<ZiroomServerInfo>;
  migrateReason: MigrateReason;
  status: ZiroomProjectMigrationStatus;
  toZiroomServerInfo?: Maybe<ZiroomServerInfo>;
  updatedAt?: Maybe<Scalars["OffsetDateTime"]["output"]>;
};

export enum ZiroomProjectMigrationStatus {
  Failed = "FAILED",
  Migrating = "MIGRATING",
  NotStarted = "NOT_STARTED",
  Successful = "SUCCESSFUL",
}

export type ZiroomServerInfo = {
  __typename: "ZiroomServerInfo";
  chineseName?: Maybe<Scalars["String"]["output"]>;
  cpuCores: Scalars["Float"]["output"];
  englishName?: Maybe<Scalars["String"]["output"]>;
  memoryGbs: Scalars["Float"]["output"];
  numSlot: Scalars["Int"]["output"];
  rpsLimit?: Maybe<Scalars["Int"]["output"]>;
  ziroomServerType: ZiroomServerType;
};

export enum ZiroomServerType {
  Basic = "BASIC",
  Enterprise = "ENTERPRISE",
  Free = "FREE",
  Pro = "PRO",
  SingleTenant = "SINGLE_TENANT",
}

export type ZiroomSupportServiceOomAlertInputInput = {
  ziroomId: Scalars["Long"]["input"];
};

export type DeploymentErrorLog = {
  errorType?: Maybe<ErrorType>;
};
