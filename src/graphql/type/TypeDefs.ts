export const typeDefs = `#graphql
  # Scalar types
  scalar DateTime
  scalar JSON
  scalar Decimal

  # Types
  type GoldenSet {
    id: ID!
    projectExId: String!
    schemaExId: String!
    copilotType: CopilotType!
    createdAt: DateTime!
    createdBy: String
    isActive: [Boolean!]!
    
    # Relations
    userInput: [UserInput!]!
    copilotOutput: [CopilotOutput!]!
  }

  type UserInput {
    id: ID!
    description: String
    content: JSON!
    createdAt: DateTime!
    createdBy: String
  }

  type CopilotOutput {
    id: ID!
    description: String
    content: JSON!
    createdAt: DateTime!
    createdBy: String
  }

  enum CopilotType {
    dataModel
    uiBuilder
    actionflow
    logAnalyzer
    agentBuilder
  }

  type EvaluationSession {
    id: ID!
    goldenSetId: Int!
    modelName: String!
    startedAt: DateTime!
    completedAt: DateTime
    status: SessionStatus!

    # Performance metrics
    totalLatencyMs: Int
    roundtripCount: Int
    inputTokens: Int
    outputTokens: Int
    totalTokens: Int
    contextPercentage: Float
    metadata: JSON

    # Relations
    rubric: [AdaptiveRubric!]!
    result: EvaluationResult
  }

  enum SessionStatus {
    running
    completed
    failed
    pending
  }

  enum RubricReviewStatus {
    pending
    approved
    rejected
    modified
  }

  enum EvaluationStatus {
    pending
    in_progress
    completed
    failed
  }

  type AdaptiveRubric {
    id: ID!
    simulationId: Int!
    
    version: String!
    title: String!
    content: String!
    expectedAnswer: Boolean!
    weights: Decimal!
    totalWeight: Decimal!
    modelProvider: String
    
    reviewStatus: RubricReviewStatus!
    isActive: Boolean!
    
    createdAt: DateTime!
    updatedAt: DateTime!
    reviewedAt: DateTime
    reviewedBy: String

    # Relations
    judgeRecord: JudgeRecord
  }
  
  type JudgeRecord {
    id: ID!
    adaptiveRubricId: Int!
    evaluatorType: String!
    accountId: String
    
    answer: String!
    comment: String
    overallScore: Decimal!
    timestamp: DateTime!
  }

  type EvaluationResult {
    id: ID!
    simulationId: Int!
    evaluationStatus: EvaluationStatus!
    
    verdict: String!
    overallScore: Decimal!
    summary: String!
    discrepancies: [String!]!
    generatedAt: DateTime!
    createdAt: DateTime!
  }

  # Queries
  type Query {
    # Golden Set
    getGoldenSetSchemas(copilotType: CopilotType): [String!]!
    getGoldenSets(projectExId: String, copilotType: CopilotType): [GoldenSet!]!

    # Evaluation Sessions
    getSession(id: ID!): EvaluationSession
    getSessions(
      goldenSetId: Int
      modelName: String
    ): [EvaluationSession!]!
    
    # HITL Session State
    getGraphSessionState(sessionId: Int!): SessionStateResult!

    # Adaptive Rubrics
    getAdaptiveRubricBySession(sessionId: Int!): [AdaptiveRubric!]!
    getRubricsForReview(
      rubricId: Int,
      reviewStatus: RubricReviewStatus
    ): [AdaptiveRubric!]!

    # Results & Analytics
    getEvaluationResult(goldenSetId: Int!): EvaluationResult[]!
    compareModels(goldenSetId: Int!, modelNames: [String!]!): ModelComparison!

    # Dashboard Metrics
    getDashboardMetrics(
      copilotType: CopilotType
      modelName: String
      startDate: DateTime
      endDate: DateTime
    ): DashboardMetrics!
  }

  # Mutations
  type Mutation {
    # Golden Set Management
    createGoldenSet(
      projectExId: String!
      schemaExId: String!
      copilotType: CopilotType!
      userInput: [UserInputInput!]!
      copilotOutput: [CopilotOutputInput!]!
    ): GoldenSet!

    updateGoldenSet(
      id: ID!
      isActive: [Boolean!]
    ): GoldenSet!

    # Execution
    execAiCopilot(
      goldenSetId: Int
      modelName: String
      skipHumanReview: Boolean
      skipHumanEvaluation: Boolean
    ): Boolean!
    
    # HITL Graph Execution - Start Session
    startGraphSession(
      goldenSetId: Int!
      modelName: String!
      skipHumanReview: Boolean
      skipHumanEvaluation: Boolean
    ): StartSessionResult!
    
    # HITL Graph Execution - Submit Rubric Review (resumes graph)
    submitRubricReview(
      sessionId: Int!
      threadId: String!
      approved: Boolean!
      modifiedRubric: RubricInput
      feedback: String
      accountId: String!
    ): RubricReviewResult!
    
    # HITL Graph Execution - Submit Human Evaluation (resumes graph to completion)
    submitHumanEvaluation(
      sessionId: Int!
      threadId: String!
      scores: [EvaluationScoreInput!]!
      overallAssessment: String!
      accountId: String!
    ): HumanEvaluationResult!
    
    # Judge - submit evaluation matching LangGraph Evaluation interface
    judge(
      adaptiveRubricId: Int!
      evaluatorType: String!
      accountId: String
      answer: String!
      comment: String
      overallScore: Float!
    ): JudgeResult!
  }
  
  input UserInputInput {
    description: String
    content: JSON!
  }

  input CopilotOutputInput {
    description: String
    content: JSON!
  }
  
  # Input type for EvaluationScore
  input EvaluationScoreInput {
    criterionId: String!
    score: Float!
    reasoning: String!
    evidence: [String!]
  }
  
  # Input type for modified rubric
  input RubricInput {
    id: String!
    version: String!
    content: String!
    weights: Float!
  }

  # HITL Session Types
  enum GraphSessionStatus {
    PENDING
    AWAITING_RUBRIC_REVIEW
    AWAITING_HUMAN_EVALUATION
    COMPLETED
    FAILED
  }

  type StartSessionResult {
    sessionId: Int!
    threadId: String!
    status: GraphSessionStatus!
    rubricDraft: RubricOutput
    message: String!
  }
  
  type RubricOutput {
    id: String!
    version: String!
    content: String!
    totalWeight: Float!
    createdAt: String!
    updatedAt: String!
  }

  type RubricReviewResult {
    sessionId: Int!
    threadId: String!
    status: GraphSessionStatus!
    rubricFinal: RubricOutput
    message: String!
  }

  type HumanEvaluationResult {
    sessionId: Int!
    threadId: String!
    status: GraphSessionStatus!
    finalReport: FinalReportOutput
    message: String!
  }
  
  type EvaluationOutput {
    evaluatorType: String!
    answer: String!
    comment: String
    overallScore: Float!
    timestamp: String!
  }
  
  type FinalReportOutput {
    verdict: String!
    overallScore: Float!
    summary: String!
    detailedAnalysis: String!
    agentEvaluation: EvaluationOutput
    humanEvaluation: EvaluationOutput
    discrepancies: [String!]!
    auditTrace: [String!]!
    generatedAt: String!
  }
  
  type SessionStateResult {
    sessionId: Int!
    status: GraphSessionStatus!
    threadId: String
    rubricDraft: RubricOutput
    rubricFinal: RubricOutput
    agentEvaluation: EvaluationOutput
    humanEvaluation: EvaluationOutput
    finalReport: FinalReportOutput
  }

  # Custom Types for Analytics
  type ModelComparison {
    goldenSetId: Int!
    models: [ModelPerformance!]!
  }

  type JudgeResult {
    finalRecord: JudgeRecord!
    finalResult: EvaluationResult!
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
`;
