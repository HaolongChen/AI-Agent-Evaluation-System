# AI-Agent-Evaluation-System

## Project Overview

An evaluation framework for AI Copilot that allows rapid testing and quality assessment when new models are released. The system enables creation of golden datasets, adaptive rubric generation, and comprehensive evaluation metrics for different AI Copilot capabilities (Data Model Builder, UI Builder, Actionflow Builder, Log Analyzer, Agent Builder).

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

- Shares the same database with AI Copilot
- Reads from existing Copilot tables (sessions, iterations, etc.)
- Creates new tables/schema for evaluation framework data
- Recommended: Use PostgreSQL schemas for logical separation:
  - `copilot` schema: Existing Copilot tables (read-only)
  - `evaluation` schema: New evaluation framework tables (read-write)

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
  - Human-in-the-loop support for rubric review
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

### High-Level Architecture

```architecture
┌─────────────────────────────────────────────────────────────────┐
│                          Client Layer                           │
│                    (GraphQL API Consumers)                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Express + Apollo Server                      │
│                      (GraphQL API Layer)                        │
│  • Queries: Get evaluations, rubrics, metrics                   │
│  • Mutations: Create jobs, review rubrics, judge results        │
└─────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
        ┌───────────────────┐   ┌──────────────────┐
        │  Service Layer    │   │ Kubernetes API   │
        │  (Business Logic) │   │     Client       │
        └───────────────────┘   └──────────────────┘
                    │                   │
                    ▼                   ▼
        ┌───────────────────┐   ┌──────────────────────────┐
        │  Prisma Client    │   │  Job Creation/Monitoring │
        │  (Database ORM)   │   │  • JobCreator            │
        └───────────────────┘   │  • JobMonitor            │
                    │           │  • manifestBuilder       │
                    ▼           └──────────────────────────┘
        ┌───────────────────┐               │
        │   PostgreSQL DB   │               ▼
        │                   │   ┌──────────────────────────┐
        │ • copilot schema  │   │   Kubernetes Cluster     │
        │   (read-only)     │   │                          │
        │ • evaluation      │   │  ┌────────────────────┐  │
        │   schema          │   │  │  Evaluation Job    │  │
        │   (read-write)    │   │  │  Pod               │  │
        └───────────────────┘   │  │                    │  │
                    ▲           │  │ • Playwright       │  │
                    │           │  │ • Copilot Control  │  │
                    │           │  │ • Metrics          │  │
                    └───────────┼──│   Collection       │  │
                                │  │ • Direct DB Write  │  │
                                │  └────────────────────┘  │
                                │                          │
                                │  ┌────────────────────┐  │
                                │  │ Rubric Generation  │  │
                                │  │ Job Pod            │  │
                                │  │                    │  │
                                │  │ • LangChain/Graph  │  │
                                │  │ • LLM API Calls    │  │
                                │  │ • Direct DB Write  │  │
                                │  └────────────────────┘  │
                                └──────────────────────────┘
```

### Key Architectural Decisions

1. **Kubernetes Jobs for Async Processing**

   - Backend submits jobs to K8s cluster via `@kubernetes/client-node`
   - Jobs run as isolated pods with resource limits
   - No message broker needed - database serves as shared state
   - Jobs write results directly to PostgreSQL

2. **Database as Communication Layer**

   - Backend creates `evaluation_session` with status = `PENDING`
   - Job updates status: `RUNNING` → `COMPLETED`/`FAILED`
   - Client polls GraphQL API to check database status
   - Simple, reliable, no distributed messaging complexity

3. **Separate Job Runners**

   - `EvaluationJobRunner.ts` - Runs Playwright automation
   - `RubricGenerationJobRunner.ts` - Runs LangChain workflows
   - Each compiled into separate Docker images
   - Submitted as K8s Jobs with different resource profiles

4. **Monitoring Strategy**
   - Optional: Backend monitors K8s API for job lifecycle
   - Primary: Jobs update database directly
   - Clients poll GraphQL for real-time status
   - K8s handles retries, timeouts, and cleanup automatically

---

## Data Model Design

### Prisma Schema

**Schema Organization:**

Prisma supports multi-schema with PostgreSQL. You'll have two schemas:

- `copilot` schema: Existing Copilot tables (read-only)
- `evaluation` schema: New evaluation framework tables (read-write)

**Complete Prisma Schema (`prisma/schema.prisma`):**

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

### Complete Evaluation Flow

```plan
1. SETUP GOLDEN SET
   ├─> Add projects/schemas to golden set
   └─> Version control golden set

2. RUN EVALUATION
   ├─> Select schema from golden set
   ├─> Choose model to test
   ├─> Execute copilot (automated UI interaction)
   ├─> Capture metrics (latency, tokens, iterations)
   └─> Store session data

3. GENERATE RUBRICS
   ├─> Read copilot output from session
   ├─> Initialize LangGraph workflow
   ├─> Use LangChain prompt template for copilot type
   ├─> Call LLM and parse response with custom parser
   ├─> Create adaptive rubrics (status: pending)
   └─> Store rubrics linked to session

4. REVIEW RUBRICS
   ├─> QA reviews generated rubrics
   ├─> Approve/reject/modify questions
   └─> Update rubric status

5. JUDGE RESULTS
   ├─> Human judges answer rubric questions
   ├─> Record judgments (yes/no + confidence)
   └─> Calculate quality metrics

6. ANALYZE & REPORT
   ├─> Aggregate metrics by model/category
   ├─> Generate comparison reports
   ├─> Display on dashboard
   └─> Export results for decision-making
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
│   ├── migrations/                 # Prisma migrations
│   └── seed.ts                     # Seed data
│
├── src/
│   ├── index.ts                    # App entry point
│   ├── server.ts                   # Express + Apollo Server setup
│   │
│   ├── config/
│   │   ├── prisma.ts               # Prisma client initialization
│   │   ├── env.ts                  # Environment variables
│   │   └── constants.ts            # App constants
│   │
│   ├── graphql/
│   │   ├── schema.ts               # TypeGraphQL schema
│   │   ├── resolvers/              # GraphQL resolvers
│   │   │   ├── GoldenSetResolver.ts
│   │   │   ├── SessionResolver.ts
│   │   │   ├── RubricResolver.ts
│   │   │   └── AnalyticsResolver.ts
│   │   └── types/                  # GraphQL type definitions
│   │
│   ├── services/                   # Business logic
│   │   ├── GoldenSetService.ts
│   │   ├── ExecutionService.ts     # Copilot execution
│   │   ├── RubricGenerationService.ts
│   │   ├── JudgeService.ts
│   │   └── AnalyticsService.ts
│   │
│   ├── integrations/               # External integrations
│   │   ├── CopilotAPIClient.ts     # Interface with copilot API (if exists)
│   │   ├── CopilotDataReader.ts    # Read copilot schema tables via Prisma
│   │   └── LangChainClient.ts      # LangChain/LangGraph for LLM operations
│   │
│   ├── automation/                 # Playwright automation
│   │   ├── PlaywrightRunner.ts     # Main automation runner
│   │   ├── CopilotController.ts    # Control copilot in Zed editor
│   │   ├── MetricsCollector.ts     # Collect metrics from copilot
│   │   └── SchemaLoader.ts         # Load schemas from golden set
│   │
│   ├── jobs/                       # Kubernetes Job runners
│   │   ├── EvaluationJobRunner.ts  # Standalone evaluation job
│   │   └── RubricGenerationJobRunner.ts  # Standalone rubric generation job
│   │
│   ├── kubernetes/                 # Kubernetes client and job management
│   │   ├── k8sClient.ts            # Kubernetes API client initialization
│   │   ├── JobCreator.ts           # Create and submit jobs to K8s API
│   │   ├── JobMonitor.ts           # Monitor job status and lifecycle
│   │   ├── templates/              # Job manifest templates
│   │   │   ├── evaluation-job.yaml # Evaluation job template
│   │   │   └── rubric-job.yaml     # Rubric generation job template
│   │   └── utils/                  # K8s utility functions
│   │       ├── manifestBuilder.ts  # Build job manifests from templates
│   │       └── jobStatusParser.ts  # Parse K8s job status
│   │
│   ├── langchain/                  # LangChain configurations
│   │   ├── chains/                 # LangChain chains
│   │   │   └── RubricGenerationChain.ts
│   │   ├── graphs/                 # LangGraph workflows
│   │   │   └── RubricReviewGraph.ts
│   │   ├── prompts/                # Prompt templates
│   │   │   ├── dataModelRubric.ts
│   │   │   ├── uiBuilderRubric.ts
│   │   │   └── actionflowRubric.ts
│   │   └── parsers/                # Output parsers
│   │       └── RubricParser.ts
│   │
│   └── utils/
│       ├── logger.ts
│       ├── validators.ts
│       └── formatters.ts
│
├── tests/
│   ├── integration/
│   └── e2e/
│
├── scripts/
│   ├── setup-db.ts                 # Database initialization
│   └── seed-golden-set.ts          # Load initial data
│
├── .env.example
├── .eslintrc.js
├── .prettierrc
├── tsconfig.json
├── package.json
└── README.md
```

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
# Database (Single database, shared with Copilot)
DATABASE_URL=postgresql://user:password@localhost:5432/copilot_db?schema=evaluation
# Or without schema in URL, set in Prisma schema file
# DATABASE_URL=postgresql://user:password@localhost:5432/copilot_db

# Server
PORT=4000
NODE_ENV=development

# LLM API (for rubric generation via LangChain)
AZURE_API_KEY=sk-openai...
GOOGLE_API_KEY=AIza...
LANGCHAIN_TRACING_V2=true  # Optional: Enable LangSmith tracing
LANGCHAIN_API_KEY=...      # Optional: For LangSmith

# LLM Configuration
LLM_PROVIDER=auto          # auto, openai, or gemini
OPENAI_MODEL=gpt-4o-mini
GEMINI_MODEL=gemini-1.5-flash
LLM_TEMPERATURE=0.2
LLM_MAX_OUTPUT_TOKENS=1024

# Copilot Integration
COPILOT_API_URL=http://localhost:3000/api
COPILOT_API_KEY=...

# Kubernetes (for job orchestration)
KUBERNETES_NAMESPACE=ai-evaluation
KUBERNETES_JOB_IMAGE=your-registry/evaluation-worker:latest
KUBERNETES_JOB_CPU_REQUEST=500m
KUBERNETES_JOB_MEMORY_REQUEST=1Gi
KUBERNETES_JOB_CPU_LIMIT=2000m
KUBERNETES_JOB_MEMORY_LIMIT=4Gi
KUBERNETES_JOB_BACKOFF_LIMIT=3  # Retry count
KUBERNETES_JOB_ACTIVE_DEADLINE_SECONDS=3600  # 1 hour timeout

# Authentication (if needed)
JWT_SECRET=...

# Logging
LOG_LEVEL=info
```

---

## Security Considerations

1. **API Authentication**: Use JWT or API keys for GraphQL/REST endpoints
2. **Database Access**: Read-only access to copilot schema, read-write to evaluation schema
3. **LLM API Keys**: Store securely, rotate regularly
4. **Input Validation**: Sanitize all user inputs
5. **Rate Limiting**: Prevent abuse of expensive LLM operations
6. **Audit Logging**: Track who made what judgments

---

## Performance Considerations

1. **Database Indexes**: Index on frequently queried fields (schema_ex_id, session_id)
2. **Caching**: Cache golden set schemas, rubrics in Redis (optional)
3. **Async Processing**: Use Kubernetes Jobs for long-running copilot evaluations
   - Parallel job execution with horizontal scaling
   - Configurable resource requests and limits per job
   - Built-in retry logic with backoffLimit
   - Active deadline for job timeout (prevents hung jobs)
   - Job completion tracking and cleanup
   - Isolated execution environment per evaluation
4. **Pagination**: Paginate large result sets in GraphQL
5. **Connection Pooling**: Efficient DB connection management
6. **Metrics Storage**: Use JSONB efficiently, consider time-series DB for trends

---

## Testing Strategy

### Integration Tests

- GraphQL resolvers
- Database operations
- LangChain/LangGraph workflows
  - Rubric generation chain
  - Review graph with human-in-the-loop
  - Prompt template variations
- Kubernetes Job orchestration
  - Job creation and submission
  - Job status monitoring and completion tracking
  - Job retry behavior and failure handling
  - Resource limit enforcement
- Service layer functions

### End-to-End Tests

- Complete evaluation flow (with Playwright)
- Copilot automation scenarios
- Kubernetes Job execution and monitoring

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
