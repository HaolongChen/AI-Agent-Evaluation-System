export type Maybe<T> = T | undefined;
export type InputMaybe<T> = T | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type CopilotInput = {
  goldenSetId: Scalars['String']['input'];
  userInputId: Scalars['String']['input'];
};

/**
 * A copilot output represents the expected or actual response from the copilot,
 * including performance metrics (latency, tokens, context usage).
 */
export type CopilotOutput = {
  __typename?: 'CopilotOutput';
  /** The copilot's generated output content */
  content: Scalars['String']['output'];
  /** Timestamp when output was captured */
  createdAt: Scalars['String']['output'];
  /** Parent golden set ID */
  goldenSetId: Scalars['String']['output'];
  /** Unique identifier */
  id: Scalars['String']['output'];
  /** Associated user input ID */
  userInputId: Scalars['String']['output'];
};

/** Type of AI Copilot being evaluated. */
export enum CopilotType {
  /** Workflow builder for action flows */
  ActionFlowBuilder = 'actionFlowBuilder',
  /** General agent builder */
  AgentBuilder = 'agentBuilder',
  /** Data model builder for database schema generation */
  DataModelBuilder = 'dataModelBuilder',
  /** Log analysis assistant */
  LogAnalyzer = 'logAnalyzer',
  /** UI component builder for frontend development */
  UiBuilder = 'uiBuilder'
}

export type Criteria = {
  __typename?: 'Criteria';
  content: Scalars['String']['output'];
  expectation: Scalars['Boolean']['output'];
  id: Scalars['String']['output'];
  reasoning?: Maybe<Scalars['String']['output']>;
  rubricId: Scalars['String']['output'];
  weight: Scalars['Float']['output'];
};

export type EvaluationInput = {
  criteriaId: Scalars['String']['input'];
  /** Binary evaluation */
  evaluation: Scalars['Boolean']['input'];
  /** Detailed explanation of the evaluation */
  feedback?: InputMaybe<Scalars['String']['input']>;
};

/**
 * A judge record captures the agent or human evaluator's assessment
 * of a single rubric criterion.
 */
export type EvaluationRecord = {
  __typename?: 'EvaluationRecord';
  /** Parent rubric criterion session ID */
  copilotOutputId: Scalars['String']['output'];
  criteriaId: Scalars['String']['output'];
  /** Binary evaluation to the criterion question */
  evaluation: Scalars['Boolean']['output'];
  evaluatorId: Scalars['String']['output'];
  /** Optional explanation or reasoning for the evaluation */
  feedback?: Maybe<Scalars['String']['output']>;
  /** Unique evaluation record identifier */
  id: Scalars['String']['output'];
  rubricId: Scalars['String']['output'];
};

/**
 * Final evaluation result aggregating all rubric criterion scores
 * and generating a comprehensive report.
 */
export type EvaluationResult = {
  __typename?: 'EvaluationResult';
  analysis: Scalars['String']['output'];
  /** Audit trail of workflow steps and decisions */
  auditTrace?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  copilotOutputId: Scalars['String']['output'];
  evaluatorId: Scalars['String']['output'];
  /** Unique result identifier */
  id: Scalars['String']['output'];
  /** Aggregated score across all weighted criteria (0 - 100) */
  overallScore: Scalars['Float']['output'];
  rubricId: Scalars['String']['output'];
};

/**
 * An evaluation session represents a single run of the evaluation workflow
 * against a golden set, producing rubric criteria and scored results.
 */
export type EvaluationSession = {
  __typename?: 'EvaluationSession';
  /** Timestamp when session completed (null if still running) */
  completedAt?: Maybe<Scalars['String']['output']>;
  copilotOutputId: Scalars['String']['output'];
  evaluationRecords: Array<Maybe<EvaluationRecord>>;
  evaluatorId: Scalars['String']['output'];
  evaluatorType: EvaluatorType;
  /** Unique session identifier */
  id: Scalars['String']['output'];
  /** LLM model used for agent evaluation (e.g., 'gpt-4o', 'gemini-pro') */
  modelName?: Maybe<Scalars['String']['output']>;
  rubricId: Scalars['String']['output'];
  /** Timestamp when session started */
  startedAt?: Maybe<Scalars['String']['output']>;
};

export enum EvaluatorType {
  Agent = 'agent',
  Human = 'human'
}

/**
 * A golden set represents a collection of test cases (user inputs)
 * and expected copilot outputs for evaluating agent performance.
 * Identified uniquely by (schemaId, copilotType, modelName).
 */
export type GoldenSet = {
  __typename?: 'GoldenSet';
  /** Type of copilot being evaluated */
  copilotType: CopilotType;
  /** Unique database identifier */
  id: Scalars['String']['output'];
  /** Name of the LLM model being evaluated (e.g., 'gpt-4o', 'gemini-pro') */
  modelName?: Maybe<Scalars['String']['output']>;
  /** External project identifier from Functorz */
  schemaId: Scalars['String']['output'];
};

export type GoldenSetFilters = {
  copilotType?: InputMaybe<CopilotType>;
  modelName?: InputMaybe<Scalars['String']['input']>;
  schemaId?: InputMaybe<Scalars['String']['input']>;
};

export type GoldenSetInput = {
  copilotType?: InputMaybe<CopilotType>;
  modelName?: InputMaybe<Scalars['String']['input']>;
  schemaId: Scalars['String']['input'];
};

export type GoldenSetWithInputs = {
  __typename?: 'GoldenSetWithInputs';
  /** Type of copilot being evaluated */
  copilotType: CopilotType;
  /** Unique database identifier */
  id: Scalars['String']['output'];
  /** Name of the LLM model being evaluated (e.g., 'gpt-4o', 'gemini-pro') */
  modelName?: Maybe<Scalars['String']['output']>;
  /** External project identifier from Functorz */
  schemaId: Scalars['String']['output'];
  userInputs: Array<Maybe<UserInput>>;
};

export type HumanEvaluationInput = {
  copilotOutputId: Scalars['String']['input'];
  evaluations: Array<EvaluationInput>;
  evaluatorId: Scalars['String']['input'];
  rubricId: Scalars['String']['input'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createProject: Scalars['String']['output'];
  createUserInput: UserInput;
  deleteProject: Scalars['Boolean']['output'];
  executeCopilot: CopilotOutput;
  generateRubric: Rubric;
  initializeGoldenSet: GoldenSet;
  linkGoldenSetToUserInput: GoldenSetWithInputs;
  submitHumanEvaluation: EvaluationSession;
};


export type MutationCreateProjectArgs = {
  projectName: Scalars['String']['input'];
};


export type MutationCreateUserInputArgs = {
  input: UserInputInput;
};


export type MutationDeleteProjectArgs = {
  projectExId: Scalars['String']['input'];
};


export type MutationExecuteCopilotArgs = {
  context: CopilotInput;
};


export type MutationGenerateRubricArgs = {
  context: CopilotInput;
};


export type MutationInitializeGoldenSetArgs = {
  input: GoldenSetInput;
};


export type MutationLinkGoldenSetToUserInputArgs = {
  context: CopilotInput;
};


export type MutationSubmitHumanEvaluationArgs = {
  input: HumanEvaluationInput;
};

export type Query = {
  __typename?: 'Query';
  getEvaluationResultById: EvaluationResult;
  getEvaluationResults: Array<Maybe<EvaluationResult>>;
  getEvaluationSessionById: EvaluationSession;
  getEvaluationSessions: Array<Maybe<EvaluationSession>>;
  getGoldenSetById: GoldenSet;
  getGoldenSets: Array<Maybe<GoldenSet>>;
  getRubricByContext: Array<Maybe<Rubric>>;
  getRubricById: Rubric;
};


export type QueryGetEvaluationResultByIdArgs = {
  id: Scalars['String']['input'];
};


export type QueryGetEvaluationResultsArgs = {
  filters?: InputMaybe<ResultFilters>;
};


export type QueryGetEvaluationSessionByIdArgs = {
  id: Scalars['String']['input'];
};


export type QueryGetEvaluationSessionsArgs = {
  filters?: InputMaybe<SessionFilters>;
};


export type QueryGetGoldenSetByIdArgs = {
  id: Scalars['String']['input'];
};


export type QueryGetGoldenSetsArgs = {
  filters?: InputMaybe<GoldenSetFilters>;
};


export type QueryGetRubricByContextArgs = {
  context: CopilotInput;
};


export type QueryGetRubricByIdArgs = {
  id: Scalars['String']['input'];
};

export type ResultFilters = {
  copilotOutputId?: InputMaybe<Scalars['String']['input']>;
  evaluatorId?: InputMaybe<Scalars['String']['input']>;
  rubricId?: InputMaybe<Scalars['String']['input']>;
};

export type Rubric = {
  __typename?: 'Rubric';
  criterion: Array<Criteria>;
  goldenSetId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  userInputId: Scalars['String']['output'];
};

export type SessionFilters = {
  copilotOutputId?: InputMaybe<Scalars['String']['input']>;
  evaluatorId?: InputMaybe<Scalars['String']['input']>;
  evaluatorType?: InputMaybe<EvaluatorType>;
  rubricId?: InputMaybe<Scalars['String']['input']>;
};

/**
 * A user input represents a test case prompt or query that will be sent
 * to the copilot being evaluated.
 */
export type UserInput = {
  __typename?: 'UserInput';
  /** The actual prompt or query content */
  content: Scalars['String']['output'];
  /** Timestamp when input was added */
  createdAt: Scalars['String']['output'];
  /** Account ID of creator */
  createdBy?: Maybe<Scalars['String']['output']>;
  /** Unique identifier */
  id: Scalars['String']['output'];
};

export type UserInputInput = {
  content: Scalars['String']['input'];
  createdBy?: InputMaybe<Scalars['String']['input']>;
};
