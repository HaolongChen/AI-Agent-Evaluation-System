import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  # Types
  type GoldenSet {
    id: ID!
    projectExId: String!
    schemaExId: String!
    copilotType: CopilotType!
    description: String
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
    contextPercentage: Float

    # Relations
    rubrics: [AdaptiveRubric!]!
    result: EvaluationResult
  }

  enum SessionStatus {
    RUNNING
    COMPLETED
    FAILED
  }

  type AdaptiveRubric {
    id: ID!
    projectExId: String!
    schemaExId: String!
    sessionId: Int!
    content: String!
    rubricType: String
    category: String
    expectedAnswer: String
    reviewStatus: ReviewStatus!
    isActive: Boolean!
    generatedAt: DateTime!
    reviewedAt: DateTime
    reviewedBy: String

    # Relations
    judgeRecords: [JudgeRecord!]!
  }

  enum ReviewStatus {
    PENDING
    APPROVED
    REJECTED
    MODIFIED
  }

  type JudgeRecord {
    id: ID!
    adaptiveRubricId: Int!
    accountId: String!
    result: Boolean!
    confidenceScore: Int
    notes: String
    judgedAt: DateTime!
  }

  type EvaluationResult {
    id: ID!
    sessionId: Int!
    schemaExId: String!
    metrics: JSON!
    overallScore: Float!
    createdAt: DateTime!
  }

  # Queries
  type Query {
    # Golden Set
    getGoldenSetSchemas(copilotType: CopilotType): [String!]!
    getGoldenSet(projectExId: String, copilotType: CopilotType): [GoldenSet!]!

    # Evaluation Sessions
    getSession(id: ID!): EvaluationSession
    getSessions(
      schemaExId: String
      copilotType: CopilotType
      modelName: String
    ): [EvaluationSession!]!

    # Adaptive Rubrics
    getAdaptiveRubricsBySchemaExId(schemaExId: String!): [AdaptiveRubric!]!
    getAdaptiveRubricsBySession(sessionId: Int!): [AdaptiveRubric!]!
    getRubricsForReview(reviewStatus: ReviewStatus): [AdaptiveRubric!]!

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
    ): GoldenSet!

    # Execution
    execAiCopilotByTypeAndModel(
      schemaExId: String!
      copilotType: CopilotType!
      modelName: String!
    ): EvaluationSession!

    # Rubric Generation
    generateAdaptiveRubricsBySchemaExId(
      schemaExId: String!
      sessionId: Int!
    ): [AdaptiveRubric!]!

    # Rubric Review
    reviewAdaptiveRubric(
      rubricId: Int!
      reviewStatus: ReviewStatus!
      reviewerAccountId: String!
      modifiedContent: String
    ): AdaptiveRubric!

    # Judge
    judge(
      adaptiveRubricId: Int!
      accountId: String!
      result: Boolean!
      confidenceScore: Int
      notes: String
    ): JudgeRecord!
  }

  # Custom Types for Analytics
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
`;
