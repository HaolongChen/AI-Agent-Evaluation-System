export const typeDefs = `#graphql
  # Scalar types
  scalar DateTime
  scalar JSON

  # =============================================================================
  # ENUMS
  # =============================================================================

  """
  Type of AI Copilot being evaluated.
  """
  enum CopilotType {
    "Data model builder for database schema generation"
    DATA_MODEL_BUILDER
    "UI component builder for frontend development"
    UI_BUILDER
    "Workflow builder for action flows"
    ACTIONFLOW_BUILDER
    "Log analysis assistant"
    LOG_ANALYZER
    "General agent builder"
    AGENT_BUILDER
  }

  """
  Overall status of an evaluation session.
  """
  enum SessionStatus {
    "Session initialized but not yet started"
    PENDING
    "Session currently running"
    RUNNING
    "Session completed successfully"
    COMPLETED
    "Session failed with errors"
    FAILED
    "Awaiting human review of generated rubric (HITL checkpoint)"
    AWAITING_RUBRIC_REVIEW
    "Awaiting human evaluation scoring (HITL checkpoint)"
    AWAITING_HUMAN_EVALUATION
  }

  """
  Review status for rubric criteria after human review.
  """
  enum RubricReviewStatus {
    "Pending review"
    PENDING
    "Approved without modifications"
    APPROVED
    "Rejected, needs regeneration"
    REJECTED
    "Approved with modifications"
    MODIFIED
  }

  """
  Status of the evaluation scoring process.
  """
  enum EvaluationStatus {
    "Evaluation not yet started"
    PENDING
    "Evaluation in progress"
    IN_PROGRESS
    "Evaluation completed"
    COMPLETED
    "Evaluation failed"
    FAILED
  }

  # =============================================================================
  # CORE TYPES - Golden Set Management
  # =============================================================================

  """
  A golden set represents a collection of test cases (user inputs) 
  and expected copilot outputs for evaluating agent performance.
  Identified uniquely by (projectExId, copilotType).
  """
  type GoldenSet {
    "Unique database identifier"
    id: Int!
    "External project identifier from Functorz"
    projectExId: String!
    "Type of copilot being evaluated"
    copilotType: CopilotType!
    "Timestamp when golden set was created"
    createdAt: DateTime!
    "Account ID of creator"
    createdBy: String
    "Whether this golden set is currently active (only one active per triplet)"
    isActive: Boolean!
    
    "Collection of user input test cases"
    userInputs: [UserInput!]!
    "Collection of expected copilot outputs"
    copilotOutputs: [CopilotOutput!]!
    "Evaluation sessions run against this golden set"
    evaluationSessions: [EvaluationSession!]!
  }
  
  """
  A user input represents a test case prompt or query that will be sent 
  to the copilot being evaluated.
  """
  type UserInput {
    "Unique identifier"
    id: Int!
    "Parent golden set ID"
    goldenSetId: Int!
    "Optional description of what this input tests"
    description: String
    "The actual prompt or query content"
    content: String!
    "Timestamp when input was added"
    createdAt: DateTime!
    "Account ID of creator"
    createdBy: String
  }
  
  """
  A copilot output represents the expected or actual response from the copilot,
  including performance metrics (latency, tokens, context usage).
  """
  type CopilotOutput {
    "Unique identifier"
    id: Int!
    "Parent golden set ID"
    goldenSetId: Int!
    "The copilot's generated output content"
    content: String!
    "Timestamp when output was captured"
    createdAt: DateTime!
    
    "Total end-to-end latency in milliseconds"
    totalLatencyMs: Int
    "Number of request/response roundtrips"
    roundtripCount: Int
    "Number of input tokens consumed"
    inputTokens: Int
    "Number of output tokens generated"
    outputTokens: Int
    "Total tokens used (input + output)"
    totalTokens: Int
    "Percentage of context window utilized"
    contextPercentage: Float
  }

  # =============================================================================
  # EVALUATION SESSION TYPES
  # =============================================================================

  """
  An evaluation session represents a single run of the evaluation workflow
  against a golden set, producing rubric criteria and scored results.
  """
  type EvaluationSession {
    "Unique session identifier"
    id: Int!
    "Golden set being evaluated"
    goldenSetId: Int!
    "LLM model used for agent evaluation (e.g., 'gpt-4o', 'gemini-pro')"
    modelName: String!
    "Timestamp when session started"
    startedAt: DateTime!
    "Timestamp when session completed (null if still running)"
    completedAt: DateTime
    "Current session status (includes HITL checkpoints)"
    status: SessionStatus!

    "Generated or reviewed rubric criteria for this session"
    rubrics: [RubricCriterion!]!
    "Final evaluation result (null if session incomplete)"
    result: EvaluationResult
  }

  # =============================================================================
  # RUBRIC & EVALUATION TYPES
  # =============================================================================

  """
  A rubric criterion represents a single evaluation question/dimension
  used to assess copilot output quality.
  In the database, this is stored as 'adaptiveRubric'.
  """
  type RubricCriterion {
    "Unique criterion identifier"
    id: Int!
    "Parent evaluation session ID"
    sessionId: Int!
    
    "Rubric version identifier (e.g., 'v1', 'v2' after modification)"
    version: String!
    "Short title of the criterion (e.g., 'Correctness', 'Code Quality')"
    title: String!
    "Detailed description of what this criterion evaluates"
    content: String!
    "Expected correct answer (true/false for binary evaluation)"
    expectedAnswer: Boolean!
    "Weight of this criterion in overall score calculation (0 - 100)"
    weight: Float!
    
    "Review status after human review checkpoint"
    reviewStatus: RubricReviewStatus!
    "Whether this criterion is currently active"
    isActive: Boolean!
    
    "Timestamp when criterion was created"
    createdAt: DateTime!
    "Timestamp when criterion was last updated"
    updatedAt: DateTime!
    "Timestamp when criterion was reviewed (null if not reviewed)"
    reviewedAt: DateTime
    "Account ID of reviewer"
    reviewedBy: String

    "Evaluation scoring for this criterion (null if not evaluated yet)"
    evaluation: JudgeRecord
  }

  """
  A judge record captures the agent or human evaluator's assessment
  of a single rubric criterion.
  """
  type JudgeRecord {
    "Unique judge record identifier"
    id: Int!
    "Parent rubric criterion session ID"
    sessionId: Int!
    "Account ID if human evaluator"
    accountId: String
    "Binary answer to the criterion question"
    answer: Boolean!
    "Optional explanation or reasoning for the answer"
    comment: String
    "Timestamp of evaluation"
    timestamp: DateTime!
  }

  """
  Final evaluation result aggregating all rubric criterion scores
  and generating a comprehensive report.
  """
  type EvaluationResult {
    "Unique result identifier"
    id: Int!
    "Parent evaluation session ID"
    sessionId: Int!
    "Type of copilot evaluated"
    copilotType: CopilotType!
    "Model name used for evaluation"
    modelName: String!
    "Status of evaluation process"
    evaluationStatus: EvaluationStatus!
    
    "Aggregated score across all weighted criteria (0 - 100)"
    overallScore: Float!
    "Executive summary of evaluation"
    summary: String!
    "Detailed analysis with per-criterion breakdown"
    detailedAnalysis: String!
    "Audit trail of workflow steps and decisions"
    auditTrace: [String!]!
    "Timestamp when report was generated"
    generatedAt: DateTime!
    
    "Timestamp when result was persisted"
    createdAt: DateTime!
  }

  # =============================================================================
  # HITL WORKFLOW TYPES (LangGraph State)
  # =============================================================================
  
  """
  Represents a single evaluation question in the LangGraph workflow state.
  This is the in-memory representation used during HITL; persisted as RubricCriterion.
  """
  type EvaluationQuestion {
    "Question identifier"
    id: Int!
    "Question title"
    title: String!
    "Question description"
    content: String!
    "Expected binary answer"
    expectedAnswer: Boolean!
    "Weight in overall score (0 - 100)"
    weight: Float!
  }
  
  """
  A versioned collection of evaluation questions.
  """
  type QuestionSet {
    "Version identifier (e.g., 'v1', 'v2')"
    version: String!
    "List of questions in this set"
    questions: [EvaluationQuestion!]!
    "Sum of all question weights (should equal 100)"
    totalWeight: Float!
    "ISO timestamp when set was created"
    createdAt: String!
    "ISO timestamp when set was last updated"
    updatedAt: String!
  }
  
  """
  An answer to a single evaluation question.
  """
  type QuestionAnswer {
    "Question being answered"
    questionId: Int!
    "Binary answer"
    answer: Boolean!
    "Detailed explanation of the answer"
    explanation: String!
    "Supporting evidence from copilot output (optional)"
    evidence: [String!]
  }
  
  """
  Complete evaluation by agent or human, with answers to all questions.
  """
  type QuestionEvaluation {
    "Answers to all questions"
    answers: [QuestionAnswer!]!
    "Calculated overall score based on weights"
    overallScore: Float!
    "Summary of evaluation findings"
    summary: String!
    "ISO timestamp of evaluation"
    timestamp: String!
  }

  """
  Final evaluation report combining agent and human assessments.
  """
  type FinalReportOutput {
    "Aggregated score (0 - 100)"
    overallScore: Float!
    "Executive summary"
    summary: String!
    "Detailed analysis with discrepancy breakdown"
    detailedAnalysis: String!
    evaluation: QuestionEvaluation
    "Audit trail of all workflow steps"
    auditTrace: [String!]!
    "ISO timestamp when report was generated"
    generatedAt: String!
  }

  # =============================================================================
  # HITL SESSION STATE & RESULTS
  # =============================================================================

  """
  Current state of a HITL evaluation session.
  """
  type SessionStateResult {
    "Session identifier"
    sessionId: Int!
    "Current workflow status"
    status: SessionStatus!
    "LangGraph thread ID for resuming workflow"
    threadId: String
    "Draft question set (before review)"
    questionSetDraft: QuestionSet
    "Final question set (after review)"
    questionSetFinal: QuestionSet
    evaluation: QuestionEvaluation
    "Final combined report"
    finalReport: FinalReportOutput
  }

  """
  Result returned after submitting rubric review.
  """
  type RubricReviewResult {
    "Session identifier"
    sessionId: Int!
    "Thread ID for workflow continuation"
    threadId: String!
    "Updated workflow status"
    status: SessionStatus!
    "Finalized question set after review"
    questionSetFinal: QuestionSet
    "Status message"
    message: String!
  }

  """
  Result returned after submitting human evaluation.
  """
  type HumanEvaluationResult {
    "Session identifier"
    sessionId: Int!
    "Thread ID for workflow continuation"
    threadId: String!
    "Updated workflow status (should be COMPLETED)"
    status: SessionStatus!
    "Final report with all evaluations merged"
    finalReport: FinalReportOutput
    "Status message"
    message: String!
  }

  """
  Result returned when starting a new evaluation session.
  """
  type StartSessionResult {
    "New session identifier"
    sessionId: Int!
    "LangGraph thread ID"
    threadId: String!
    "Initial status (AWAITING_RUBRIC_REVIEW or RUNNING)"
    status: SessionStatus!
    "Draft question set for review"
    questionSetDraft: QuestionSet
    "Status message"
    message: String!
  }



  # =============================================================================
  # INPUT TYPES
  # =============================================================================
  
  """
  Input for a single evaluation question (used in full replacement mode).
  """
  input EvaluationQuestionInput {
    "Question identifier"
    id: Int!
    "Question title"
    title: String!
    "Question description"
    content: String!
    "Expected answer"
    expectedAnswer: Boolean!
    "Weight (0 - 100)"
    weight: Float!
  }
  
  """
  Input for a complete question set (used in full replacement mode).
  """
  input QuestionSetInput {
    "Version identifier"
    version: String!
    "List of questions"
    questions: [EvaluationQuestionInput!]!
    "Total weight (should equal 100)"
    totalWeight: Float!
  }
  
  """
  Partial update for a single question (HITL review - RECOMMENDED).
  Only provide fields you want to change.
  Example: { questionId: 123, weight: 60, title: "Correctness - Enhanced" }
  """
  input QuestionPatchInput {
    "Question ID to update (required)"
    questionId: Int!
    "New title (optional)"
    title: String
    "New content (optional)"
    content: String
    "New expected answer (optional)"
    expectedAnswer: Boolean
    "New weight (optional)"
    weight: Float
  }
  
  """
  Input for a single question answer (used in full replacement mode).
  """
  input QuestionAnswerInput {
    "Question being answered"
    id: Int!
    "Binary answer"
    answer: Boolean!
    "Explanation"
    explanation: String!
    "Supporting evidence (optional)"
    evidence: [String!]
  }
  
  """
  Filters for querying golden sets.
  """
  input GoldenSetFilters {
    "Filter by project external ID"
    projectExId: String
    "Filter by copilot type"
    copilotType: CopilotType
    "Filter by active status"
    isActive: Boolean
  }

  """
  Filters for querying evaluation sessions.
  """
  input SessionFilters {
    "Filter by golden set ID"
    goldenSetId: Int
    "Filter by copilot type"
    copilotType: CopilotType
    "Filter by model name"
    modelName: String
    "Filter by session status"
    status: SessionStatus
  }

  # =============================================================================
  # QUERIES
  # =============================================================================

  type Query {
    # -------------------------------------------------------------------------
    # Golden Set Queries
    # -------------------------------------------------------------------------
    
    """
    Retrieve a single golden set by ID.
    """
    getGoldenSet(id: Int!): GoldenSet
    
    """
    List golden sets with optional filtering.
    """
    getGoldenSets(filters: GoldenSetFilters): [GoldenSet!]!

    # -------------------------------------------------------------------------
    # Evaluation Session Queries
    # -------------------------------------------------------------------------
    
    """
    Retrieve a single evaluation session by ID.
    """
    getSession(id: Int!): EvaluationSession
    
    """
    List evaluation sessions with optional filtering.
    """
    getSessions(filters: SessionFilters): [EvaluationSession!]!
    
    """
    Get current HITL workflow state for a session.
    Use this to check if human review or evaluation is needed.
    """
    getGraphSessionState(sessionId: Int!): SessionStateResult!

    # -------------------------------------------------------------------------
    # Rubric Queries
    # -------------------------------------------------------------------------
    
    """
    Get all rubric criteria for a specific session.
    """
    getRubricsBySessionId(sessionId: Int!): [RubricCriterion!]!
    
    """
    Get rubric criteria filtered by review status.
    Useful for finding criteria pending human review.
    """
    getRubricsForReview(
      sessionId: Int
      reviewStatus: RubricReviewStatus
    ): [RubricCriterion!]!

    # -------------------------------------------------------------------------
    # Results & Analytics
    # -------------------------------------------------------------------------
    
    """
    Get final evaluation result for a completed session.
    """
    getEvaluationResult(sessionId: Int!): EvaluationResult
  }

  # =============================================================================
  # MUTATIONS
  # =============================================================================

  type Mutation {
    # -------------------------------------------------------------------------
    # Golden Set Management
    # -------------------------------------------------------------------------

    """
    Upsert golden set with a new user input (atomic operation).
    Creates golden set if it doesn't exist, or adds input to existing one.
    RECOMMENDED for adding test cases.
    """
    updateGoldenSetInput(
      projectExId: String
      copilotType: CopilotType!
      description: String
      query: String!
    ): GoldenSet!

    # -------------------------------------------------------------------------
    # Evaluation Execution
    # -------------------------------------------------------------------------

    """
    Run complete evaluation workflow (background execution).
    Returns session IDs.
    
    RECOMMENDED for batch evaluations or fully automated workflows.
    """
    runEvaluation(
      goldenSetId: Int!
      skipHumanReview: Boolean
      skipHumanEvaluation: Boolean
    ): [Int!]!
    
    # -------------------------------------------------------------------------
    # HITL Workflow - Human Review & Evaluation
    # -------------------------------------------------------------------------
    
    """
    Submit human review of generated rubric criteria.
    
    Use questionPatches (RECOMMENDED) to modify only specific fields:
      questionPatches: [
        { questionId: 123, weight: 0.6, title: "Enhanced title" },
        { questionId: 124, expectedAnswer: false }
      ]
    
    Or use modifiedQuestionSet (DEPRECATED) to replace the entire rubric:
      modifiedQuestionSet: { version: "v2", questions: [...], totalWeight: 1.0 }
    
    Set approved: true to accept the rubric as-is.
    """
    submitRubricReview(
      sessionId: Int!
      threadId: String!
      approved: Boolean!
      modifiedQuestionSet: QuestionSetInput
      questionPatches: [QuestionPatchInput!]
      feedback: String
      reviewerAccountId: String!
    ): RubricReviewResult!
    
    """
    Submit human evaluation scores for rubric criteria.
    
    Use answers (RECOMMENDED) to provide only specific answers (patches):
      answers: [
        { id: 123, answer: true, explanation: "Nearly perfect" },
        { id: 125, answer: false, explanation: "Needs improvement" }
      ]
    
    Omit answers to accept agent evaluation as-is.
    
    System merges provided answers with agent evaluation and recalculates scores.
    """
    submitHumanEvaluation(
      sessionId: Int!
      threadId: String!
      answers: [QuestionAnswerInput!]
      overallAssessment: String!
      evaluatorAccountId: String!
    ): HumanEvaluationResult!
  }
`;
