import type { GraphQLResolveInfo } from "graphql";
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
export type RequireFields<T, K extends keyof T> = Omit<T, K> & {
  [P in K]-?: NonNullable<T[P]>;
};
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
};

export type CopilotInput = {
  __typename: "CopilotInput";
  copilotSessions: Array<Maybe<CopilotSession>>;
  goldenSet: GoldenSet;
  userInput: UserInput;
};

export type CopilotInputInput = {
  goldenSetId: Scalars["String"]["input"];
  userInputId: Scalars["String"]["input"];
};

/**
 * A copilot output represents the expected or actual response from the copilot,
 * including performance metrics (latency, tokens, context usage).
 */
export type CopilotOutput = {
  __typename: "CopilotOutput";
  aiResponse: Scalars["String"]["output"];
  copilotSessionExId: Scalars["String"]["output"];
  /** Timestamp when output was captured */
  createdAt: Scalars["String"]["output"];
  /** The copilot's generated output content */
  editableText: Maybe<Scalars["String"]["output"]>;
  /** Unique identifier */
  id: Scalars["String"]["output"];
};

export type CopilotSession = {
  __typename: "CopilotSession";
  copilotOutput: Maybe<CopilotOutput>;
  id: Scalars["String"]["output"];
  rubrics: Array<Maybe<Rubric>>;
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

export type Criteria = {
  __typename: "Criteria";
  content: Scalars["String"]["output"];
  expectedAnswer: Scalars["Boolean"]["output"];
  id: Scalars["String"]["output"];
  reasoning: Maybe<Scalars["String"]["output"]>;
  rubricId: Scalars["String"]["output"];
  weight: Scalars["Float"]["output"];
};

export type EvaluationInput = {
  criteriaId: Scalars["String"]["input"];
  /** Binary evaluation */
  evaluation: Scalars["Boolean"]["input"];
  /** Detailed explanation of the evaluation */
  feedback: InputMaybe<Scalars["String"]["input"]>;
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
  feedback: Maybe<Scalars["String"]["output"]>;
  /** Unique evaluation record identifier */
  id: Scalars["String"]["output"];
  rubricId: Scalars["String"]["output"];
};

/**
 * An evaluation session represents a single run of the evaluation workflow
 * against a golden set, producing rubric criteria and scored results.
 */
export type EvaluationSession = {
  __typename: "EvaluationSession";
  copilotOutputId: Scalars["String"]["output"];
  /** Timestamp when session started */
  createdAt: Maybe<Scalars["String"]["output"]>;
  evaluationRecords: Array<Maybe<EvaluationRecord>>;
  evaluatorId: Scalars["String"]["output"];
  evaluatorType: EvaluatorType;
  /** Unique session identifier */
  id: Scalars["String"]["output"];
  rubricId: Scalars["String"]["output"];
};

export enum EvaluatorType {
  Agent = "agent",
  Human = "human",
}

/**
 * A golden set represents a collection of test cases (user inputs)
 * and expected copilot outputs for evaluating agent performance.
 * Identified uniquely by (schemaId, copilotType, modelName).
 */
export type GoldenSet = {
  __typename: "GoldenSet";
  /** Unique database identifier */
  id: Scalars["String"]["output"];
  /** External project identifier from Functorz */
  schemaId: Scalars["String"]["output"];
};

export type GoldenSetInput = {
  schemaId: Scalars["String"]["input"];
};

export type HumanEvaluationInput = {
  copilotOutputId: Scalars["String"]["input"];
  evaluations: Array<EvaluationInput>;
  evaluatorId: Scalars["String"]["input"];
  rubricId: Scalars["String"]["input"];
};

export type Mutation = {
  __typename: "Mutation";
  createProject: GoldenSet;
  createUserInput: UserInput;
  deleteProject: Scalars["Boolean"]["output"];
  executeCopilot: CopilotOutput;
  generateRubric: Array<Maybe<Rubric>>;
  initializeGoldenSet: GoldenSet;
  linkGoldenSetToUserInput: Scalars["Boolean"]["output"];
  runCrdtTest: Maybe<Scalars["String"]["output"]>;
  submitHumanEvaluation: EvaluationSession;
};

export type MutationCreateProjectArgs = {
  projectName: InputMaybe<Scalars["String"]["input"]>;
};

export type MutationCreateUserInputArgs = {
  input: UserInputInput;
};

export type MutationDeleteProjectArgs = {
  projectExId: Scalars["String"]["input"];
};

export type MutationExecuteCopilotArgs = {
  context: CopilotInputInput;
};

export type MutationGenerateRubricArgs = {
  context: CopilotInputInput;
};

export type MutationInitializeGoldenSetArgs = {
  input: GoldenSetInput;
};

export type MutationLinkGoldenSetToUserInputArgs = {
  context: CopilotInputInput;
};

export type MutationRunCrdtTestArgs = {
  number: Scalars["Int"]["input"];
};

export type MutationSubmitHumanEvaluationArgs = {
  input: HumanEvaluationInput;
};

export type Query = {
  __typename: "Query";
  getCopilotInput: Array<Maybe<CopilotInput>>;
  getEvaluationSessionById: EvaluationSession;
  getEvaluationSessions: Array<Maybe<EvaluationSession>>;
  getGoldenSetById: GoldenSet;
  getGoldenSetBySchemaId: GoldenSet;
  getRubricById: Rubric;
  getUserInputById: UserInput;
  getUserInputs: Array<Maybe<UserInput>>;
};

export type QueryGetCopilotInputArgs = {
  goldenSetId: InputMaybe<Scalars["String"]["input"]>;
  userInputId: InputMaybe<Scalars["String"]["input"]>;
};

export type QueryGetEvaluationSessionByIdArgs = {
  id: Scalars["String"]["input"];
};

export type QueryGetEvaluationSessionsArgs = {
  filters: InputMaybe<SessionFilters>;
};

export type QueryGetGoldenSetByIdArgs = {
  id: Scalars["String"]["input"];
};

export type QueryGetGoldenSetBySchemaIdArgs = {
  schemaId: Scalars["String"]["input"];
};

export type QueryGetRubricByIdArgs = {
  id: Scalars["String"]["input"];
};

export type QueryGetUserInputByIdArgs = {
  id: Scalars["String"]["input"];
};

export type Rubric = {
  __typename: "Rubric";
  criterion: Array<Criteria>;
  evaluationSessions: Array<Maybe<EvaluationSession>>;
  id: Scalars["String"]["output"];
};

export type SessionFilters = {
  copilotOutputId: InputMaybe<Scalars["String"]["input"]>;
  evaluatorId: InputMaybe<Scalars["String"]["input"]>;
  evaluatorType: InputMaybe<EvaluatorType>;
  rubricId: InputMaybe<Scalars["String"]["input"]>;
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
  /** Unique identifier */
  id: Scalars["String"]["output"];
};

export type UserInputInput = {
  content: Scalars["String"]["input"];
  createdBy: InputMaybe<Scalars["String"]["input"]>;
};

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;

export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<
  TResult,
  TParent = Record<PropertyKey, never>,
  TContext = Record<PropertyKey, never>,
  TArgs = Record<PropertyKey, never>,
> =
  | ResolverFn<TResult, TParent, TContext, TArgs>
  | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo,
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo,
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo,
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<
  TResult,
  TKey extends string,
  TParent,
  TContext,
  TArgs,
> {
  subscribe: SubscriptionSubscribeFn<
    { [key in TKey]: TResult },
    TParent,
    TContext,
    TArgs
  >;
  resolve?: SubscriptionResolveFn<
    TResult,
    { [key in TKey]: TResult },
    TContext,
    TArgs
  >;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<
  TResult,
  TKey extends string,
  TParent,
  TContext,
  TArgs,
> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<
  TResult,
  TKey extends string,
  TParent = Record<PropertyKey, never>,
  TContext = Record<PropertyKey, never>,
  TArgs = Record<PropertyKey, never>,
> =
  | ((
      ...args: any[]
    ) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<
  TTypes,
  TParent = Record<PropertyKey, never>,
  TContext = Record<PropertyKey, never>,
> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo,
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<
  T = Record<PropertyKey, never>,
  TContext = Record<PropertyKey, never>,
> = (
  obj: T,
  context: TContext,
  info: GraphQLResolveInfo,
) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<
  TResult = Record<PropertyKey, never>,
  TParent = Record<PropertyKey, never>,
  TContext = Record<PropertyKey, never>,
  TArgs = Record<PropertyKey, never>,
> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo,
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  Boolean: ResolverTypeWrapper<Scalars["Boolean"]["output"]>;
  CopilotInput: ResolverTypeWrapper<CopilotInput>;
  CopilotInputInput: CopilotInputInput;
  CopilotOutput: ResolverTypeWrapper<CopilotOutput>;
  CopilotSession: ResolverTypeWrapper<CopilotSession>;
  CopilotType: CopilotType;
  Criteria: ResolverTypeWrapper<Criteria>;
  EvaluationInput: EvaluationInput;
  EvaluationRecord: ResolverTypeWrapper<EvaluationRecord>;
  EvaluationSession: ResolverTypeWrapper<EvaluationSession>;
  EvaluatorType: EvaluatorType;
  Float: ResolverTypeWrapper<Scalars["Float"]["output"]>;
  GoldenSet: ResolverTypeWrapper<GoldenSet>;
  GoldenSetInput: GoldenSetInput;
  HumanEvaluationInput: HumanEvaluationInput;
  Int: ResolverTypeWrapper<Scalars["Int"]["output"]>;
  Mutation: ResolverTypeWrapper<Record<PropertyKey, never>>;
  Query: ResolverTypeWrapper<Record<PropertyKey, never>>;
  Rubric: ResolverTypeWrapper<Rubric>;
  SessionFilters: SessionFilters;
  String: ResolverTypeWrapper<Scalars["String"]["output"]>;
  UserInput: ResolverTypeWrapper<UserInput>;
  UserInputInput: UserInputInput;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  Boolean: Scalars["Boolean"]["output"];
  CopilotInput: CopilotInput;
  CopilotInputInput: CopilotInputInput;
  CopilotOutput: CopilotOutput;
  CopilotSession: CopilotSession;
  Criteria: Criteria;
  EvaluationInput: EvaluationInput;
  EvaluationRecord: EvaluationRecord;
  EvaluationSession: EvaluationSession;
  Float: Scalars["Float"]["output"];
  GoldenSet: GoldenSet;
  GoldenSetInput: GoldenSetInput;
  HumanEvaluationInput: HumanEvaluationInput;
  Int: Scalars["Int"]["output"];
  Mutation: Record<PropertyKey, never>;
  Query: Record<PropertyKey, never>;
  Rubric: Rubric;
  SessionFilters: SessionFilters;
  String: Scalars["String"]["output"];
  UserInput: UserInput;
  UserInputInput: UserInputInput;
}>;

export type CopilotInputResolvers<
  ContextType = undefined,
  ParentType extends ResolversParentTypes["CopilotInput"] =
    ResolversParentTypes["CopilotInput"],
> = ResolversObject<{
  copilotSessions: Resolver<
    Array<Maybe<ResolversTypes["CopilotSession"]>>,
    ParentType,
    ContextType
  >;
  goldenSet: Resolver<ResolversTypes["GoldenSet"], ParentType, ContextType>;
  userInput: Resolver<ResolversTypes["UserInput"], ParentType, ContextType>;
}>;

export type CopilotOutputResolvers<
  ContextType = undefined,
  ParentType extends ResolversParentTypes["CopilotOutput"] =
    ResolversParentTypes["CopilotOutput"],
> = ResolversObject<{
  aiResponse: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  copilotSessionExId: Resolver<
    ResolversTypes["String"],
    ParentType,
    ContextType
  >;
  createdAt: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  editableText: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  id: Resolver<ResolversTypes["String"], ParentType, ContextType>;
}>;

export type CopilotSessionResolvers<
  ContextType = undefined,
  ParentType extends ResolversParentTypes["CopilotSession"] =
    ResolversParentTypes["CopilotSession"],
> = ResolversObject<{
  copilotOutput: Resolver<
    Maybe<ResolversTypes["CopilotOutput"]>,
    ParentType,
    ContextType
  >;
  id: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  rubrics: Resolver<
    Array<Maybe<ResolversTypes["Rubric"]>>,
    ParentType,
    ContextType
  >;
}>;

export type CriteriaResolvers<
  ContextType = undefined,
  ParentType extends ResolversParentTypes["Criteria"] =
    ResolversParentTypes["Criteria"],
> = ResolversObject<{
  content: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  expectedAnswer: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  id: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  reasoning: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  rubricId: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  weight: Resolver<ResolversTypes["Float"], ParentType, ContextType>;
}>;

export type EvaluationRecordResolvers<
  ContextType = undefined,
  ParentType extends ResolversParentTypes["EvaluationRecord"] =
    ResolversParentTypes["EvaluationRecord"],
> = ResolversObject<{
  copilotOutputId: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  criteriaId: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  evaluation: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  evaluatorId: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  feedback: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  id: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  rubricId: Resolver<ResolversTypes["String"], ParentType, ContextType>;
}>;

export type EvaluationSessionResolvers<
  ContextType = undefined,
  ParentType extends ResolversParentTypes["EvaluationSession"] =
    ResolversParentTypes["EvaluationSession"],
> = ResolversObject<{
  copilotOutputId: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  createdAt: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  evaluationRecords: Resolver<
    Array<Maybe<ResolversTypes["EvaluationRecord"]>>,
    ParentType,
    ContextType
  >;
  evaluatorId: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  evaluatorType: Resolver<
    ResolversTypes["EvaluatorType"],
    ParentType,
    ContextType
  >;
  id: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  rubricId: Resolver<ResolversTypes["String"], ParentType, ContextType>;
}>;

export type GoldenSetResolvers<
  ContextType = undefined,
  ParentType extends ResolversParentTypes["GoldenSet"] =
    ResolversParentTypes["GoldenSet"],
> = ResolversObject<{
  id: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  schemaId: Resolver<ResolversTypes["String"], ParentType, ContextType>;
}>;

export type MutationResolvers<
  ContextType = undefined,
  ParentType extends ResolversParentTypes["Mutation"] =
    ResolversParentTypes["Mutation"],
> = ResolversObject<{
  createProject: Resolver<
    ResolversTypes["GoldenSet"],
    ParentType,
    ContextType,
    MutationCreateProjectArgs
  >;
  createUserInput: Resolver<
    ResolversTypes["UserInput"],
    ParentType,
    ContextType,
    RequireFields<MutationCreateUserInputArgs, "input">
  >;
  deleteProject: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<MutationDeleteProjectArgs, "projectExId">
  >;
  executeCopilot: Resolver<
    ResolversTypes["CopilotOutput"],
    ParentType,
    ContextType,
    RequireFields<MutationExecuteCopilotArgs, "context">
  >;
  generateRubric: Resolver<
    Array<Maybe<ResolversTypes["Rubric"]>>,
    ParentType,
    ContextType,
    RequireFields<MutationGenerateRubricArgs, "context">
  >;
  initializeGoldenSet: Resolver<
    ResolversTypes["GoldenSet"],
    ParentType,
    ContextType,
    RequireFields<MutationInitializeGoldenSetArgs, "input">
  >;
  linkGoldenSetToUserInput: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<MutationLinkGoldenSetToUserInputArgs, "context">
  >;
  runCrdtTest: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType,
    RequireFields<MutationRunCrdtTestArgs, "number">
  >;
  submitHumanEvaluation: Resolver<
    ResolversTypes["EvaluationSession"],
    ParentType,
    ContextType,
    RequireFields<MutationSubmitHumanEvaluationArgs, "input">
  >;
}>;

export type QueryResolvers<
  ContextType = undefined,
  ParentType extends ResolversParentTypes["Query"] =
    ResolversParentTypes["Query"],
> = ResolversObject<{
  getCopilotInput: Resolver<
    Array<Maybe<ResolversTypes["CopilotInput"]>>,
    ParentType,
    ContextType,
    QueryGetCopilotInputArgs
  >;
  getEvaluationSessionById: Resolver<
    ResolversTypes["EvaluationSession"],
    ParentType,
    ContextType,
    RequireFields<QueryGetEvaluationSessionByIdArgs, "id">
  >;
  getEvaluationSessions: Resolver<
    Array<Maybe<ResolversTypes["EvaluationSession"]>>,
    ParentType,
    ContextType,
    QueryGetEvaluationSessionsArgs
  >;
  getGoldenSetById: Resolver<
    ResolversTypes["GoldenSet"],
    ParentType,
    ContextType,
    RequireFields<QueryGetGoldenSetByIdArgs, "id">
  >;
  getGoldenSetBySchemaId: Resolver<
    ResolversTypes["GoldenSet"],
    ParentType,
    ContextType,
    RequireFields<QueryGetGoldenSetBySchemaIdArgs, "schemaId">
  >;
  getRubricById: Resolver<
    ResolversTypes["Rubric"],
    ParentType,
    ContextType,
    RequireFields<QueryGetRubricByIdArgs, "id">
  >;
  getUserInputById: Resolver<
    ResolversTypes["UserInput"],
    ParentType,
    ContextType,
    RequireFields<QueryGetUserInputByIdArgs, "id">
  >;
  getUserInputs: Resolver<
    Array<Maybe<ResolversTypes["UserInput"]>>,
    ParentType,
    ContextType
  >;
}>;

export type RubricResolvers<
  ContextType = undefined,
  ParentType extends ResolversParentTypes["Rubric"] =
    ResolversParentTypes["Rubric"],
> = ResolversObject<{
  criterion: Resolver<
    Array<ResolversTypes["Criteria"]>,
    ParentType,
    ContextType
  >;
  evaluationSessions: Resolver<
    Array<Maybe<ResolversTypes["EvaluationSession"]>>,
    ParentType,
    ContextType
  >;
  id: Resolver<ResolversTypes["String"], ParentType, ContextType>;
}>;

export type UserInputResolvers<
  ContextType = undefined,
  ParentType extends ResolversParentTypes["UserInput"] =
    ResolversParentTypes["UserInput"],
> = ResolversObject<{
  content: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  createdAt: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  id: Resolver<ResolversTypes["String"], ParentType, ContextType>;
}>;

export type Resolvers<ContextType = undefined> = ResolversObject<{
  CopilotInput: CopilotInputResolvers<ContextType>;
  CopilotOutput: CopilotOutputResolvers<ContextType>;
  CopilotSession: CopilotSessionResolvers<ContextType>;
  Criteria: CriteriaResolvers<ContextType>;
  EvaluationRecord: EvaluationRecordResolvers<ContextType>;
  EvaluationSession: EvaluationSessionResolvers<ContextType>;
  GoldenSet: GoldenSetResolvers<ContextType>;
  Mutation: MutationResolvers<ContextType>;
  Query: QueryResolvers<ContextType>;
  Rubric: RubricResolvers<ContextType>;
  UserInput: UserInputResolvers<ContextType>;
}>;
