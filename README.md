# AI-Agent-Evaluation-System

## Project Overview

An evaluation framework for AI Copilot that allows rapid testing and quality assessment when new models are released. The system features a **Human-in-the-Loop (HITL)** workflow powered by LangGraph, enabling interactive evaluation with human review checkpoints. Supports multiple AI Copilot types: Data Model Builder, UI Builder, Actionflow Builder, Log Analyzer, and Agent Builder.

## Key Features

- 🔄 **HITL Workflow**: Interactive evaluation with human review at rubric generation and evaluation stages
- 🤖 **Automated Mode**: Fully automated AI-based evaluation for batch processing
- 📊 **Structured Rubrics**: AI-generated evaluation criteria with customizable weight and scoring scales
- 🔍 **Dual Evaluation**: Compare agent vs human evaluation scores with discrepancy detection
- 📈 **Analytics Dashboard**: Query metrics, compare models, track performance trends
- 🎯 **GraphQL API**: Comprehensive API for all evaluation operations
- 💾 **Persistent State**: LangGraph checkpointing for resumable workflows

## Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL database
- OpenAI or Google Gemini API key
- Functorz Copilot WebSocket access

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd AI-Agent-Evaluation-System

# Install dependencies
pnpm install

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# Initialize database
pnpm db:push
pnpm db:generate

# Start development server
pnpm dev
```

### Running Your First Evaluation

**Option 1: Human-in-the-Loop (Recommended)**

```graphql
# 1. Start a HITL session
mutation {
  startGraphSession(
    projectExId: "your-project"
    schemaExId: "your-schema"
    copilotType: DATA_MODEL_BUILDER
    modelName: "gpt-4"
  ) {
    sessionId
    threadId
    status # Returns AWAITING_RUBRIC_REVIEW
    rubricDraft {
      criteria {
        name
        description
      }
    }
  }
}

# 2. Review and approve the rubric
mutation {
  submitRubricReview(
    sessionId: 123
    threadId: "thread-abc"
    approved: true
    reviewerAccountId: "your-id"
  ) {
    status # Returns AWAITING_HUMAN_EVALUATION
  }
}

# 3. Provide human evaluation
mutation {
  submitHumanEvaluation(
    sessionId: 123
    threadId: "thread-abc"
    scores: [
      { criterionId: "entity-coverage", score: 8.5, reasoning: "Good coverage" }
    ]
    overallAssessment: "Solid data model"
    evaluatorAccountId: "your-id"
  ) {
    status # Returns COMPLETED
    finalReport {
      verdict
      overallScore
    }
  }
}
```

**Option 2: Automated (No Human Input)**

```graphql
mutation {
  runAutomatedEvaluation(
    projectExId: "your-project"
    schemaExId: "your-schema"
    copilotType: DATA_MODEL_BUILDER
    modelName: "gpt-4"
  ) {
    sessionId
    finalReport {
      verdict
      overallScore
      summary
    }
  }
}
```

### GraphQL Playground

Access the interactive GraphQL playground at:

```bash
http://localhost:4000/graphql
```

---

## Goals

- Launch updates quickly when new models come out
- Incorporate user feedback systematically
- Know the boundaries of current copilots and release new features when models are ready

---

## User Stories & Personas

### Primary Users

1. **AI Copilot Development Team**

   - Need to evaluate model performance across different versions
   - Want to quickly identify regressions or improvements
   - Need to make data-driven decisions about model deployments

2. **Quality Assurance Engineers**

   - Review and validate generated adaptive rubrics
   - Judge evaluation results for accuracy
   - Maintain golden set quality standards

3. **Product Managers**
   - Query API for model performance metrics
   - Track quality trends over time
   - Make go/no-go decisions on model releases

### User Stories

#### For Development Team

- As a developer, I want to run AI Copilot with different models on the same schema, so I can compare their performance
- As a developer, I want to automatically generate evaluation questions based on copilot outputs, so I can scale testing
- As a developer, I want to access aggregated metrics via GraphQL API, so I can quickly assess overall model quality

#### For QA Engineers

- As a QA engineer, I want to review AI-generated rubrics before they are used, so I can ensure evaluation quality
- As a QA engineer, I want to manually judge rubric results, so I can provide ground truth for model evaluation
- As a QA engineer, I want to easily add new examples to the golden set, so I can expand test coverage

#### For Product Managers

- As a PM, I want to query LLM quality metrics (EntityCoverage, AttributeCompleteness, etc.) via API, so I can understand model capabilities
- As a PM, I want to track latency, token usage, and iteration counts via API, so I can understand performance and cost
- As a PM, I want to compare different model versions via API queries, so I can make informed release decisions

---

## GraphQL API Reference

The evaluation system exposes a comprehensive GraphQL API for managing evaluations, rubrics, and analytics. The API endpoint is available at:

```bash
http://localhost:4000/graphql
```

### Core Features

1. **Human-in-the-Loop (HITL) Evaluation** - Interactive workflow with human review and evaluation
2. **Automated Evaluation** - Fully automated AI-based evaluation without human intervention
3. **Golden Set Management** - Manage test datasets and schemas
4. **Analytics & Reporting** - Query metrics, compare models, and view dashboard data

### API Categories

- **[Golden Set Management](#golden-set-api)** - Manage test schemas and datasets
- **[HITL Evaluation Flow](#hitl-evaluation-api)** - Human-in-the-loop evaluation workflow
- **[Automated Evaluation](#automated-evaluation-api)** - Fully automated evaluation
- **[Rubric Management](#rubric-management-api)** - Query and review generated rubrics
- **[Results & Analytics](#analytics-api)** - Query evaluation results and metrics

---

## System Architecture

### Technology Stack

**Language**: TypeScript (Node.js)

**Framework**:

- **Express.js** - REST API server
- **Apollo Server** - GraphQL API layer (for flexible querying of evaluation data)
  - Write schema using standard GraphQL SDL (Schema Definition Language)
  - Simple resolvers that call service layer functions
  - No additional abstraction layers needed

**Database**: PostgreSQL (Single Database)

- Manages evaluation framework data
- Stores rubrics, judgments, and evaluation results
- PostgreSQL with Prisma ORM for type-safe database access

**Development Tools**:

- **Prisma** - Modern ORM with excellent TypeScript support
  - Best-in-class type safety and auto-completion
  - Prisma Studio for visual database management
  - Declarative schema management
  - Can coexist with Copilot tables (won't interfere with existing migrations)
- **LangChain.js** - LLM application framework
  - Unified interface for multiple LLM providers (OpenAI, Anthropic, etc.)
  - Prompt templates and chain composition
  - Output parsers for structured responses
- **LangGraph.js** - Graph-based LLM workflow orchestration
  - State management for complex evaluation workflows
  - Conditional routing and feedback loops
  - Human-in-the-loop (HITL) support with interrupt points for rubric review and human evaluation
  - Checkpointing for resumable workflows
- **Playwright** - Browser automation for copilot execution
  - Headless browser automation for web-based Zed editor
  - Multi-browser support (Chromium, Firefox, WebKit)
  - Auto-waiting and built-in debugging tools
  - Video recording and screenshot capture for test failures
- **Kubernetes Jobs** - Orchestrate concurrent evaluation workloads
  - Native job scheduling and execution
  - Horizontal scaling with parallel job execution
  - Built-in retry logic and failure handling
  - Resource isolation per evaluation job
  - No external message broker required
- **@kubernetes/client-node** - Official Kubernetes client library
  - Submit and manage Job resources
  - Monitor job status and lifecycle events
  - Query pod status and logs
  - Handle authentication (kubeconfig, service accounts)
- **ts-node** - TypeScript execution for development
- **ESLint + Prettier** - Code quality and formatting

---

## GraphQL API Documentation

The system provides a comprehensive GraphQL API for all evaluation operations. The API is organized into several functional areas:

### Endpoint Information

- **Development URL**: `http://localhost:4000/graphql`
- **GraphQL Playground**: Available at the same endpoint (browser access)
- **Health Check**: `GET http://localhost:4000/health`

### Authentication

Currently, the API is open for development. For production deployments, implement JWT-based authentication:

```graphql
# Add Authorization header to requests
Authorization: Bearer <your-jwt-token>
```

---

## Golden Set API

Manage test schemas and datasets used for evaluation.

### Query: Get Golden Set Schemas

List all schema IDs available in the golden set:

```graphql
query GetGoldenSetSchemas($copilotType: CopilotType) {
  getGoldenSetSchemas(copilotType: $copilotType)
}
```

**Example:**

```graphql
query {
  getGoldenSetSchemas(copilotType: DATA_MODEL_BUILDER)
}

# Response:
# ["schema-123", "schema-456", "schema-789"]
```

### Query: Get Golden Sets

Retrieve golden set entries with full details:

```graphql
query GetGoldenSets($projectExId: String, $copilotType: CopilotType) {
  getGoldenSets(projectExId: $projectExId, copilotType: $copilotType) {
    id
    projectExId
    schemaExId
    copilotType
    description
    promptTemplate
    idealResponse
    createdAt
    isActive
    nextGoldenSet {
      id
      description
      promptTemplate
      idealResponse
    }
  }
}
```

**Example:**

```graphql
query {
  getGoldenSets(copilotType: DATA_MODEL_BUILDER) {
    id
    schemaExId
    description
    copilotType
  }
}
```

### Mutation: Update Golden Set Project

Add or update a golden set entry:

```graphql
mutation UpdateGoldenSetProject(
  $projectExId: String!
  $schemaExId: String!
  $copilotType: CopilotType!
  $description: String
  $promptTemplate: String!
  $idealResponse: JSON!
) {
  updateGoldenSetProject(
    projectExId: $projectExId
    schemaExId: $schemaExId
    copilotType: $copilotType
    description: $description
    promptTemplate: $promptTemplate
    idealResponse: $idealResponse
  ) {
    id
    schemaExId
    copilotType
    createdAt
  }
}
```

**Example:**

```graphql
mutation {
  updateGoldenSetProject(
    projectExId: "proj-123"
    schemaExId: "schema-456"
    copilotType: DATA_MODEL_BUILDER
    description: "E-commerce schema with products and orders"
    promptTemplate: "Create a data model for an e-commerce system"
    idealResponse: { entities: ["Product", "Order", "Customer"] }
  ) {
    id
    schemaExId
  }
}
```

---

## HITL Evaluation API

Human-in-the-Loop evaluation workflow with review checkpoints.

### The HITL Flow

1. **Start Session** → Generates rubric draft, pauses for review
2. **Submit Rubric Review** → Approves/modifies rubric, generates agent evaluation, pauses for human evaluation
3. **Submit Human Evaluation** → Provides human scores, completes evaluation with final report

### 1. Start Graph Session

Initialize a new HITL evaluation session:

```graphql
mutation StartGraphSession(
  $projectExId: String!
  $schemaExId: String!
  $copilotType: CopilotType!
  $modelName: String!
  $skipHumanReview: Boolean
  $skipHumanEvaluation: Boolean
) {
  startGraphSession(
    projectExId: $projectExId
    schemaExId: $schemaExId
    copilotType: $copilotType
    modelName: $modelName
    skipHumanReview: $skipHumanReview
    skipHumanEvaluation: $skipHumanEvaluation
  ) {
    sessionId
    threadId
    status
    rubricDraft {
      id
      version
      criteria {
        id
        name
        description
        weight
        scoringScale {
          min
          max
          labels
        }
        isHardConstraint
      }
      totalWeight
    }
    message
  }
}
```

**Example:**

```graphql
mutation {
  startGraphSession(
    projectExId: "proj-123"
    schemaExId: "schema-456"
    copilotType: DATA_MODEL_BUILDER
    modelName: "gpt-4"
    skipHumanReview: false
    skipHumanEvaluation: false
  ) {
    sessionId
    threadId
    status # Returns "AWAITING_RUBRIC_REVIEW"
    rubricDraft {
      id
      criteria {
        name
        description
        weight
      }
    }
    message
  }
}
```

### 2. Submit Rubric Review

Review and approve/modify the generated rubric:

```graphql
mutation SubmitRubricReview(
  $sessionId: Int!
  $threadId: String!
  $approved: Boolean!
  $modifiedRubric: RubricInput
  $feedback: String
  $reviewerAccountId: String!
) {
  submitRubricReview(
    sessionId: $sessionId
    threadId: $threadId
    approved: $approved
    modifiedRubric: $modifiedRubric
    feedback: $feedback
    reviewerAccountId: $reviewerAccountId
  ) {
    sessionId
    threadId
    status # Returns "AWAITING_HUMAN_EVALUATION" after agent eval
    rubricFinal {
      id
      version
      criteria {
        id
        name
        description
        weight
      }
    }
    message
  }
}

input RubricInput {
  id: String!
  version: String!
  criteria: [RubricCriterionInput!]!
  totalWeight: Float!
}

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
```

**Example - Approve without changes:**

```graphql
mutation {
  submitRubricReview(
    sessionId: 123
    threadId: "thread-abc-123"
    approved: true
    reviewerAccountId: "user-789"
  ) {
    status
    message
  }
}
```

**Example - Modify rubric:**

```graphql
mutation {
  submitRubricReview(
    sessionId: 123
    threadId: "thread-abc-123"
    approved: true
    modifiedRubric: {
      id: "rubric-xyz"
      version: "1.1"
      criteria: [
        {
          id: "entity-coverage"
          name: "Entity Coverage"
          description: "All required entities identified"
          weight: 0.3
          scoringScale: { min: 0, max: 10 }
          isHardConstraint: true
        }
      ]
      totalWeight: 1.0
    }
    feedback: "Adjusted weight for entity coverage"
    reviewerAccountId: "user-789"
  ) {
    status
    rubricFinal {
      version
    }
  }
}
```

### 3. Submit Human Evaluation

Provide human evaluation scores to complete the assessment:

```graphql
mutation SubmitHumanEvaluation(
  $sessionId: Int!
  $threadId: String!
  $scores: [EvaluationScoreInput!]!
  $overallAssessment: String!
  $evaluatorAccountId: String!
) {
  submitHumanEvaluation(
    sessionId: $sessionId
    threadId: $threadId
    scores: $scores
    overallAssessment: $overallAssessment
    evaluatorAccountId: $evaluatorAccountId
  ) {
    sessionId
    threadId
    status # Returns "COMPLETED"
    finalReport {
      verdict
      overallScore
      summary
      detailedAnalysis
      agentEvaluation {
        scores {
          criterionId
          score
          reasoning
        }
        overallScore
        summary
      }
      humanEvaluation {
        scores {
          criterionId
          score
          reasoning
        }
        overallScore
        summary
      }
      discrepancies
      auditTrace
    }
    message
  }
}

input EvaluationScoreInput {
  criterionId: String!
  score: Float!
  reasoning: String!
  evidence: [String!]
}
```

**Example:**

```graphql
mutation {
  submitHumanEvaluation(
    sessionId: 123
    threadId: "thread-abc-123"
    scores: [
      {
        criterionId: "entity-coverage"
        score: 8.5
        reasoning: "Most entities identified, missing Payment entity"
        evidence: ["Found Product, Order, Customer", "Missing Payment"]
      }
      {
        criterionId: "relationship-correctness"
        score: 9.0
        reasoning: "All relationships correctly defined"
        evidence: ["Order -> Customer foreign key correct"]
      }
    ]
    overallAssessment: "Good data model with minor gaps"
    evaluatorAccountId: "user-789"
  ) {
    status
    finalReport {
      verdict
      overallScore
      summary
      discrepancies
    }
  }
}
```

### 4. Get Session State

Query the current state of a graph session:

```graphql
query GetGraphSessionState($sessionId: Int!) {
  getGraphSessionState(sessionId: $sessionId) {
    sessionId
    status
    threadId
    rubricDraft {
      id
      criteria {
        name
        weight
      }
    }
    rubricFinal {
      id
      criteria {
        name
        weight
      }
    }
    agentEvaluation {
      scores {
        criterionId
        score
        reasoning
      }
      overallScore
      summary
    }
    humanEvaluation {
      scores {
        criterionId
        score
        reasoning
      }
      overallScore
      summary
    }
    finalReport {
      verdict
      overallScore
      summary
      detailedAnalysis
      discrepancies
    }
  }
}
```

**Example:**

```graphql
query {
  getGraphSessionState(sessionId: 123) {
    status
    rubricFinal {
      criteria {
        name
      }
    }
    finalReport {
      verdict
      overallScore
    }
  }
}
```

---

## Automated Evaluation API

Run fully automated evaluations without human intervention.

### Run Automated Evaluation

Execute a complete evaluation using AI only:

```graphql
mutation RunAutomatedEvaluation(
  $projectExId: String!
  $schemaExId: String!
  $copilotType: CopilotType!
  $modelName: String!
) {
  runAutomatedEvaluation(
    projectExId: $projectExId
    schemaExId: $schemaExId
    copilotType: $copilotType
    modelName: $modelName
  ) {
    sessionId
    threadId
    status # Returns "COMPLETED"
    finalReport {
      verdict
      overallScore
      summary
      detailedAnalysis
      agentEvaluation {
        scores {
          criterionId
          score
          reasoning
        }
        overallScore
        summary
      }
      discrepancies
      auditTrace
      generatedAt
    }
    message
  }
}
```

**Example:**

```graphql
mutation {
  runAutomatedEvaluation(
    projectExId: "proj-123"
    schemaExId: "schema-456"
    copilotType: DATA_MODEL_BUILDER
    modelName: "gpt-4"
  ) {
    sessionId
    status
    finalReport {
      verdict
      overallScore
      summary
    }
  }
}
```

---

## Rubric Management API

Query and manage evaluation rubrics.

### Query: Get Rubrics by Schema

Get all rubrics for a specific schema:

```graphql
query GetAdaptiveRubricsBySchemaExId($schemaExId: String!) {
  getAdaptiveRubricsBySchemaExId(schemaExId: $schemaExId) {
    id
    rubricId
    version
    criteria {
      id
      name
      description
      weight
      scoringScale {
        min
        max
        labels
      }
      isHardConstraint
    }
    totalWeight
    reviewStatus
    createdAt
    reviewedAt
    reviewedBy
  }
}
```

### Query: Get Rubrics by Session

Get the rubric for a specific evaluation session:

```graphql
query GetAdaptiveRubricsBySession($sessionId: Int!) {
  getAdaptiveRubricsBySession(sessionId: $sessionId) {
    id
    rubricId
    version
    criteria {
      name
      weight
    }
    copilotInput
    copilotOutput
    modelProvider
    modelName
    reviewStatus
    judgeRecords {
      id
      evaluatorType
      overallScore
      summary
      timestamp
    }
  }
}
```

### Query: Get Rubrics for Review

Get rubrics pending review:

```graphql
query GetRubricsForReview($sessionId: Int, $reviewStatus: RubricReviewStatus) {
  getRubricsForReview(sessionId: $sessionId, reviewStatus: $reviewStatus) {
    id
    rubricId
    sessionId
    criteria {
      name
      description
    }
    reviewStatus
    createdAt
  }
}
```

**Example:**

```graphql
query {
  getRubricsForReview(reviewStatus: PENDING) {
    id
    sessionId
    reviewStatus
    createdAt
  }
}
```

---

## Session Management API

Query evaluation sessions and their results.

### Query: Get Session

Get details of a specific evaluation session:

```graphql
query GetSession($id: ID!) {
  getSession(id: $id) {
    id
    projectExId
    schemaExId
    copilotType
    modelName
    status
    startedAt
    completedAt
    totalLatencyMs
    roundtripCount
    inputTokens
    outputTokens
    totalTokens
    contextPercentage
    rubric {
      id
      rubricId
      criteria {
        name
        weight
      }
    }
    result {
      verdict
      overallScore
      summary
      evaluationStatus
    }
  }
}
```

### Query: Get Sessions

List multiple sessions with filters:

```graphql
query GetSessions(
  $schemaExId: String
  $copilotType: CopilotType
  $modelName: String
) {
  getSessions(
    schemaExId: $schemaExId
    copilotType: $copilotType
    modelName: $modelName
  ) {
    id
    schemaExId
    copilotType
    modelName
    status
    startedAt
    completedAt
    result {
      overallScore
      verdict
    }
  }
}
```

**Example:**

```graphql
query {
  getSessions(schemaExId: "schema-456", copilotType: DATA_MODEL_BUILDER) {
    id
    modelName
    status
    result {
      overallScore
    }
  }
}
```

---

## Analytics API

Query evaluation results and metrics.

### Query: Get Evaluation Result

Get the final evaluation result for a session:

```graphql
query GetEvaluationResult($sessionId: Int!) {
  getEvaluationResult(sessionId: $sessionId) {
    id
    sessionId
    schemaExId
    copilotType
    modelName
    evaluationStatus
    verdict
    overallScore
    summary
    detailedAnalysis
    discrepancies
    auditTrace
    generatedAt
    createdAt
  }
}
```

### Query: Compare Models

Compare performance across different models:

```graphql
query CompareModels($schemaExId: String!, $modelNames: [String!]!) {
  compareModels(schemaExId: $schemaExId, modelNames: $modelNames) {
    schemaExId
    models {
      modelName
      metrics
      overallScore
      avgLatencyMs
      avgTokens
      passRate
    }
  }
}
```

**Example:**

```graphql
query {
  compareModels(
    schemaExId: "schema-456"
    modelNames: ["gpt-4", "gpt-4o-mini", "gemini-2.5-pro"]
  ) {
    schemaExId
    models {
      modelName
      overallScore
      avgLatencyMs
      passRate
    }
  }
}
```

### Query: Dashboard Metrics

Get aggregated metrics for the dashboard:

```graphql
query GetDashboardMetrics(
  $copilotType: CopilotType
  $modelName: String
  $startDate: DateTime
  $endDate: DateTime
) {
  getDashboardMetrics(
    copilotType: $copilotType
    modelName: $modelName
    startDate: $startDate
    endDate: $endDate
  ) {
    totalSessions
    avgOverallScore
    avgLatencyMs
    avgTokenUsage
    passRateByCategory {
      category
      passRate
      totalRubrics
    }
    modelPerformanceTrend {
      date
      score
      sessionCount
    }
  }
}
```

**Example:**

```graphql
query {
  getDashboardMetrics(
    copilotType: DATA_MODEL_BUILDER
    startDate: "2025-01-01T00:00:00Z"
    endDate: "2025-12-31T23:59:59Z"
  ) {
    totalSessions
    avgOverallScore
    passRateByCategory {
      category
      passRate
    }
  }
}
```

---

## GraphQL Types Reference

### Enums

```graphql
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

enum GraphSessionStatus {
  PENDING
  AWAITING_RUBRIC_REVIEW
  AWAITING_HUMAN_EVALUATION
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
```

### Scalar Types

```graphql
scalar DateTime # ISO 8601 date-time string
scalar JSON # Arbitrary JSON data
```

---

## Legacy API (Job-based Execution)

The following mutations use the older Kubernetes Job-based execution model and are maintained for backward compatibility:

### Mutation: Execute AI Copilot

```graphql
mutation ExecAiCopilotByTypeAndModel(
  $projectExId: String!
  $schemaExId: String!
  $copilotType: CopilotType!
  $modelName: String!
) {
  execAiCopilotByTypeAndModel(
    projectExId: $projectExId
    schemaExId: $schemaExId
    copilotType: $copilotType
    modelName: $modelName
  )
}
```

**Note:** This creates a Kubernetes Job for evaluation. For new integrations, use the HITL or Automated Evaluation APIs instead.

---

## Error Handling

All GraphQL operations follow standard error conventions:

```json
{
  "errors": [
    {
      "message": "Session not found",
      "path": ["getSession"],
      "extensions": {
        "code": "NOT_FOUND"
      }
    }
  ],
  "data": {
    "getSession": null
  }
}
```

Common error codes:

- `NOT_FOUND` - Resource doesn't exist
- `BAD_USER_INPUT` - Invalid input parameters
- `INTERNAL_SERVER_ERROR` - Server-side error

---

## Rate Limiting & Best Practices

1. **Batch Queries**: Use GraphQL's ability to query multiple resources in one request
2. **Field Selection**: Only request fields you need to reduce payload size
3. **Pagination**: For large result sets, implement cursor-based pagination (future enhancement)
4. **Caching**: Results are cacheable based on session ID and timestamp

---

## High-Level Architecture

```architecture
┌─────────────────────────────────────────────────────────────────┐
│                          Client Layer                           │
│                    (GraphQL API Consumers)                      │
│            Web UI, CLI Tools, CI/CD Pipelines                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Express + Apollo Server                      │
│                      (GraphQL API Layer)                        │
│  • Queries: Sessions, rubrics, results, analytics               │
│  • Mutations: HITL workflow, automated evaluation               │
│  • Real-time: Session state tracking                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
        ┌───────────────────┐   ┌──────────────────────┐
        │  Service Layer    │   │   LangGraph Engine   │
        │  (Business Logic) │   │   (HITL Workflows)   │
        │                   │   │                      │
        │  • Golden Sets    │   │  • State Management  │
        │  • Analytics      │   │  • Checkpointing     │
        │  • Sessions       │   │  • Human Interrupts  │
        └───────────────────┘   └──────────────────────┘
                    │                   │
                    │                   │
                    ▼                   ▼
        ┌───────────────────────────────────────────────┐
        │          PostgreSQL Database                   │
        │                                                │
        │  Tables:                                       │
        │  • goldenSet - Test schemas & prompts          │
        │  • evaluationSession - Session metadata        │
        │  • adaptiveRubric - Generated rubrics          │
        │  • adaptiveRubricJudgeRecord - Evaluations     │
        │  • evaluationResult - Final reports            │
        │                                                │
        │  LangGraph Checkpoints:                        │
        │  • Thread state persistence                    │
        │  • HITL interrupt points                       │
        └───────────────────────────────────────────────┘
                              │
                              ▼
        ┌───────────────────────────────────────────────┐
        │         LangGraph Evaluation Workflow         │
        │                                                │
        │  1. executeCopilot                             │
        │     └─> Run copilot, capture output            │
        │                                                │
        │  2. generateRubric                             │
        │     └─> AI generates evaluation criteria       │
        │                                                │
        │  3. humanReviewer (⏸ INTERRUPT)                │
        │     └─> Wait for rubric approval/modification  │
        │                                                │
        │  4. agentEvaluator                             │
        │     └─> AI evaluates copilot output            │
        │                                                │
        │  5. humanEvaluator (⏸ INTERRUPT)               │
        │     └─> Wait for human evaluation scores       │
        │                                                │
        │  6. generateFinalReport                        │
        │     └─> Compare agent vs human, create report  │
        │                                                │
        │  Nodes can be skipped via flags:               │
        │  • skipHumanReview: true                       │
        │  • skipHumanEvaluation: true                   │
        └───────────────────────────────────────────────┘
                              │
                              ▼
        ┌───────────────────────────────────────────────┐
        │              External Services                 │
        │                                                │
        │  • OpenAI API (GPT-4, GPT-4o-mini)             │
        │  • Google Gemini API (gemini-2.5-pro)          │
        │  • Functorz Copilot WebSocket                  │
        │  • Functorz Backend GraphQL API                │
        └───────────────────────────────────────────────┘
```

### Key Architectural Features

1. **LangGraph-Based HITL Workflow**

   - State machine with conditional routing
   - Interrupt points for human input (`humanReviewer`, `humanEvaluator`)
   - Checkpointing for resumable workflows
   - Skip flags for automated mode

2. **GraphQL API Gateway**

   - Single endpoint for all operations
   - Type-safe schema with strong typing
   - Real-time session state queries
   - Comprehensive error handling

3. **Dual Evaluation Mode**

   - **HITL Mode**: Human review at rubric and evaluation stages
   - **Automated Mode**: AI-only evaluation for batch processing

4. **Database as State Store**
   - PostgreSQL for persistent data
   - LangGraph checkpoints for workflow state
   - Transactional consistency across operations

---

### HITL Workflow State Machine

```bash
START
  │
  ├─> executeCopilot
  │     │
  │     ├─> generateRubric
  │     │     │
  │     │     ├─> [skipHumanReview=false]
  │     │     │     │
  │     │     │     └─> humanReviewer ⏸ AWAITING_RUBRIC_REVIEW
  │     │     │           │ (GraphQL: submitRubricReview)
  │     │     │           │
  │     │     └─> [skipHumanReview=true]
  │     │           │
  │     │           └─> agentEvaluator
  │     │                 │
  │     │                 ├─> [skipHumanEvaluation=false]
  │     │                 │     │
  │     │                 │     └─> humanEvaluator ⏸ AWAITING_HUMAN_EVALUATION
  │     │                 │           │ (GraphQL: submitHumanEvaluation)
  │     │                 │           │
  │     │                 └─> [skipHumanEvaluation=true]
  │     │                       │
  │     └─> generateFinalReport
  │           │
  └─> END ✓ COMPLETED
```

### LangGraph State Schema

```typescript
interface EvaluationState {
  // Session metadata
  sessionId: number;
  projectExId: string;
  schemaExId: string;
  copilotType: CopilotType;
  modelName: string;

  // Workflow flags
  skipHumanReview: boolean;
  skipHumanEvaluation: boolean;

  // Copilot execution
  copilotInput?: string;
  copilotOutput?: string;
  copilotMetrics?: {
    latencyMs: number;
    roundtrips: number;
    inputTokens: number;
    outputTokens: number;
  };

  // Rubric generation
  rubricDraft?: Rubric;
  rubricFinal?: Rubric;
  rubricFeedback?: string;

  // Evaluations
  agentEvaluation?: Evaluation;
  humanEvaluation?: Evaluation;

  // Final report
  finalReport?: FinalReport;

  // Error handling
  error?: string;
}

interface Rubric {
  id: string;
  version: string;
  criteria: RubricCriterion[];
  totalWeight: number;
  createdAt: string;
  updatedAt: string;
}

interface Evaluation {
  evaluatorType: 'agent' | 'human';
  scores: EvaluationScore[];
  overallScore: number;
  summary: string;
  timestamp: string;
}

interface FinalReport {
  verdict: 'pass' | 'fail' | 'needs_review';
  overallScore: number;
  summary: string;
  detailedAnalysis: string;
  agentEvaluation: Evaluation;
  humanEvaluation?: Evaluation;
  discrepancies: string[];
  auditTrace: string[];
  generatedAt: string;
}
```

---

## Data Model Design

### Current Database Schema

The system uses PostgreSQL with Prisma ORM. The schema is designed to support the LangGraph-based HITL evaluation workflow.

#### Core Tables

**`goldenSet`** - Test schemas and reference data

- Stores project schemas used for evaluation
- Links to next iteration of golden sets (`nextGoldenSet`)
- Includes prompt templates and ideal responses

**`evaluationSession`** - Evaluation session tracking

- One record per evaluation run
- Tracks session status (PENDING → RUNNING → COMPLETED/FAILED)
- Stores performance metrics (tokens, latency, roundtrips)
- Contains metadata for LangGraph thread ID and workflow flags

**`adaptiveRubric`** - Generated evaluation criteria

- Structured rubric matching LangGraph `Rubric` interface
- Contains array of `RubricCriterion` objects (stored as JSON)
- Tracks review status and timestamps
- One-to-one relationship with `evaluationSession`

**`adaptiveRubricJudgeRecord`** - Evaluation scores

- Stores both agent and human evaluations
- `evaluatorType`: 'agent' or 'human'
- Contains structured `EvaluationScore` array (stored as JSON)
- Multiple records per rubric (agent + human)

**`evaluationResult`** - Final evaluation reports

- Matches LangGraph `FinalReport` interface
- Contains verdict ('pass', 'fail', 'needs_review')
- Stores detailed analysis and discrepancies
- Includes audit trace for transparency

### Prisma Schema Reference

See [`prisma/schema.prisma`](./prisma/schema.prisma) for the complete schema definition.

Key features:

- Enums for type safety (`CopilotType`, `SessionStatus`, `RubricReviewStatus`, etc.)
- JSON fields for flexible structured data (rubric criteria, evaluation scores)
- Proper indexing on frequently queried fields
- Relations enforced at the database level
- Timestamps with timezone support

---

## API Design (Deprecated - See GraphQL API Documentation Above)

### GraphQL Schema

```prisma
generator client {
  provider = "prisma-client-js"
  previewFeatures = ["multiSchema"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  schemas  = ["evaluation", "copilot"]
}

// ============================================
// Copilot Tables (READ-ONLY - Don't migrate)
// ============================================

// Map existing Copilot session table for reading
model copilot_session {
  id               BigInt    @id @default(autoincrement())
  project_id       BigInt
  account_id       BigInt
  title            String?
  job_state        Json?
  copilot_messages Json?
  terminated       Boolean?  @default(false)
  created_at       DateTime? @default(now()) @db.Timestamptz(6)
  updated_at       DateTime? @default(now()) @db.Timestamptz(6)

  @@index([created_at], map: "idx_copilot_session_created_at")
  @@index([project_id, account_id], map: "idx_copilot_session_project_id")
}

model copilot_error_log {
  id         BigInt    @id @default(autoincrement())
  session_id BigInt
  error_info Json?
  created_at DateTime? @default(now()) @db.Timestamptz(6)

  @@index([session_id], map: "idx_copilot_error_log_session_id")
}

model copilot_evaluation_log {
  id         BigInt    @id @default(autoincrement())
  session_id BigInt
  message_id BigInt?
  type       String?
  content    String?
  created_at DateTime? @default(now()) @db.Timestamptz(6)

  @@index([session_id], map: "idx_copilot_evaluation_log_session_id")
}

model copilot_llm_call_log {
  id         BigInt    @id @default(autoincrement())
  session_id BigInt
  model      String?
  content    Json?
  response   Json?
  time_cost  Int?
  token_cost Int?
  created_at DateTime? @default(now()) @db.Timestamptz(6)

  @@index([session_id], map: "idx_copilot_llm_call_log_session_id")
}

// Evaluation Tables (Your migrations)
// ============================================

// Golden Set Management
model golden_set {
  id             BigInt   @id @default(autoincrement())
  project_ex_id  String
  schema_ex_id   String
  copilot_type   String   // 'data_model', 'ui_builder', 'actionflow', 'log_analyzer', 'agent_builder'
  description    String?
  created_at     DateTime @default(now()) @db.Timestamptz(6)
  created_by     String?
  is_active      Boolean  @default(true)

  @@unique([project_ex_id, schema_ex_id, copilot_type])
  @@index([schema_ex_id], map: "idx_golden_set_schema")
  @@schema("evaluation")
}

// Execution Sessions (references copilot schema tables)
model evaluation_session {
  id                 BigInt              @id @default(autoincrement())
  schema_ex_id       String
  copilot_type       String
  model_name         String              // e.g., 'gpt-4', 'claude-3-opus'
  session_id_ref     BigInt?             // Reference to copilot_session.id
  started_at         DateTime            @default(now()) @db.Timestamptz(6)
  completed_at       DateTime?           @db.Timestamptz(6)
  status             String              @default("running") // 'running', 'completed', 'failed'

  // Performance Metrics
  total_latency_ms   Int?
  roundtrip_count    Int?
  input_tokens       Int?
  output_tokens      Int?
  context_percentage Decimal?            @db.Decimal(5, 2) // % of max context window used

  // Metadata
  metadata           Json?

  // Relations
  rubrics            adaptive_rubric[]
  result             evaluation_result?

  @@index([schema_ex_id], map: "idx_evaluation_session_schema")
  @@schema("evaluation")
}

// Adaptive Rubrics (AI-generated evaluation questions)
model adaptive_rubric {
  id              BigInt              @id @default(autoincrement())
  project_ex_id   String
  schema_ex_id    String
  session_id      BigInt

  // Rubric Content
  content         String              // The actual question/rubric
  rubric_type     String?             // e.g., 'completeness', 'correctness', 'naming_convention'
  category        String?             // e.g., 'entity_coverage', 'attribute_completeness'
  expected_answer String?             // 'yes' or 'no'

  // Status
  review_status   String              @default("pending") // 'pending', 'approved', 'rejected', 'modified'
  is_active       Boolean             @default(true)

  // Timestamps
  generated_at    DateTime            @default(now()) @db.Timestamptz(6)
  reviewed_at     DateTime?           @db.Timestamptz(6)
  reviewed_by     String?

  // Relations
  session         evaluation_session  @relation(fields: [session_id], references: [id])
  judge_records   adaptive_rubric_judge_record[]

  @@index([session_id], map: "idx_adaptive_rubric_session")
  @@schema("evaluation")
}

// Rubric Judgments (human reviews)
model adaptive_rubric_judge_record {
  id                  BigInt          @id @default(autoincrement())
  adaptive_rubric_id  BigInt
  account_id          String
  result              Boolean         // true = pass, false = fail
  confidence_score    Int?            // 1-5 scale
  notes               String?
  judged_at           DateTime        @default(now()) @db.Timestamptz(6)

  // Relations
  rubric              adaptive_rubric @relation(fields: [adaptive_rubric_id], references: [id])

  @@index([adaptive_rubric_id], map: "idx_rubric_judge_rubric")
  @@schema("evaluation")
}

// Evaluation Results Summary (aggregated metrics)
model evaluation_result {
  id            BigInt             @id @default(autoincrement())
  session_id    BigInt             @unique
  schema_ex_id  String

  // Quality Metrics (specific to copilot type)
  metrics       Json               // Flexible storage for different metric types
  // Examples:
  // Data Model Builder: {
  //   "entity_coverage": 0.95,
  //   "attribute_completeness": 0.87,
  //   "naming_convention_adherence": 0.92,
  //   "relational_integrity": 0.88,
  //   "normalization_level": 0.85
  // }
  // UI Builder: {
  //   "component_choice_relevance": 0.91,
  //   "layout_coherence": 0.89,
  //   "style_adherence": 0.94,
  //   "responsiveness_check": 0.86
  // }
  // Actionflow Builder: {
  //   "task_adherence": 0.93,
  //   "logical_correctness": 0.90,
  //   "efficiency": 0.85
  // }

  // Overall Score
  overall_score Decimal            @db.Decimal(5, 2)

  created_at    DateTime           @default(now()) @db.Timestamptz(6)

  // Relations
  session       evaluation_session @relation(fields: [session_id], references: [id])

  @@schema("evaluation")
}
```

**Key Prisma Features Used:**

1. **Multi-Schema Support**: `@@schema("evaluation")` and `@@schema("copilot")`
2. **Indexes**: `@@index([schemaExId])` for query performance
3. **Relations**: `@relation(fields: [...], references: [...])` for type-safe queries
4. **Default Values**: `@default(now())`, `@default(true)`, `@default("running")`
5. **Field Mapping**: `@map("snake_case")` to match database naming conventions
6. **JSON Fields**: `Json` type for flexible metrics storage
7. **Decimal Precision**: `@db.Decimal(5, 2)` for scores and percentages

---

## API Design

### GraphQL Schema

```graphql
# Types
type GoldenSet {
  id: ID!
  projectExId: String!
  schemaExId: String!
  copilotType: CopilotType!
  description: String
  promptTemplate: String!
  idealResponse: JSON!
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
```

### REST API Endpoints (Express.js)

Minimal endpoints for health checks:

```typescript
// Health & Status
GET / api / health;
GET / api / status;
```

---

## Core Function Specifications

### 1. `updateGoldenSetProject()`

```typescript
/**
 * Add or update a project schema in the golden set
 * @param projectExId - External project identifier
 * @param schemaExId - External schema identifier
 * @param copilotType - Type of AI Copilot
 * @param description - Optional description
 * @returns Created/updated golden set entry
 */
async function updateGoldenSetProject(
  projectExId: string,
  schemaExId: string,
  copilotType: CopilotType,
  description?: string
): Promise<GoldenSet>;
```

### 2. `getGoldenSetSchemas()`

```typescript
/**
 * Retrieve all schema IDs in the golden set
 * @param copilotType - Optional filter by copilot type
 * @returns List of schema external IDs
 */
async function getGoldenSetSchemas(
  copilotType?: CopilotType
): Promise<string[]>;
```

### 3. `execAiCopilotByTypeAndModel()`

```typescript
/**
 * Execute AI Copilot with specified model on a schema
 * This creates an evaluation session and triggers the copilot
 * @param schemaExId - Schema to evaluate
 * @param copilotType - Type of copilot to run
 * @param modelName - Model version to use (e.g., 'gpt-4', 'claude-3-opus')
 * @returns Evaluation session with metrics
 */
async function execAiCopilotByTypeAndModel(
  schemaExId: string,
  copilotType: CopilotType,
  modelName: string
): Promise<EvaluationSession>;

// Implementation notes:
// 1. Create evaluation_session record
// 2. Trigger copilot execution (via API or automation framework)
// 3. Poll/wait for completion
// 4. Read copilot database for session metrics
// 5. Update evaluation_session with results
```

### 4. `genAdaptiveRubricsBySchemaExId()`

```typescript
/**
 * Generate evaluation rubrics based on copilot output
 * Uses LLM to create adaptive questions
 * @param schemaExId - Schema that was processed
 * @param sessionId - Evaluation session ID
 * @returns Generated rubrics (pending review)
 */
async function genAdaptiveRubricsBySchemaExId(
  schemaExId: string,
  sessionId: number
): Promise<AdaptiveRubric[]>;

// Implementation notes:
// 1. Fetch copilot output from session
// 2. Use LangChain to call LLM with prompt template for copilot type
// 3. Use custom output parser to extract structured rubrics (JSON)
// 4. Save as adaptive_rubric with reviewStatus='pending'
// 5. LangGraph manages the workflow state and retry logic
// 6. For Actionflow Builder example:
//    - "Does the workflow query the database for invoices? Yes/No."
//    - "Does the workflow check if invoice is unpaid? Yes/No."
//    - "Does the workflow check if invoice age > 30 days? Yes/No."
//    - "Does the workflow send an email? Yes/No."
```

### 5. `reviewAdaptiveRubricBySchemaExId()`

```typescript
/**
 * Get rubrics for human review
 * @param schemaExId - Schema identifier
 * @param reviewStatus - Filter by review status
 * @returns Rubrics needing review
 */
async function reviewAdaptiveRubricBySchemaExId(
  schemaExId: string,
  reviewStatus?: ReviewStatus
): Promise<AdaptiveRubric[]>;
```

### 6. `getAdaptiveRubricsBySchemaExId()`

```typescript
/**
 * Retrieve all rubrics for a schema
 * @param schemaExId - Schema identifier
 * @returns All rubrics (active only)
 */
async function getAdaptiveRubricsBySchemaExId(
  schemaExId: string
): Promise<AdaptiveRubric[]>;
```

### 7. `judge()`

```typescript
/**
 * Record human judgment on a rubric
 * @param adaptiveRubricId - Rubric to judge
 * @param accountId - Judge's account ID
 * @param result - Pass/fail (true/false)
 * @param confidenceScore - Optional confidence (1-5)
 * @param notes - Optional notes
 * @returns Judge record
 */
async function judge(
  adaptiveRubricId: number,
  accountId: string,
  result: boolean,
  confidenceScore?: number,
  notes?: string
): Promise<JudgeRecord>;
```

### 8. Kubernetes Job Management Functions

#### 8.1 `createEvaluationJob()`

```typescript
/**
 * Create and submit a Kubernetes Job for copilot evaluation
 * @param sessionId - Evaluation session ID
 * @param schemaExId - Schema to evaluate
 * @param copilotType - Type of copilot
 * @param modelName - LLM model to use
 * @returns Job name and submission status
 */
async function createEvaluationJob(
  sessionId: string,
  schemaExId: string,
  copilotType: CopilotType,
  modelName: string
): Promise<{
  jobName: string;
  namespace: string;
  created: boolean;
}>;
```

#### 8.2 `createRubricGenerationJob()`

```typescript
/**
 * Create and submit a Kubernetes Job for rubric generation
 * @param sessionId - Evaluation session ID to generate rubrics for
 * @returns Job name and submission status
 */
async function createRubricGenerationJob(sessionId: string): Promise<{
  jobName: string;
  namespace: string;
  created: boolean;
}>;
```

#### 8.3 `monitorJobStatus()`

```typescript
/**
 * Monitor Kubernetes Job status and update database
 * @param jobName - Name of the K8s job to monitor
 * @param sessionId - Associated evaluation session ID
 * @param onComplete - Optional callback when job completes
 * @returns Job status monitoring handle
 */
async function monitorJobStatus(
  jobName: string,
  sessionId: string,
  onComplete?: (status: 'SUCCESS' | 'FAILED') => Promise<void>
): Promise<{
  stop: () => void; // Function to stop monitoring
  getStatus: () => Promise<JobStatus>;
}>;
```

#### 8.4 `getJobStatus()`

```typescript
/**
 * Get current status of a Kubernetes Job
 * @param jobName - Name of the K8s job
 * @returns Parsed job status
 */
async function getJobStatus(jobName: string): Promise<{
  status: 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED';
  startTime?: Date;
  completionTime?: Date;
  activePods: number;
  succeededPods: number;
  failedPods: number;
  retriesLeft: number;
}>;
```

#### 8.5 `deleteCompletedJob()`

```typescript
/**
 * Delete a completed Kubernetes Job to free resources
 * @param jobName - Name of the job to delete
 * @returns Deletion confirmation
 */
async function deleteCompletedJob(jobName: string): Promise<{
  deleted: boolean;
  jobName: string;
}>;
```

#### 8.6 `buildJobManifest()`

```typescript
/**
 * Build a Kubernetes Job manifest from template
 * @param templateName - Template file name ('evaluation-job' or 'rubric-job')
 * @param variables - Template variables to interpolate
 * @returns Kubernetes Job manifest object
 */
async function buildJobManifest(
  templateName: 'evaluation-job' | 'rubric-job',
  variables: {
    sessionId: string;
    schemaExId?: string;
    copilotType?: CopilotType;
    modelName?: string;
    [key: string]: any;
  }
): Promise<V1Job>; // Kubernetes Job object
```

---

## Kubernetes Job Integration

### How K8s Jobs Execute Functions and Notify Backend

**Architecture Overview:**

- **Backend API Server**: Handles GraphQL requests, creates K8s jobs, monitors status
- **Kubernetes Job Pods**: Standalone containers that run evaluation logic
- **Shared Database**: Communication layer between backend and jobs
- **K8s API**: Job lifecycle management and status monitoring

### Complete Flow

#### 1. Job Submission (GraphQL → K8s API)

When a user triggers an evaluation:

```graphql
mutation {
  runEvaluation(
    input: {
      schemaExId: "schema-123"
      copilotType: DATA_MODEL_BUILDER
      modelName: "gpt-4"
    }
  ) {
    sessionId
    status # Returns "PENDING"
  }
}
```

**Backend Process:**

1. Creates `evaluation_session` record with `status = 'PENDING'`
2. Calls `JobCreator.createEvaluationJob()`:
   - Generates K8s Job manifest from template
   - Injects environment variables (SESSION_ID, SCHEMA_EX_ID, DATABASE_URL, etc.)
   - Submits job to Kubernetes API using `@kubernetes/client-node`
   - Gets back job name (e.g., `eval-job-abc123`)
3. Updates `evaluation_session.metadata` with `{k8sJobName: "eval-job-abc123"}`
4. Returns response immediately (async processing)

#### 2. Job Execution (K8s Pod runs standalone code)

Kubernetes creates a pod that executes `EvaluationJobRunner.ts`:

```typescript
// src/jobs/EvaluationJobRunner.ts
async function main() {
  const sessionId = process.env.SESSION_ID!;
  const schemaExId = process.env.SCHEMA_EX_ID!;
  const copilotType = process.env.COPILOT_TYPE!;
  const modelName = process.env.MODEL_NAME!;

  // Initialize Prisma (connects to same DB as backend)
  const prisma = new PrismaClient();

  try {
    // Update status to RUNNING
    await prisma.evaluation_session.update({
      where: { id: sessionId },
      data: {
        status: 'RUNNING',
        started_at: new Date(),
      },
    });

    // Execute evaluation with Playwright
    const automation = new PlaywrightRunner();
    const metrics = await automation.runCopilotEvaluation({
      schemaExId,
      copilotType,
      modelName,
    });

    // Save results to database
    await prisma.evaluation_session.update({
      where: { id: sessionId },
      data: {
        status: 'COMPLETED',
        completed_at: new Date(),
        total_latency_ms: metrics.totalLatency,
        roundtrip_count: metrics.roundtrips,
        input_tokens: metrics.inputTokens,
        output_tokens: metrics.outputTokens,
        context_percentage: metrics.contextUsage,
        metadata: metrics.additionalData,
      },
    });

    console.log(`✓ Evaluation ${sessionId} completed successfully`);
    process.exit(0); // Success - K8s marks job as completed
  } catch (error) {
    // Handle failure - update database
    await prisma.evaluation_session.update({
      where: { id: sessionId },
      data: {
        status: 'FAILED',
        metadata: { error: error.message, stack: error.stack },
      },
    });

    console.error(`✗ Evaluation ${sessionId} failed:`, error);
    process.exit(1); // Failure - K8s will retry based on backoffLimit
  }
}

main();
```

**Key Points:**

- Job is **self-contained** - all logic bundled in Docker image
- **Database as communication layer** - job writes directly to PostgreSQL
- Job updates its own `evaluation_session` status (RUNNING → COMPLETED/FAILED)
- Exit codes tell K8s whether to retry (exit 1) or complete (exit 0)

#### 3. Backend Monitoring (K8s API → Backend)

Backend monitors job status via Kubernetes API:

```typescript
// src/kubernetes/JobMonitor.ts
export class JobMonitor {
  private k8sApi: BatchV1Api;

  async monitorJob(jobName: string, sessionId: string): Promise<void> {
    // Poll job status every 10 seconds
    const interval = setInterval(async () => {
      const { body: job } = await this.k8sApi.readNamespacedJobStatus(
        jobName,
        KUBERNETES_NAMESPACE
      );

      if (job.status?.succeeded && job.status.succeeded > 0) {
        console.log(`✓ Job ${jobName} succeeded`);
        clearInterval(interval);

        // Optionally: Trigger post-processing (e.g., generate rubrics)
        await this.triggerRubricGeneration(sessionId);

        // Clean up completed job after 1 hour
        setTimeout(() => this.deleteJob(jobName), 3600000);
      } else if (
        job.status?.failed &&
        job.status.failed >= job.spec?.backoffLimit!
      ) {
        console.error(`✗ Job ${jobName} failed after retries`);
        clearInterval(interval);

        // Database already updated by job, just cleanup
        await this.deleteJob(jobName);
      }
    }, 10000);
  }

  private async triggerRubricGeneration(sessionId: string): Promise<void> {
    // Create another K8s job for rubric generation
    const jobCreator = new JobCreator();
    await jobCreator.createRubricGenerationJob(sessionId);
  }
}
```

**Monitoring Options:**

- **Polling**: Check job status periodically (simple, reliable)
- **Watch API**: Stream job events in real-time (efficient, complex)
- **Passive**: Don't monitor - just let jobs update database (simplest)

#### 4. Client Polling (GraphQL Query)

Client checks status by querying the database:

```graphql
query {
  evaluationSession(sessionId: "abc123") {
    status # PENDING → RUNNING → COMPLETED/FAILED
    started_at
    completed_at
    total_latency_ms
    roundtrip_count
    input_tokens
    output_tokens
    # Full results available when status = COMPLETED
  }
}
```

### Job Manifest Template

```yaml
# kubernetes/templates/evaluation-job.yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: eval-{{sessionId}}
  namespace: ai-evaluation
  labels:
    app: ai-copilot-evaluation
    type: evaluation
spec:
  backoffLimit: 3 # Retry up to 3 times on failure
  activeDeadlineSeconds: 3600 # Kill job after 1 hour
  ttlSecondsAfterFinished: 86400 # Auto-delete after 24 hours
  template:
    metadata:
      labels:
        app: ai-copilot-evaluation
        session-id: { { sessionId } }
    spec:
      restartPolicy: OnFailure
      containers:
        - name: evaluation-runner
          image: { { KUBERNETES_JOB_IMAGE } }
          imagePullPolicy: Always
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: db-credentials
                  key: url
            - name: SESSION_ID
              value: '{{sessionId}}'
            - name: SCHEMA_EX_ID
              value: '{{schemaExId}}'
            - name: COPILOT_TYPE
              value: '{{copilotType}}'
            - name: MODEL_NAME
              value: '{{modelName}}'
            - name: OPENAI_API_KEY
              valueFrom:
                secretKeyRef:
                  name: llm-credentials
                  key: openai-key
            - name: ANTHROPIC_API_KEY
              valueFrom:
                secretKeyRef:
                  name: llm-credentials
                  key: anthropic-key
          resources:
            requests:
              cpu: '{{KUBERNETES_JOB_CPU_REQUEST}}'
              memory: '{{KUBERNETES_JOB_MEMORY_REQUEST}}'
            limits:
              cpu: '{{KUBERNETES_JOB_CPU_LIMIT}}'
              memory: '{{KUBERNETES_JOB_MEMORY_LIMIT}}'
          volumeMounts:
            - name: playwright-cache
              mountPath: /root/.cache/ms-playwright
      volumes:
        - name: playwright-cache
          emptyDir: {}
```

### Key Design Decisions

| Aspect            | Decision                      | Rationale                                     |
| ----------------- | ----------------------------- | --------------------------------------------- |
| **Communication** | Database as shared state      | No message broker needed, simple architecture |
| **Job Updates**   | Jobs write directly to DB     | Self-contained, backend just monitors         |
| **Retry Logic**   | K8s `backoffLimit: 3`         | Built-in retry with exponential backoff       |
| **Timeout**       | `activeDeadlineSeconds: 3600` | Prevent hung jobs, force cleanup              |
| **Cleanup**       | `ttlSecondsAfterFinished`     | Auto-delete completed jobs after 24h          |
| **Monitoring**    | Optional K8s API polling      | Backend can trigger follow-up actions         |
| **Isolation**     | One pod per evaluation        | Resource limits, no interference              |
| **State**         | Stateless jobs                | All config via env vars, no mounted state     |

### Benefits vs RabbitMQ

✅ **No external broker** - Kubernetes is the orchestrator  
✅ **Simpler architecture** - Database + K8s API only  
✅ **Better resource control** - Per-job CPU/memory limits  
✅ **Native retry/timeout** - Built into K8s Job spec  
✅ **Visual monitoring** - K8s dashboard shows all jobs  
✅ **Clean isolation** - Each evaluation in separate pod  
✅ **Auto cleanup** - TTL deletes old jobs automatically

---

## System Workflow

### Complete HITL Evaluation Flow

The system supports two evaluation modes:

#### 1. Human-in-the-Loop (HITL) Mode

```bash
1. SETUP GOLDEN SET
   ├─> GraphQL: updateGoldenSetProject
   ├─> Add project schemas with prompt templates
   └─> Store ideal responses for comparison

2. START HITL SESSION
   ├─> GraphQL: startGraphSession
   ├─> System executes copilot via WebSocket
   ├─> Captures copilot output and metrics
   ├─> AI generates rubric draft
   └─> ⏸ PAUSE: AWAITING_RUBRIC_REVIEW

3. REVIEW RUBRIC (Human Input #1)
   ├─> GraphQL: submitRubricReview
   ├─> Human reviews AI-generated rubric criteria
   ├─> Option to approve, reject, or modify
   ├─> System generates agent evaluation
   └─> ⏸ PAUSE: AWAITING_HUMAN_EVALUATION

4. PROVIDE EVALUATION (Human Input #2)
   ├─> GraphQL: submitHumanEvaluation
   ├─> Human scores copilot output per criterion
   ├─> Provides reasoning and evidence
   ├─> System compares agent vs human scores
   ├─> Identifies discrepancies
   └─> ✓ COMPLETE: Generates final report

5. ANALYZE RESULTS
   ├─> GraphQL: getEvaluationResult
   ├─> View verdict (pass/fail/needs_review)
   ├─> Compare agent vs human evaluations
   ├─> Review discrepancies and audit trail
   └─> Export metrics for decision-making
```

#### 2. Automated Mode (AI-Only)

```bash
1. SETUP GOLDEN SET
   └─> Same as HITL mode

2. RUN AUTOMATED EVALUATION
   ├─> GraphQL: runAutomatedEvaluation
   ├─> System executes copilot
   ├─> AI generates rubric (auto-approved)
   ├─> AI evaluates copilot output
   ├─> Generates final report
   └─> ✓ COMPLETE: Returns results immediately

3. ANALYZE RESULTS
   └─> Same as HITL mode, but only agent evaluation
```

### LangGraph Workflow Execution

The evaluation is powered by a LangGraph state machine:

```bash
┌─────────────────┐
│ executeCopilot  │ - Run copilot, capture output/metrics
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ generateRubric  │ - AI generates evaluation criteria
└────────┬────────┘
         │
         ▼
    [Skip Human Review?]
         │
    ┌────┴────┐
  NO│         │YES
    │         ▼
    │    ┌─────────────────┐
    │    │ agentEvaluator  │
    │    └────────┬────────┘
    │             │
    ▼             │
┌─────────────────┐│
│ humanReviewer   ││ - ⏸ Interrupt for rubric approval
└────────┬────────┘│
         │         │
         ▼         │
┌─────────────────┐│
│ agentEvaluator  ││ - AI evaluates copilot output
└────────┬────────┘
         │◄────────┘
         ▼
    [Skip Human Evaluation?]
         │
    ┌────┴────┐
  NO│         │YES
    │         ▼
    │    ┌──────────────────────┐
    │    │ generateFinalReport  │
    │    └──────────┬───────────┘
    │               │
    ▼               │
┌──────────────────┐│
│ humanEvaluator   ││ - ⏸ Interrupt for human scores
└────────┬─────────┘│
         │          │
         ▼          │
┌──────────────────────┐
│ generateFinalReport  │ - Compare evals, create report
└──────────┬───────────┘
           │◄──────────┘
           ▼
       ✓ COMPLETED
```

### Key LLM-as-a-Judge Metrics

Different copilot types have different evaluation criteria:

#### Data Model Builder

- **EntityCoverage**: Did it identify all entities?
- **AttributeCompleteness**: Are all attributes present?
- **NamingConventionAdherence**: Proper naming?
- **RelationalIntegrity**: Correct relationships?
- **NormalizationLevel**: Database best practices?
- **BusinessLogicAlignment**: Matches requirements?

#### UI Builder

- **ComponentChoiceRelevance**: Right components?
- **LayoutCoherence**: Good visual structure?
- **StyleAdherence**: Follows design system?
- **ResponsivenessCheck**: Works on different screens?

#### Actionflow Builder

- **TaskAdherence**: Follows requirements?
- **LogicalCorrectness**: Workflow logic is sound?
- **Efficiency**: Optimized steps?

#### Log Analyzer

- **Faithfulness**: Findings match logs?
- **RootCauseCorrectness**: Identified real issue?
- **SummaryCompleteness**: Covered all key points?

#### Agent Builder

- (Similar multi-dimensional metrics based on agent requirements)

---

## Project Structure

```directory
ai-agent-evaluation-system/
├── prisma/
│   ├── schema.prisma               # Prisma schema definition
│   └── migrations/                 # Database migrations
│
├── src/
│   ├── index.ts                    # App entry point (Express + Apollo setup)
│   │
│   ├── config/
│   │   ├── prisma.ts               # Prisma client initialization
│   │   ├── env.ts                  # Environment variables & LLM config
│   │   └── constants.ts            # App constants
│   │
│   ├── graphql/
│   │   ├── schema.ts               # GraphQL schema assembly
│   │   ├── resolvers/              # GraphQL resolvers
│   │   │   ├── GoldenSetResolver.ts
│   │   │   ├── SessionResolver.ts
│   │   │   ├── RubricResolver.ts
│   │   │   ├── AnalyticResolver.ts
│   │   │   └── GraphSessionResolver.ts  # HITL workflow mutations
│   │   └── type/
│   │       └── TypeDefs.ts         # GraphQL type definitions
│   │
│   ├── services/                   # Business logic layer
│   │   ├── GoldenSetService.ts
│   │   ├── ExecutionService.ts     # Copilot execution (legacy)
│   │   ├── GraphExecutionService.ts # LangGraph HITL orchestration
│   │   ├── RubricService.ts
│   │   ├── JudgeService.ts
│   │   └── AnalyticsService.ts
│   │
│   ├── langGraph/                  # LangGraph workflow implementation
│   │   ├── agent.ts                # Main evaluation graph definition
│   │   ├── index.ts                # Graph initialization & checkpointer
│   │   ├── state/
│   │   │   └── state.ts            # EvaluationState interface
│   │   ├── nodes/                  # Graph node implementations
│   │   │   ├── executeCopilot.ts   # Run copilot via WebSocket
│   │   │   ├── generateRubric.ts   # AI generates rubric
│   │   │   ├── humanReviewer.ts    # Interrupt for rubric review
│   │   │   ├── agentEvaluator.ts   # AI evaluates output
│   │   │   ├── humanEvaluator.ts   # Interrupt for human eval
│   │   │   └── generateFinalReport.ts # Compare & create report
│   │   ├── llm/
│   │   │   └── llm.ts              # LLM provider initialization
│   │   └── tools/                  # LangGraph tools
│   │       └── copilotInteraction.ts # WebSocket copilot control
│   │
│   ├── jobs/                       # Standalone job runners (legacy)
│   │   ├── EvaluationJobRunner.ts  # Kubernetes job for evaluation
│   │   └── RubricGenerationJobRunner.ts
│   │
│   └── utils/
│       ├── logger.ts               # Winston logger
│       ├── validators.ts           # Input validation
│       ├── formatters.ts           # Data formatting
│       ├── graphql-utils.ts        # GraphQL helpers
│       └── websocket.ts            # WebSocket client utilities
│
├── scripts/
│   ├── setup-db.ts                 # Database initialization
│   ├── seed-golden-set.ts          # Load test data
│   └── delete-golden-sets.ts       # Cleanup utility
│
├── tests/
│   ├── integration/                # Integration tests
│   ├── e2e/                        # End-to-end tests
│   ├── graphql.ts                  # GraphQL API tests
│   ├── langgraph-test.ts           # LangGraph workflow tests
│   └── tools-test.ts               # Tool integration tests
│
├── build/                          # Compiled JavaScript output
├── .env                            # Environment variables (git-ignored)
├── package.json
├── tsconfig.json
└── README.md
```

### Key Directories

**`src/graphql/`** - GraphQL API layer

- Schema definitions and resolvers
- Maps HTTP requests to service layer

**`src/services/`** - Business logic

- `GraphExecutionService` orchestrates LangGraph workflows
- Other services handle database operations and analytics

**`src/langGraph/`** - LangGraph workflow engine

- Complete HITL evaluation implementation
- Node-based state machine
- Checkpointing for resumable workflows

**`src/utils/`** - Shared utilities

- WebSocket client for copilot interaction
- Logger, validators, formatters
  │ └── utils/
  │ ├── logger.ts
  │ ├── validators.ts
  │ └── formatters.ts
  │
  ├── tests/
  │ ├── integration/
  │ └── e2e/
  │
  ├── scripts/
  │ ├── setup-db.ts # Database initialization
  │ └── seed-golden-set.ts # Load initial data
  │
  ├── .env.example
  ├── .eslintrc.js
  ├── .prettierrc
  ├── tsconfig.json
  ├── package.json
  └── README.md

---

## Development Phases

### Phase 1: Core Backend (Week 1-2)

- [ ] Setup Express + TypeScript project
- [ ] Initialize Prisma with PostgreSQL
- [ ] Define Prisma schema (evaluation tables + copilot table mappings)
- [ ] Create initial migration for evaluation schema
- [ ] Implement core services (GoldenSet, Execution)
- [ ] Setup Apollo Server with basic GraphQL schema
- [ ] Test reading from copilot schema tables

### Phase 2: Copilot Integration (Week 2-3)

- [ ] Map Copilot schema tables in Prisma (read-only models)
- [ ] Build CopilotDataReader service to query copilot tables
- [ ] Setup Playwright for browser automation
  - [ ] Install and configure Playwright
  - [ ] Create base automation runner
  - [ ] Implement copilot controller for Zed editor
- [ ] Setup Kubernetes Job orchestration
  - [ ] Install Kubernetes client library (@kubernetes/client-node)
  - [ ] Create Job manifest templates (YAML)
  - [ ] Implement JobCreator to submit evaluation jobs
  - [ ] Implement JobMonitor to track job status and completion
  - [ ] Configure job resource limits and retry policies
  - [ ] Create standalone job runners (Docker containers)
- [ ] Test end-to-end copilot execution flow
- [ ] Ensure zero impact on Copilot's existing tables

### Phase 3: Rubric Generation (Week 3-4)

- [ ] Setup LangChain.js with multiple LLM providers
- [ ] Build LangGraph workflow for rubric generation
  - [ ] Prompt templates for different copilot types
  - [ ] Output parser for structured rubric format
  - [ ] State management for multi-step generation
- [ ] Implement human-in-the-loop review with LangGraph
- [ ] Add retry logic and error handling

### Phase 4: Testing & Documentation (Week 4-5)

- [ ] Integration tests
- [ ] API documentation
- [ ] User guides
- [ ] Deployment documentation

---

## Environment Variables

```bash
# Server Configuration
PORT=4000
NODE_ENV=development
URL=http://localhost:4000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/evaluation_db

# Functorz Backend Integration
BACKEND_GRAPHQL_URL=https://zionbackend.functorz.work/api/graphql
FUNCTORZ_PHONE_NUMBER=your-phone
FUNCTORZ_PASSWORD=your-password

# Functorz Copilot WebSocket
WS_URL=wss://your-copilot-websocket-url/
userToken=your-user-token
projectExId=your-project-id
clientType=WEB

# LLM Provider Configuration
LLM_PROVIDER=auto  # auto, openai, or gemini

# OpenAI Configuration
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini

# Azure OpenAI (Optional - for Azure endpoints)
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=gpt-4o-mini
AZURE_OPENAI_API_VERSION=2025-04-01-preview

# Google Gemini Configuration
GOOGLE_API_KEY=AIza...
GEMINI_MODEL=gemini-2.5-pro

# LLM Generation Parameters
LLM_TEMPERATURE=0.2
LLM_MAX_OUTPUT_TOKENS=1024

# LangSmith Tracing (Optional)
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=...

# Kubernetes Jobs (Legacy - Optional)
RUN_KUBERNETES_JOBS=false
KUBERNETES_NAMESPACE=ai-evaluation
KUBERNETES_JOB_IMAGE=your-registry/evaluation-worker:latest

# Logging
LOG_LEVEL=info
```

### Configuration Notes

**LLM Provider Resolution:**

- `LLM_PROVIDER=auto` automatically selects the first available provider (OpenAI → Gemini)
- Set to `openai` or `gemini` to force a specific provider
- System prioritizes Azure OpenAI if configured (requires `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_DEPLOYMENT`, and `OPENAI_API_KEY`)

**WebSocket Configuration:**

- The `WS_URL` is constructed automatically with query parameters
- Required for copilot execution via WebSocket connection

**Kubernetes Jobs:**

- Set `RUN_KUBERNETES_JOBS=false` to use LangGraph-based execution (recommended)
- Legacy job-based execution requires K8s cluster access

---

## Performance Considerations

1. **Database Indexes**: Proper indexing on frequently queried fields

   - `evaluationSession.schemaExId`
   - `adaptiveRubric.sessionId`
   - `adaptiveRubricJudgeRecord.adaptiveRubricId`

2. **LangGraph Checkpointing**:

   - Enables workflow resumption after interrupts
   - Stored in PostgreSQL for durability
   - Minimal performance impact with proper indexing

3. **GraphQL Optimization**:

   - Field-level data loading (avoid N+1 queries)
   - Request only needed fields
   - Consider DataLoader for batch loading (future enhancement)

4. **WebSocket Connection Pooling**:

   - Reuse connections when possible
   - Implement connection timeout and retry logic

5. **LLM API Rate Limiting**:

   - Respect provider rate limits
   - Implement exponential backoff
   - Consider request queuing for high-volume scenarios

6. **Metrics Storage**:
   - JSON fields for flexibility
   - Consider extracting key metrics to dedicated columns for faster queries

---

## Testing Strategy

### Unit Tests

- GraphQL resolvers
- Service layer functions
- LangGraph node implementations
- Utility functions

### Integration Tests

- Database operations via Prisma
- LangGraph workflow execution
  - State transitions
  - Interrupt and resume behavior
  - Skip flags functionality
- LLM provider integration
- WebSocket communication

### End-to-End Tests

- Complete HITL evaluation flow
- Automated evaluation flow
- Error handling and recovery
- Performance under load

### Test Files

- `tests/graphql.ts` - GraphQL API tests
- `tests/langgraph-test.ts` - LangGraph workflow tests
- `tests/tools-test.ts` - Tool integration tests
- `tests/integration/` - Integration test suite
- `tests/e2e/` - End-to-end scenarios

---

## Deployment

### Development

```bash
npm install
npx prisma generate              # Generate Prisma Client
npx prisma migrate dev           # Run migrations
npx prisma db seed              # Seed data
npm run dev                      # Start dev server
```

### Production

```bash
npm run build
npx prisma generate
npx prisma migrate deploy        # Deploy migrations
npm start
```

### Useful Prisma Commands

```bash
npx prisma studio                # Open Prisma Studio (visual DB browser)
npx prisma db pull               # Introspect existing DB schema
npx prisma migrate reset         # Reset DB (dev only)
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

---

## Future Enhancements

1. **Real-time Updates**: WebSocket support for live dashboard updates
2. **Advanced Analytics**: ML-based anomaly detection in metrics
3. **Multi-tenancy**: Support multiple teams/organizations
4. **Rubric Templates**: Reusable rubric templates by copilot type
5. **A/B Testing**: Compare multiple models simultaneously
6. **Cost Tracking**: Detailed cost analysis per model/session
7. **Integration Tests**: Automated regression testing pipeline
8. **Feedback Loop**: Use judge results to improve rubric generation prompts

---

## Prisma Schema Example

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
  previewFeatures = ["multiSchema"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  schemas  = ["evaluation", "copilot"]
}

// ============================================
// Copilot Tables (READ-ONLY - Don't migrate)
// ============================================

model CopilotSession {
  id              BigInt   @id
  userId          String?  @map("user_id")
  totalLatency    Int?     @map("total_latency")
  roundtripCount  Int?     @map("roundtrip_count")
  inputTokens     Int?     @map("input_tokens")
  outputTokens    Int?     @map("output_tokens")
  createdAt       DateTime @map("created_at")

  @@map("sessions")
  @@schema("copilot")
}

// ============================================
// Evaluation Tables (Your migrations)
// ============================================

model GoldenSet {
  id          BigInt   @id @default(autoincrement())
  projectExId String   @map("project_ex_id")
  schemaExId  String   @map("schema_ex_id")
  copilotType String   @map("copilot_type")
  description String?
  createdAt   DateTime @default(now()) @map("created_at")
  createdBy   String?  @map("created_by")
  isActive    Boolean  @default(true) @map("is_active")

  @@unique([projectExId, schemaExId, copilotType])
  @@map("golden_set")
  @@schema("evaluation")
}

model EvaluationSession {
  id                BigInt    @id @default(autoincrement())
  schemaExId        String    @map("schema_ex_id")
  copilotType       String    @map("copilot_type")
  modelName         String    @map("model_name")
  sessionIdRef      BigInt?   @map("session_id_ref")
  startedAt         DateTime  @default(now()) @map("started_at")
  completedAt       DateTime? @map("completed_at")
  status            String    @default("running")
  totalLatencyMs    Int?      @map("total_latency_ms")
  roundtripCount    Int?      @map("roundtrip_count")
  inputTokens       Int?      @map("input_tokens")
  outputTokens      Int?      @map("output_tokens")
  contextPercentage Decimal?  @map("context_percentage") @db.Decimal(5, 2)
  metadata          Json?

  rubrics           AdaptiveRubric[]
  result            EvaluationResult?

  @@map("evaluation_session")
  @@schema("evaluation")
}

model AdaptiveRubric {
  id             BigInt    @id @default(autoincrement())
  projectExId    String    @map("project_ex_id")
  schemaExId     String    @map("schema_ex_id")
  sessionId      BigInt    @map("session_id")
  content        String
  rubricType     String?   @map("rubric_type")
  category       String?
  expectedAnswer String?   @map("expected_answer")
  reviewStatus   String    @default("pending") @map("review_status")
  isActive       Boolean   @default(true) @map("is_active")
  generatedAt    DateTime  @default(now()) @map("generated_at")
  reviewedAt     DateTime? @map("reviewed_at")
  reviewedBy     String?   @map("reviewed_by")

  session        EvaluationSession @relation(fields: [sessionId], references: [id])
  judgeRecords   JudgeRecord[]

  @@map("adaptive_rubric")
  @@schema("evaluation")
}

model JudgeRecord {
  id                BigInt   @id @default(autoincrement())
  adaptiveRubricId  BigInt   @map("adaptive_rubric_id")
  accountId         String   @map("account_id")
  result            Boolean
  confidenceScore   Int?     @map("confidence_score")
  notes             String?
  judgedAt          DateTime @default(now()) @map("judged_at")

  rubric            AdaptiveRubric @relation(fields: [adaptiveRubricId], references: [id])

  @@map("adaptive_rubric_judge_record")
  @@schema("evaluation")
}

model EvaluationResult {
  id           BigInt   @id @default(autoincrement())
  sessionId    BigInt   @unique @map("session_id")
  schemaExId   String   @map("schema_ex_id")
  metrics      Json
  overallScore Decimal  @map("overall_score") @db.Decimal(5, 2)
  createdAt    DateTime @default(now()) @map("created_at")

  session      EvaluationSession @relation(fields: [sessionId], references: [id])

  @@map("evaluation_result")
  @@schema("evaluation")
}
```

## Database Migration Strategy

### Approach

1. **Copilot tables**: Managed by Copilot team, you only read
2. **Evaluation tables**: Managed by your Prisma migrations
3. **Isolation**: Use PostgreSQL schemas (`copilot` and `evaluation`)

### Initial Setup

```bash
# 1. Introspect existing Copilot tables (to understand their schema)
npx prisma db pull

# 2. Separate Copilot models from your models in schema.prisma
#    Mark Copilot models with @@schema("copilot")
#    Mark your models with @@schema("evaluation")

# 3. Create initial migration for evaluation schema only
npx prisma migrate dev --name init

# Prisma will create evaluation tables, skip copilot tables
```

### Best Practices

- **Never modify copilot schema tables** through Prisma migrations
- Use `@@schema("copilot")` for all Copilot models
- Use `@@schema("evaluation")` for all your models
- Copilot models are for SELECT queries only
- Keep your migrations in version control
- Coordinate with Copilot team if they change table structures

## References

- [Prisma Documentation](https://www.prisma.io/docs/)
- [Prisma Multi-Schema Support](https://www.prisma.io/docs/guides/database/multi-schema)
- [GraphQL Best Practices](https://graphql.org/learn/best-practices/)
- [Apollo Server Guide](https://www.apollographql.com/docs/apollo-server/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [PostgreSQL Schema Documentation](https://www.postgresql.org/docs/current/ddl-schemas.html)
