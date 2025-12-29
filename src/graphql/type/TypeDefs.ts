export const typeDefs = `#graphql
  # Scalar types
  scalar DateTime
  scalar JSON

  # Types
  type GoldenSet {
    id: ID!
    projectExId: String!
    schemaExId: String!
    copilotType: CopilotType!
    createdAt: DateTime!
    createdBy: String
    isActive: Boolean!
    
    # Relations
    userInput: [UserInput!]!
    copilotOutput: [CopilotOutput!]!
    evaluationSessions: [CopilotSimulation!]!
  }
  
  type UserInput {
    id: ID!
    description: String
    content: String!
    createdAt: DateTime!
    createdBy: String
  }
  
  type CopilotOutput {
    id: ID!
    description: String
    content: String!
    createdAt: DateTime!
    createdBy: String
  }

  enum CopilotType {
    DATA_MODEL_BUILDER
    UI_BUILDER
    ACTIONFLOW_BUILDER
    LOG_ANALYZER
    AGENT_BUILDER
  }

  type CopilotSimulation {
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

    # Relations
    rubric: [AdaptiveRubric!]!
    result: EvaluationResult
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

  type AdaptiveRubric {
    id: ID!
    simulationId: Int!
    
    # Structured Rubric (matching LangGraph Rubric interface)
    version: String!
    title: String!
    content: String!
    expectedAnswers: Boolean!
    weights: Float!
    totalWeight: Float!
    
    modelProvider: String
    reviewStatus: RubricReviewStatus!
    isActive: Boolean!
    
    # Timestamps (matching LangGraph Rubric interface)
    createdAt: DateTime!
    updatedAt: DateTime!
    reviewedAt: DateTime
    reviewedBy: String

    # Relations
    judgeRecord: JudgeRecord
  }
  
  # ============================================================================
  # NEW TYPES - Question-based evaluation (matches new Prisma schema)
  # ============================================================================
  
  type EvaluationQuestion {
    id: String!
    title: String!
    content: String!
    expectedAnswer: Boolean!
    weight: Float!
  }
  
  type QuestionSet {
    id: String!
    version: String!
    questions: [EvaluationQuestion!]!
    totalWeight: Float!
    createdAt: String!
    updatedAt: String!
  }
  
  type QuestionAnswer {
    questionId: String!
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
  
  # ============================================================================
  # LEGACY TYPES - Kept for backward compatibility during migration
  # ============================================================================
  
  type RubricCriterion @deprecated(reason: "Use EvaluationQuestion instead") {
    id: String!
    name: String!
    description: String!
    weight: Float!
    scoringScale: ScoringScale!
    isHardConstraint: Boolean!
  }
  
  type ScoringScale @deprecated(reason: "No longer used with question-based evaluation") {
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
    answer: String!
    comment: String
    overallScore: Float!
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
    simulationId: Int!
    evaluationStatus: EvaluationStatus!
    
    # FinalReport fields (matching LangGraph FinalReport interface)
    verdict: String!
    overallScore: Float!
    summary: String!
    discrepancies: [String!]!
    generatedAt: DateTime!
    
    createdAt: DateTime!
  }

  # Queries
  type Query {
    # Golden Set
    getGoldenSets(goldenSetId: Int!): GoldenSet

    # Evaluation Sessions
    getSession(id: String!): CopilotSimulation
    getSessions(
      schemaExId: String
      copilotType: CopilotType
      modelName: String
    ): [CopilotSimulation!]!
    
    # HITL Session State
    getGraphSessionState(sessionId: Int!): SessionStateResult!

    # Adaptive Rubrics
    getAdaptiveRubricsBySessionId(sessionId: String!): [AdaptiveRubric!]!
    getAdaptiveRubricsBySession(sessionId: String!): [AdaptiveRubric!]!
    getRubricsForReview(
      sessionId: Int,
      projectExId: String,
      schemaExId: String,
      reviewStatus: RubricReviewStatus
    ): [AdaptiveRubric!]!

    # Results & Analytics
    getEvaluationResult(sessionId: String!): EvaluationResult
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
    updateGoldenSetInput(
      projectExId: String!
      schemaExId: String!
      copilotType: CopilotType!
      description: String
      query: String!
    ): GoldenSet!

    # Execution (Legacy - uses JobRunners)
    execAiCopilot(
      goldenSetId: Int!
      skipHumanReview: Boolean
      skipHumanEvaluation: Boolean
    ): Boolean!
    
    # HITL Graph Execution - Submit Question Set Review (resumes graph)
    submitRubricReview(
      sessionId: Int!
      threadId: String!
      approved: Boolean!
      modifiedQuestionSet: QuestionSetInput
      questionPatches: [QuestionPatchInput!]
      feedback: String
      reviewerAccountId: String!
    ): RubricReviewResult!
    
    # HITL Graph Execution - Submit Human Evaluation (resumes graph to completion)
    submitHumanEvaluation(
      sessionId: Int!
      threadId: String!
      answers: [QuestionAnswerInput!]
      answerPatches: [QuestionAnswerPatchInput!]
      overallAssessment: String!
      evaluatorAccountId: String!
    ): HumanEvaluationResult!
  }
  
  # ============================================================================
  # NEW INPUT TYPES - Question-based evaluation
  # ============================================================================
  
  input EvaluationQuestionInput {
    id: String!
    title: String!
    content: String!
    expectedAnswer: Boolean!
    weight: Float!
  }
  
  input QuestionSetInput {
    id: String!
    version: String!
    questions: [EvaluationQuestionInput!]!
    totalWeight: Float!
  }
  
  input QuestionPatchInput {
    questionId: String!
    title: String
    content: String
    expectedAnswer: Boolean
    weight: Float
  }
  
  input QuestionAnswerInput {
    questionId: String!
    answer: Boolean!
    explanation: String!
    evidence: [String!]
  }
  
  input QuestionAnswerPatchInput {
    questionId: String!
    answer: Boolean
    explanation: String
    evidence: [String!]
  }
  
  # ============================================================================
  # LEGACY INPUT TYPES - Kept for backward compatibility
  # ============================================================================
  
  input EvaluationScoreInput @deprecated(reason: "Use QuestionAnswerInput instead") {
    criterionId: String!
    score: Float!
    reasoning: String!
    evidence: [String!]
  }
  
  input RubricCriterionInput @deprecated(reason: "Use EvaluationQuestionInput instead") {
    id: String!
    name: String!
    description: String!
    weight: Float!
    scoringScale: ScoringScaleInput!
    isHardConstraint: Boolean!
  }
  
  input ScoringScaleInput @deprecated(reason: "No longer used with question-based evaluation") {
    min: Int!
    max: Int!
    labels: JSON
  }
  
  input RubricInput @deprecated(reason: "Use QuestionSetInput instead") {
    id: String!
    version: String!
    criteria: [RubricCriterionInput!]!
    totalWeight: Float!
  }
  
  input RubricCriterionPatchInput @deprecated(reason: "Use QuestionPatchInput instead") {
    criterionId: String!
    name: String
    description: String
    weight: Float
    scoringScale: ScoringScaleInput
    isHardConstraint: Boolean
  }
  
  input EvaluationScorePatchInput @deprecated(reason: "Use QuestionAnswerPatchInput instead") {
    criterionId: String!
    score: Float
    reasoning: String
    evidence: [String!]
  }

  # HITL Session Types
  enum GraphSessionStatus {
    PENDING
    AWAITING_RUBRIC_REVIEW
    AWAITING_HUMAN_EVALUATION
    COMPLETED
    FAILED
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
  
  # ============================================================================
  # NEW OUTPUT TYPES - Question-based evaluation
  # ============================================================================
  
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
  
  # ============================================================================
  # LEGACY OUTPUT TYPES - Kept for backward compatibility
  # ============================================================================
  
  type RubricOutput @deprecated(reason: "Use QuestionSet instead") {
    id: String!
    version: String!
    criteria: [RubricCriterion!]!
    totalWeight: Float!
    createdAt: String!
    updatedAt: String!
  }
  
  type EvaluationOutput @deprecated(reason: "Use QuestionEvaluation instead") {
    evaluatorType: String!
    scores: [EvaluationScore!]!
    overallScore: Float!
    summary: String!
    timestamp: String!
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
