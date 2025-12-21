export const typeDefs = `#graphql
  # Scalar types
  scalar DateTime
  scalar JSON

  # Types
  type GoldenSet {
    id: ID!
    projectExId: String!
    schemaExId: String!
    nextGoldenSetId: Int
    copilotType: CopilotType!
    description: String
    query: String!
    createdAt: DateTime!
    createdBy: String
    isActive: Boolean!
    
    # Relations
    nextGoldenSet: NextGoldenSet
  }
  
  type NextGoldenSet {
    id: ID!
    description: String
    query: String!
    createdAt: DateTime!
    createdBy: String
    isActive: Boolean!
  }

  enum CopilotType {
    DATA_MODEL_BUILDER
    UI_BUILDER
    ACTIONFLOW_BUILDER
    LOG_ANALYZER
    AGENT_BUILDER
  }

  type EvaluationSession {
    id: ID!
    projectExId: String!
    schemaExId: String!
    copilotType: CopilotType!
    modelName: String!
    sessionIdRef: Int
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

    # Relations
    rubric: AdaptiveRubric
    result: EvaluationResult
  }

  enum SessionStatus {
    PENDING
    RUNNING
    COMPLETED
    FAILED
  }

  enum ExpectedAnswer {
    YES
    NO
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

  type AdaptiveRubric {
    id: ID!
    projectExId: String!
    schemaExId: String!
    sessionId: Int!
    
    # Structured Rubric (matching LangGraph Rubric interface)
    rubricId: String!
    version: String!
    criteria: [RubricCriterion!]!
    totalWeight: Float!
    
    copilotInput: String
    copilotOutput: String
    modelProvider: String
    modelName: String
    reviewStatus: RubricReviewStatus!
    isActive: Boolean!
    
    # Timestamps (matching LangGraph Rubric interface)
    createdAt: DateTime!
    updatedAt: DateTime!
    reviewedAt: DateTime
    reviewedBy: String

    # Relations
    judgeRecords: [JudgeRecord!]!
  }
  
  type RubricCriterion {
    id: String!
    name: String!
    description: String!
    weight: Float!
    scoringScale: ScoringScale!
    isHardConstraint: Boolean!
  }
  
  type ScoringScale {
    min: Int!
    max: Int!
    labels: JSON
  }

  type JudgeRecord {
    id: ID!
    adaptiveRubricId: Int!
    evaluatorType: String!
    accountId: String
    
    # Structured Evaluation (matching LangGraph Evaluation interface)
    scores: [EvaluationScore!]!
    overallScore: Float!
    summary: String!
    timestamp: DateTime!
  }
  
  type EvaluationScore {
    criterionId: String!
    score: Float!
    reasoning: String!
    evidence: [String!]
  }

  type EvaluationResult {
    id: ID!
    sessionId: Int!
    schemaExId: String!
    copilotType: CopilotType!
    modelName: String!
    evaluationStatus: EvaluationStatus!
    
    # FinalReport fields (matching LangGraph FinalReport interface)
    verdict: String!
    overallScore: Float!
    summary: String!
    detailedAnalysis: String!
    discrepancies: [String!]!
    auditTrace: [String!]!
    generatedAt: DateTime!
    
    createdAt: DateTime!
  }

  # Queries
  type Query {
    # Golden Set
    getGoldenSetSchemas(copilotType: CopilotType): [String!]!
    getGoldenSets(projectExId: String, copilotType: CopilotType): [GoldenSet!]!
    getNextGoldenSet(id: ID!): NextGoldenSet

    # Evaluation Sessions
    getSession(id: ID!): EvaluationSession
    getSessions(
      schemaExId: String
      copilotType: CopilotType
      modelName: String
    ): [EvaluationSession!]!
    
    # HITL Session State
    getGraphSessionState(sessionId: Int!): SessionStateResult!

    # Adaptive Rubrics
    getAdaptiveRubricsBySchemaExId(schemaExId: String!): [AdaptiveRubric!]!
    getAdaptiveRubricsBySession(sessionId: Int!): [AdaptiveRubric!]!
    getRubricsForReview(
      sessionId: Int,
      projectExId: String,
      schemaExId: String,
      reviewStatus: RubricReviewStatus
    ): [AdaptiveRubric!]!

    # Results & Analytics
    getEvaluationResult(sessionId: Int!): EvaluationResult
    compareModels(schemaExId: String!, modelNames: [String!]!): ModelComparison!

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
    updateGoldenSetProject(
      projectExId: String!
      schemaExId: String!
      copilotType: CopilotType!
      description: String
      query: String!
    ): GoldenSet!

    # Execution (Legacy - uses JobRunners)
    execAiCopilotByTypeAndModel(
      projectExId: String!
      schemaExId: String!
      copilotType: CopilotType!
      modelName: String!
      skipHumanReview: Boolean
      skipHumanEvaluation: Boolean
    ): Boolean!

    execAiCopilot(
      skipHumanReview: Boolean
      skipHumanEvaluation: Boolean
    ): Boolean!
    
    # HITL Graph Execution - Start Session
    startGraphSession(
      projectExId: String!
      schemaExId: String!
      copilotType: CopilotType!
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
      reviewerAccountId: String!
    ): RubricReviewResult!
    
    # HITL Graph Execution - Submit Human Evaluation (resumes graph to completion)
    submitHumanEvaluation(
      sessionId: Int!
      threadId: String!
      scores: [EvaluationScoreInput!]!
      overallAssessment: String!
      evaluatorAccountId: String!
    ): HumanEvaluationResult!
    
    # Run fully automated evaluation (no HITL)
    runAutomatedEvaluation(
      projectExId: String!
      schemaExId: String!
      copilotType: CopilotType!
      modelName: String!
    ): HumanEvaluationResult!

    # Rubric Review (Legacy)
    reviewAdaptiveRubric(
      rubricId: Int!
      reviewStatus: RubricReviewStatus!
      reviewerAccountId: String!
      modifiedRubricContent: JSON!
    ): AdaptiveRubric!

    # Judge - submit evaluation matching LangGraph Evaluation interface
    judge(
      adaptiveRubricId: Int!
      evaluatorType: String!
      accountId: String
      scores: [EvaluationScoreInput!]!
      overallScore: Float!
      summary: String!
    ): JudgeResult!
  }
  
  # Input type for EvaluationScore
  input EvaluationScoreInput {
    criterionId: String!
    score: Float!
    reasoning: String!
    evidence: [String!]
  }
  
  # Input type for RubricCriterion (for modifying rubrics)
  input RubricCriterionInput {
    id: String!
    name: String!
    description: String!
    weight: Float!
    scoringScale: ScoringScaleInput!
    isHardConstraint: Boolean!
  }
  
  input ScoringScaleInput {
    min: Int!
    max: Int!
    labels: JSON
  }
  
  # Input type for modified rubric
  input RubricInput {
    id: String!
    version: String!
    criteria: [RubricCriterionInput!]!
    totalWeight: Float!
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
    criteria: [RubricCriterion!]!
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
    scores: [EvaluationScore!]!
    overallScore: Float!
    summary: String!
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
    schemaExId: String!
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
