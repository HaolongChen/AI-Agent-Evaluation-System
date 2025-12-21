# AI-Agent-Evaluation-System

## Project Overview

An evaluation framework for AI Copilot that allows rapid testing and quality assessment when new models are released. The system features a **Human-in-the-Loop (HITL)** workflow powered by LangGraph, enabling interactive evaluation with human review checkpoints. Supports multiple AI Copilot types: Data Model Builder, UI Builder, Actionflow Builder, Log Analyzer, and Agent Builder.

## Key Features

- 🔄 **HITL Workflow**: Interactive evaluation with human review at rubric generation and evaluation stages
- 🤖 **Automated Mode**: Fully automated AI-based evaluation for batch processing
- 📊 **Structured Rubrics**: AI-generated evaluation criteria with customizable weights and scoring scales
- 🔍 **Dual Evaluation**: Compare agent vs human evaluation scores with discrepancy detection
- 📈 **Analytics Dashboard**: Query metrics, compare models, track performance trends
- 🎯 **GraphQL API**: Comprehensive API for all evaluation operations

# AI Agent Evaluation System

An end-to-end evaluation framework for Copilot-style agents. It orchestrates interactive Human-in-the-Loop (HITL) workflows with LangGraph, persists structured results via Prisma/PostgreSQL, and exposes a clean GraphQL API for golden set management, evaluations, and analytics. It supports multiple copilot types: Data Model Builder, UI Builder, Actionflow Builder, Log Analyzer, and Agent Builder.

## Highlights

- HITL workflow with LangGraph interrupts for rubric review and human scoring
- Automated mode for batch runs (skip human steps) using the same graph
- Adaptive, structured rubrics with weighted criteria and scoring scales
- Dual evaluation recording (agent + human) and discrepancy tracing
- GraphQL API for sessions, rubrics, results, and analytics metrics
- Prisma-backed persistence and clean TypeScript services
- Optional Kubernetes Job runners for scalable execution

## Architecture overview

The server is Express + Apollo Server. Evaluations run through a LangGraph state machine with nodes for rubric drafting, human review, agent evaluation, human evaluation, merging, and final reporting. State and outputs are stored in PostgreSQL via Prisma.

- Entry: `src/index.ts` starts the GraphQL server at `/graphql`
- GraphQL: `src/graphql/type/TypeDefs.ts`, resolvers in `src/graphql/resolvers/*`
- Workflow: `src/langGraph/agent.ts` and nodes in `src/langGraph/nodes/*`
- State types: `src/langGraph/state/state.ts`
- Persistence and analytics: `src/services/*`
- DB schema: `prisma/schema.prisma`

Optional scale-out uses Kubernetes Jobs (`RUN_KUBERNETES_JOBS=true`) to execute rubric generation and human evaluation resume steps as jobs.

## Tech stack

- TypeScript, Node.js (ESM)
- Express + Apollo Server (GraphQL)
- LangGraph + LangChain (LLM workflows and models)
- Prisma ORM + PostgreSQL
- Optional: @kubernetes/client-node for job management

## Setup

### Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL 14+ reachable via a `DATABASE_URL`
- At least one LLM provider configured: Azure OpenAI or Google Gemini
- Functorz Copilot WebSocket access (required to boot; see env vars)

### Environment variables

The server requires several variables at startup. If any of `WS_URL`, `userToken`, or `projectExId` is missing, the process will throw on boot.

Create a `.env` (or use your secret manager) with at minimum:

- `PORT` (default 4000)
- `DATABASE_URL` (e.g., `postgresql://user:pass@localhost:5432/ai_eval`)
- `WS_URL` Base Copilot WebSocket endpoint that the server will append query parameters to. Example: `wss://zion.functorz.work/ws?` or `wss://api.functorz.com/copilot/ws?`
- `userToken` Your Functorz user session token
- `projectExId` Target project external ID
- `clientType` Optional, defaults to `WEB`

LLM provider (choose one or both):

- Azure OpenAI

  - `AZURE_OPENAI_ENDPOINT` e.g. `https://<instance>.openai.azure.com`
  - `AZURE_OPENAI_DEPLOYMENT` your deployment name
  - `AZURE_OPENAI_API_VERSION` default `2025-04-01-preview`
  - `OPENAI_API_KEY` or `AZURE_API_KEY` API key

- Google Gemini
  - `GOOGLE_API_KEY`

Other:

- `RUN_KUBERNETES_JOBS` set `true` to execute rubric/evaluation resumes via K8s Jobs
- `BACKEND_GRAPHQL_URL` Functorz backend GraphQL URL used for certain queries; defaults to `https://zionbackend.functorz.work/api/graphql`

We also include `.env.example` with placeholders you can copy.

### Install and initialize

```bash
# Install dependencies
pnpm install

# Generate Prisma client and push schema
pnpm db:generate
pnpm db:push

# (Optional) seed or manage golden sets
pnpm db:seed      # seeds example golden set
pnpm db:delete    # delete golden sets
```

### Run the server

```bash
# Live dev (nodemon + tsx)
pnpm dev

# Production build
pnpm build:bundle
pnpm start
```

Server will log: `🚀 Server ready at http://localhost:<PORT>/graphql`

## GraphQL quickstart

Endpoint: `http://localhost:4000/graphql` (or your configured `PORT`)

### Start a HITL session

```graphql
mutation Start {
  startGraphSession(
    projectExId: "proj-123"
    schemaExId: "schema-abc"
    copilotType: DATA_MODEL_BUILDER
    modelName: "gpt-4o-mini"
    skipHumanReview: false
    skipHumanEvaluation: false
  ) {
    sessionId
    threadId
    status
    rubricDraft {
      id
      version
      totalWeight
      criteria {
        id
        name
        weight
      }
    }
    message
  }
}
```

### Approve or modify the rubric

```graphql
mutation Review {
  submitRubricReview(
    sessionId: 1
    threadId: "<thread-id>"
    approved: true
    reviewerAccountId: "account-xyz"
  ) {
    status
    rubricFinal {
      id
      version
      totalWeight
    }
    message
  }
}
```

### Submit human evaluation and finish

```graphql
mutation Eval {
  submitHumanEvaluation(
    sessionId: 1
    threadId: "<thread-id>"
    overallAssessment: "Looks good"
    evaluatorAccountId: "account-xyz"
    scores: [{ criterionId: "c1", score: 0.9, reasoning: "Accurate" }]
  ) {
    status
    finalReport {
      verdict
      overallScore
      summary
      discrepancies
      auditTrace
    }
    message
  }
}
```

### Run fully automated evaluation

```graphql
mutation Auto {
  runAutomatedEvaluation(
    projectExId: "proj-123"
    schemaExId: "schema-abc"
    copilotType: DATA_MODEL_BUILDER
    modelName: "gemini-2.5-pro"
  ) {
    status
    finalReport {
      verdict
      overallScore
      summary
    }
    message
  }
}
```

### Inspect session state

```graphql
query State {
  getGraphSessionState(sessionId: 1) {
    status
    threadId
    rubricDraft {
      id
    }
    rubricFinal {
      id
    }
    agentEvaluation {
      overallScore
    }
    humanEvaluation {
      overallScore
    }
    finalReport {
      verdict
      overallScore
    }
  }
}
```

## Golden set management

- List schemas: `getGoldenSetSchemas(copilotType)`
- Upsert through service or use `updateGoldenSetProject` mutation
- Golden set structure: `description`, `promptTemplate`, `idealResponse` JSON; supports staged updates via `nextGoldenSet`

## Analytics and results

- `getEvaluationResult(sessionId)` returns the final `FinalReport`
- `compareModels(schemaExId, modelNames[])` returns aggregated metrics
- `getDashboardMetrics(...)` yields trend and pass-rate summaries

## Kubernetes job mode

Set `RUN_KUBERNETES_JOBS=true` to delegate rubric review and human evaluation resume to Kubernetes Jobs. Job runners are in `src/jobs/*` and the backend tracks completion via DB writes.

## Development scripts

- Tests and demos:

  - `pnpm test:graphql` basic GraphQL flows
  - `pnpm test:introspection` schema introspection
  - `pnpm test:lg` LangGraph workflow demo
  - `pnpm test:tools` tools demo

- Prisma:
  - `pnpm db:generate`, `pnpm db:push`, `pnpm db:migrate`, `pnpm db:studio`

## Notes

- The WS URL must be a base endpoint; the app appends `userToken`, `projectExId`, and `clientType` query parameters automatically.
- Provider resolution: if `LLM_PROVIDER=auto`, the app chooses OpenAI first if keys are present, otherwise Gemini. You can force with `LLM_PROVIDER=openai` or `LLM_PROVIDER=gemini`.
- Azure OpenAI deployment names: if you pass a base model like `gpt-4o`, the app will use your configured `AZURE_OPENAI_DEPLOYMENT`.

## Health

- Health check: `GET http://localhost:<PORT>/health`

## License

ISC
│ └─> Wait for human evaluation scores │
│ │
│ 6. generateFinalReport │
│ └─> Compare agent vs human, create report │
│ │
│ Nodes can be skipped via flags: │
│ • skipHumanReview: true │
│ • skipHumanEvaluation: true │
└───────────────────────────────────────────────┘
│
▼
┌───────────────────────────────────────────────┐
│ External Services │
│ │
│ • OpenAI API (GPT-4, GPT-4o-mini) │
│ • Google Gemini API (gemini-2.5-pro) │
│ • Functorz Copilot WebSocket │
│ • Functorz Backend GraphQL API │
└───────────────────────────────────────────────┘

````

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
````

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
