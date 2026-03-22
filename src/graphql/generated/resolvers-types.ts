export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
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

/**
 * A copilot output represents the expected or actual response from the copilot,
 * including performance metrics (latency, tokens, context usage).
 */
export type CopilotOutput = {
  __typename?: 'CopilotOutput';
  /** The copilot's generated output content */
  content: Scalars['String']['output'];
  /** Percentage of context window utilized */
  contextPercentage?: Maybe<Scalars['Float']['output']>;
  /** Timestamp when output was captured */
  createdAt?: Maybe<Scalars['String']['output']>;
  /** Parent golden set ID */
  goldenSetId: Scalars['Int']['output'];
  /** Unique identifier */
  id: Scalars['Int']['output'];
  /** Number of input tokens consumed */
  inputTokens?: Maybe<Scalars['Int']['output']>;
  /** Number of output tokens generated */
  outputTokens?: Maybe<Scalars['Int']['output']>;
  /** Number of request/response roundtrips */
  roundtripCount?: Maybe<Scalars['Int']['output']>;
  /** Total end-to-end latency in milliseconds */
  totalLatencyMs?: Maybe<Scalars['Int']['output']>;
  /** Total tokens used (input + output) */
  totalTokens?: Maybe<Scalars['Int']['output']>;
  /** Associated user input ID */
  userInputId: Scalars['Int']['output'];
};

/** Type of AI Copilot being evaluated. */
export enum CopilotType {
  /** Workflow builder for action flows */
  ActionflowBuilder = 'ACTIONFLOW_BUILDER',
  /** General agent builder */
  AgentBuilder = 'AGENT_BUILDER',
  /** Data model builder for database schema generation */
  DataModelBuilder = 'DATA_MODEL_BUILDER',
  /** Log analysis assistant */
  LogAnalyzer = 'LOG_ANALYZER',
  /** UI component builder for frontend development */
  UiBuilder = 'UI_BUILDER'
}

/**
 * A judge record captures the agent or human evaluator's assessment
 * of a single rubric criterion.
 */
export type EvaluationRecord = {
  __typename?: 'EvaluationRecord';
  /** Binary answer to the criterion question */
  answer: Scalars['Boolean']['output'];
  /** Parent rubric criterion session ID */
  copilotOutputId: Scalars['Int']['output'];
  evaluatorId: Scalars['String']['output'];
  /** Optional explanation or reasoning for the answer */
  feedback?: Maybe<Scalars['String']['output']>;
  /** Unique evaluation record identifier */
  id: Scalars['Int']['output'];
  questionId: Scalars['String']['output'];
  questionSetId: Scalars['String']['output'];
};

/**
 * Final evaluation result aggregating all rubric criterion scores
 * and generating a comprehensive report.
 */
export type EvaluationResult = {
  __typename?: 'EvaluationResult';
  /** Audit trail of workflow steps and decisions */
  auditTrace?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  copilotOutputId: Scalars['Int']['output'];
  /** Detailed analysis with per-criterion breakdown */
  detailedAnalysis: Scalars['String']['output'];
  evaluatorId: Scalars['String']['output'];
  /** Unique result identifier */
  id: Scalars['Int']['output'];
  /** Aggregated score across all weighted criteria (0 - 100) */
  overallScore: Scalars['Float']['output'];
  questionSetId: Scalars['String']['output'];
  /** Executive summary of evaluation */
  summary: Scalars['String']['output'];
};

/**
 * An evaluation session represents a single run of the evaluation workflow
 * against a golden set, producing rubric criteria and scored results.
 */
export type EvaluationSession = {
  __typename?: 'EvaluationSession';
  answers?: Maybe<Array<Maybe<EvaluationRecord>>>;
  /** Timestamp when session completed (null if still running) */
  completedAt?: Maybe<Scalars['String']['output']>;
  copilotOutputId: Scalars['Int']['output'];
  evaluatorId: Scalars['String']['output'];
  evaluatorType: EvaluatorType;
  /** Unique session identifier */
  id: Scalars['String']['output'];
  /** LLM model used for agent evaluation (e.g., 'gpt-4o', 'gemini-pro') */
  modelName?: Maybe<Scalars['String']['output']>;
  questionSetId: Scalars['String']['output'];
  /** Timestamp when session started */
  startedAt?: Maybe<Scalars['String']['output']>;
};

export enum EvaluatorType {
  Agent = 'AGENT',
  Human = 'HUMAN'
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
  id: Scalars['Int']['output'];
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

export type Mutation = {
  __typename?: 'Mutation';
  createProject: Scalars['String']['output'];
  /**
   * Upsert golden set with a new user input (atomic operation).
   * Creates golden set if it doesn't exist, or adds input to existing one.
   * RECOMMENDED for adding test cases.
   */
  createUserInput: UserInput;
  deleteProject: Scalars['Boolean']['output'];
  executeCopilot: CopilotOutput;
  generateQuestionSet: QuestionSet;
  initializeGoldenSet: GoldenSet;
  linkGoldenSetToUserInput: GoldenSet;
  submitHumanEvaluation: EvaluationSession;
};


export type MutationCreateProjectArgs = {
  projectName: Scalars['String']['input'];
};


export type MutationCreateUserInputArgs = {
  createdBy?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  query: Scalars['String']['input'];
};


export type MutationDeleteProjectArgs = {
  projectExId: Scalars['String']['input'];
};


export type MutationExecuteCopilotArgs = {
  goldenSetId: Scalars['Int']['input'];
  userInputId: Scalars['Int']['input'];
};


export type MutationGenerateQuestionSetArgs = {
  goldenSetId: Scalars['Int']['input'];
  userInputId: Scalars['Int']['input'];
};


export type MutationInitializeGoldenSetArgs = {
  copilotType: CopilotType;
  modelName?: InputMaybe<Scalars['String']['input']>;
  schemaId: Scalars['String']['input'];
};


export type MutationLinkGoldenSetToUserInputArgs = {
  goldenSetId: Scalars['Int']['input'];
  userInputId: Scalars['Int']['input'];
};


export type MutationSubmitHumanEvaluationArgs = {
  answers: Array<QuestionAnswerInput>;
  copilotOutputId: Scalars['Int']['input'];
  evaluatorId: Scalars['String']['input'];
  questionSetId: Scalars['String']['input'];
};

export type Query = {
  __typename?: 'Query';
  /** Get final evaluation result for a completed session. */
  getEvaluationResultById?: Maybe<EvaluationResult>;
  getEvaluationResults: Array<EvaluationResult>;
  /** Retrieve a single evaluation session by ID. */
  getEvaluationSessionById?: Maybe<EvaluationSession>;
  /** List evaluation sessions with optional filtering. */
  getEvaluationSessions?: Maybe<Array<Maybe<EvaluationSession>>>;
  /** Retrieve a single golden set by ID. */
  getGoldenSetById?: Maybe<GoldenSet>;
  /** List golden sets with optional filtering. */
  getGoldenSets?: Maybe<Array<Maybe<GoldenSet>>>;
  /**
   * Get rubric criteria filtered by review parameters.
   * Useful for finding criteria pending human review.
   */
  getQuestionSetByContext: Array<QuestionSet>;
  /** Get all rubric criteria for a specific session. */
  getQuestionSetById?: Maybe<QuestionSet>;
};


export type QueryGetEvaluationResultByIdArgs = {
  id: Scalars['Int']['input'];
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
  id: Scalars['Int']['input'];
};


export type QueryGetGoldenSetsArgs = {
  filters?: InputMaybe<GoldenSetFilters>;
};


export type QueryGetQuestionSetByContextArgs = {
  goldenSetId?: InputMaybe<Scalars['Int']['input']>;
  userInputId?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryGetQuestionSetByIdArgs = {
  id: Scalars['String']['input'];
};

export type Question = {
  __typename?: 'Question';
  content: Scalars['String']['output'];
  expectedAnswer: Scalars['Boolean']['output'];
  id: Scalars['String']['output'];
  questionSetId: Scalars['String']['output'];
  title?: Maybe<Scalars['String']['output']>;
  version: Scalars['String']['output'];
  weight: Scalars['Float']['output'];
};

export type QuestionAnswerInput = {
  /** Binary answer */
  answer: Scalars['Boolean']['input'];
  /** Detailed explanation of the answer */
  feedback?: InputMaybe<Scalars['String']['input']>;
  /** Question being answered */
  questionId: Scalars['String']['input'];
};

export type QuestionSet = {
  __typename?: 'QuestionSet';
  goldenSetId: Scalars['Int']['output'];
  id: Scalars['String']['output'];
  questions: Array<Question>;
  userInputId: Scalars['Int']['output'];
};

export type ResultFilters = {
  copilotOutputId?: InputMaybe<Scalars['Int']['input']>;
  evaluatorId?: InputMaybe<Scalars['String']['input']>;
  questionSetId?: InputMaybe<Scalars['String']['input']>;
};

export type SessionFilters = {
  copilotOutputId?: InputMaybe<Scalars['Int']['input']>;
  evaluatorId?: InputMaybe<Scalars['String']['input']>;
  evaluatorType?: InputMaybe<EvaluatorType>;
  questionSetId?: InputMaybe<Scalars['String']['input']>;
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
  createdAt?: Maybe<Scalars['String']['output']>;
  /** Account ID of creator */
  createdBy?: Maybe<Scalars['String']['output']>;
  /** Optional description of what this input tests */
  description?: Maybe<Scalars['String']['output']>;
  /** Unique identifier */
  id: Scalars['Int']['output'];
};
