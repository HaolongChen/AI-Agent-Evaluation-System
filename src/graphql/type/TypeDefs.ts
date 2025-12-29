export const typeDefs = `#graphql
  # Scalar types
  scalar DateTime
  scalar JSON

  # =============================================================================
  # ENUMS - Match Prisma schema exactly
  # =============================================================================

  enum CopilotType {
    DATA_MODEL_BUILDER
    UI_BUILDER
    ACTIONFLOW_BUILDER
    LOG_ANALYZER
    AGENT_BUILDER
  }

  enum SessionStatus {
    PENDING
    RUNNING
    COMPLETED
    FAILED
  }

  enum RubricReviewStatus {
    PENDING
    APPROVED
    REJECTED
    MODIFIED
  }

  enum EvaluationStatus {
    PENDING
    IN_PROGRESS
    COMPLETED
    FAILED
  }

  enum GraphSessionStatus {
    PENDING
    AWAITING_RUBRIC_REVIEW
    AWAITING_HUMAN_EVALUATION
    COMPLETED
    FAILED
  }

  # =============================================================================
  # CORE TYPES - Match Prisma schema
  # =============================================================================

  type GoldenSet {
    id: Int!
    projectExId: String!
    schemaExId: String!
    copilotType: CopilotType!
    createdAt: DateTime!
    createdBy: String
    isActive: Boolean!
    
    # Relations
    userInputs: [UserInput!]!
    copilotOutputs: [CopilotOutput!]!
    evaluationSessions: [EvaluationSession!]!
  }
  
  type UserInput {
    id: Int!
    goldenSetId: Int!
    description: String
    content: String!
    createdAt: DateTime!
    createdBy: String
  }
  
  type CopilotOutput {
    id: Int!
    goldenSetId: Int!
    content: String!
    createdAt: DateTime!
    
    # Performance Metrics
    totalLatencyMs: Int
    roundtripCount: Int
    inputTokens: Int
    outputTokens: Int
    totalTokens: Int
    contextPercentage: Float
  }

  type EvaluationSession {
    id: Int!
    goldenSetId: Int!
    modelName: String!
    sessionIdRef: Int
    startedAt: DateTime!
    completedAt: DateTime
    status: SessionStatus!
    metadata: JSON

    # Relations
    rubrics: [AdaptiveRubric!]!
    result: EvaluationResult
  }

  type AdaptiveRubric {
    id: Int!
    sessionId: Int!
    
    # Question content (one question per row)
    version: String!
    title: String!
    content: String!
    expectedAnswer: Boolean!
    weight: Float!
    
    # Status
    reviewStatus: RubricReviewStatus!
    isActive: Boolean!
    
    # Timestamps
    createdAt: DateTime!
    updatedAt: DateTime!
    reviewedAt: DateTime
    reviewedBy: String

    # Relations
    judgeRecord: JudgeRecord
  }

  type JudgeRecord {
    id: Int!
    adaptiveRubricId: Int!
    evaluatorType: String!
    accountId: String
    answer: Boolean!
    comment: String
    overallScore: Float!
    timestamp: DateTime!
  }

  type EvaluationResult {
    id: Int!
    sessionId: Int!
    copilotType: CopilotType!
    modelName: String!
    evaluationStatus: EvaluationStatus!
    
    # FinalReport fields
    verdict: String!
    overallScore: Float!
    summary: String!
    detailedAnalysis: String!
    discrepancies: [String!]!
    auditTrace: [String!]!
    generatedAt: DateTime!
    
    createdAt: DateTime!
  }

  # =============================================================================
  # QUESTION-BASED EVALUATION TYPES (LangGraph state types)
  # =============================================================================
  
  type EvaluationQuestion {
    id: Int!
    title: String!
    content: String!
    expectedAnswer: Boolean!
    weight: Float!
  }
  
  type QuestionSet {
    version: String!
    questions: [EvaluationQuestion!]!
    totalWeight: Float!
    createdAt: String!
    updatedAt: String!
  }
  
  type QuestionAnswer {
    questionId: Int!
    answer: Boolean!
    explanation: String!
    evidence: [String!]
  }
  
  type QuestionEvaluation {
    evaluatorType: String!
    answers: [QuestionAnswer!]!
    overallScore: Float!
    summary: String!
    timestamp: String!
  }

  type FinalReportOutput {
    verdict: String!
    overallScore: Float!
    summary: String!
    detailedAnalysis: String!
    agentEvaluation: QuestionEvaluation
    humanEvaluation: QuestionEvaluation
    discrepancies: [String!]!
    auditTrace: [String!]!
    generatedAt: String!
  }

  # =============================================================================
  # HITL SESSION TYPES
  # =============================================================================

  type SessionStateResult {
    sessionId: Int!
    status: GraphSessionStatus!
    threadId: String
    questionSetDraft: QuestionSet
    questionSetFinal: QuestionSet
    agentEvaluation: QuestionEvaluation
    humanEvaluation: QuestionEvaluation
    finalReport: FinalReportOutput
  }

  type RubricReviewResult {
    sessionId: Int!
    threadId: String!
    status: GraphSessionStatus!
    questionSetFinal: QuestionSet
    message: String!
  }

  type HumanEvaluationResult {
    sessionId: Int!
    threadId: String!
    status: GraphSessionStatus!
    finalReport: FinalReportOutput
    message: String!
  }

  type StartSessionResult {
    sessionId: Int!
    threadId: String!
    status: GraphSessionStatus!
    questionSetDraft: QuestionSet
    message: String!
  }

  # =============================================================================
  # ANALYTICS TYPES
  # =============================================================================

  type ModelComparison {
    schemaExId: String!
    models: [ModelPerformance!]!
  }

  type ModelPerformance {
    modelName: String!
    metrics: JSON!
    overallScore: Float!
    avgLatencyMs: Int!
    avgTokens: Int!
    passRate: Float!
  }

  type DashboardMetrics {
    totalSessions: Int!
    avgOverallScore: Float!
    avgLatencyMs: Int!
    avgTokenUsage: Int!
    passRateByCategory: [CategoryPassRate!]!
    modelPerformanceTrend: [TrendPoint!]!
  }

  type CategoryPassRate {
    category: String!
    passRate: Float!
    totalRubrics: Int!
  }

  type TrendPoint {
    date: DateTime!
    score: Float!
    sessionCount: Int!
  }

  # =============================================================================
  # INPUT TYPES
  # =============================================================================
  
  input EvaluationQuestionInput {
    id: Int!
    title: String!
    content: String!
    expectedAnswer: Boolean!
    weight: Float!
  }
  
  input QuestionSetInput {
    version: String!
    questions: [EvaluationQuestionInput!]!
    totalWeight: Float!
  }
  
  input QuestionPatchInput {
    questionId: Int!
    title: String
    content: String
    expectedAnswer: Boolean
    weight: Float
  }
  
  input QuestionAnswerInput {
    questionId: Int!
    answer: Boolean!
    explanation: String!
    evidence: [String!]
  }
  
  input QuestionAnswerPatchInput {
    questionId: Int!
    answer: Boolean
    explanation: String
    evidence: [String!]
  }

  input GoldenSetFilters {
    projectExId: String
    schemaExId: String
    copilotType: CopilotType
    isActive: Boolean
  }

  input SessionFilters {
    goldenSetId: Int
    schemaExId: String
    copilotType: CopilotType
    modelName: String
    status: SessionStatus
  }

  # =============================================================================
  # QUERIES
  # =============================================================================

  type Query {
    # Golden Set Queries
    getGoldenSet(id: Int!): GoldenSet
    getGoldenSets(filters: GoldenSetFilters): [GoldenSet!]!

    # Evaluation Session Queries
    getSession(id: Int!): EvaluationSession
    getSessions(filters: SessionFilters): [EvaluationSession!]!
    
    # HITL Session State
    getGraphSessionState(sessionId: Int!): SessionStateResult!

    # Rubric/Question Queries
    getRubricsBySessionId(sessionId: Int!): [AdaptiveRubric!]!
    getRubricsForReview(
      sessionId: Int
      reviewStatus: RubricReviewStatus
    ): [AdaptiveRubric!]!

    # Results & Analytics
    getEvaluationResult(sessionId: Int!): EvaluationResult
    compareModels(schemaExId: String!, modelNames: [String!]!): ModelComparison!
    getDashboardMetrics(
      copilotType: CopilotType
      modelName: String
      startDate: DateTime
      endDate: DateTime
    ): DashboardMetrics!
  }

  # =============================================================================
  # MUTATIONS
  # =============================================================================

  type Mutation {
    # Golden Set Management
    createGoldenSet(
      projectExId: String!
      schemaExId: String!
      copilotType: CopilotType!
      createdBy: String
    ): GoldenSet!

    addUserInput(
      goldenSetId: Int!
      content: String!
      description: String
      createdBy: String
    ): UserInput!

    updateGoldenSetInput(
      projectExId: String!
      schemaExId: String!
      copilotType: CopilotType!
      description: String
      query: String!
    ): GoldenSet!

    # Evaluation Execution
    startEvaluationSession(
      goldenSetId: Int!
      modelName: String
      skipHumanReview: Boolean
      skipHumanEvaluation: Boolean
    ): StartSessionResult!

    execAiCopilot(
      goldenSetId: Int!
      skipHumanReview: Boolean
      skipHumanEvaluation: Boolean
    ): Boolean!
    
    # HITL Graph Execution - Submit Question Set Review
    submitRubricReview(
      sessionId: Int!
      threadId: String!
      approved: Boolean!
      modifiedQuestionSet: QuestionSetInput
      questionPatches: [QuestionPatchInput!]
      feedback: String
      reviewerAccountId: String!
    ): RubricReviewResult!
    
    # HITL Graph Execution - Submit Human Evaluation
    submitHumanEvaluation(
      sessionId: Int!
      threadId: String!
      answers: [QuestionAnswerInput!]
      answerPatches: [QuestionAnswerPatchInput!]
      overallAssessment: String!
      evaluatorAccountId: String!
    ): HumanEvaluationResult!
  }
`;
