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
- **ts-node** - TypeScript execution for development
- **ESLint + Prettier** - Code quality and formatting

---

## Data Model Design

### Database Schema

**Schema Organization:**

```sql
-- Create separate schemas for logical separation
CREATE SCHEMA IF NOT EXISTS evaluation;
CREATE SCHEMA IF NOT EXISTS copilot; -- Copilot team manages this

-- Set search path
SET search_path TO evaluation, copilot, public;
```

**Evaluation Framework Tables (in `evaluation` schema):**

```sql
-- Golden Set Management
CREATE TABLE evaluation.golden_set (
    id BIGSERIAL PRIMARY KEY,
    project_ex_id TEXT NOT NULL,
    schema_ex_id TEXT NOT NULL,
    copilot_type VARCHAR(50) NOT NULL, -- 'data_model', 'ui_builder', 'actionflow', 'log_analyzer', 'agent_builder'
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    created_by TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(project_ex_id, schema_ex_id, copilot_type)
);

-- Execution Sessions (references copilot schema tables)
CREATE TABLE evaluation.evaluation_session (
    id BIGSERIAL PRIMARY KEY,
    schema_ex_id TEXT NOT NULL,
    copilot_type VARCHAR(50) NOT NULL,
    model_name VARCHAR(100) NOT NULL, -- e.g., 'gpt-4', 'claude-3-opus', etc.
    session_id_ref BIGINT, -- Reference to actual copilot session
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'running', -- 'running', 'completed', 'failed'

    -- Performance Metrics
    total_latency_ms INTEGER,
    roundtrip_count INTEGER,
    input_tokens INTEGER,
    output_tokens INTEGER,
    context_percentage DECIMAL(5,2), -- % of max context window used

    -- Metadata
    metadata JSONB
);

-- Adaptive Rubrics (AI-generated evaluation questions)
CREATE TABLE evaluation.adaptive_rubric (
    id BIGSERIAL PRIMARY KEY,
    project_ex_id TEXT NOT NULL,
    schema_ex_id TEXT NOT NULL,
    session_id BIGINT REFERENCES evaluation_session(id),

    -- Rubric Content
    content TEXT NOT NULL, -- The actual question/rubric
    rubric_type VARCHAR(50), -- e.g., 'completeness', 'correctness', 'naming_convention'
    category VARCHAR(50), -- e.g., 'entity_coverage', 'attribute_completeness'
    expected_answer VARCHAR(10), -- 'yes' or 'no'

    -- Status
    review_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'modified'
    is_active BOOLEAN DEFAULT TRUE,

    -- Timestamps
    generated_at TIMESTAMP DEFAULT NOW(),
    reviewed_at TIMESTAMP,
    reviewed_by TEXT
);

-- Rubric Judgments (human reviews)
CREATE TABLE evaluation.adaptive_rubric_judge_record (
    id BIGSERIAL PRIMARY KEY,
    adaptive_rubric_id BIGINT REFERENCES adaptive_rubric(id),
    account_id TEXT NOT NULL,
    result BOOLEAN NOT NULL, -- true = pass, false = fail
    confidence_score INTEGER, -- 1-5 scale
    notes TEXT,
    judged_at TIMESTAMP DEFAULT NOW()
);

-- Evaluation Results Summary (aggregated metrics)
CREATE TABLE evaluation.evaluation_result (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT REFERENCES evaluation_session(id),
    schema_ex_id TEXT NOT NULL,

    -- Quality Metrics (specific to copilot type)
    metrics JSONB NOT NULL, -- Flexible storage for different metric types

    -- Examples:
    -- Data Model Builder: {
    --   "entity_coverage": 0.95,
    --   "attribute_completeness": 0.87,
    --   "naming_convention_adherence": 0.92,
    --   "relational_integrity": 0.88,
    --   "normalization_level": 0.85
    -- }
    -- UI Builder: {
    --   "component_choice_relevance": 0.91,
    --   "layout_coherence": 0.89,
    --   "style_adherence": 0.94,
    --   "responsiveness_check": 0.86
    -- }
    -- Actionflow Builder: {
    --   "task_adherence": 0.93,
    --   "logical_correctness": 0.90,
    --   "efficiency": 0.85
    -- }

    -- Overall Score
    overall_score DECIMAL(5,2),

    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_golden_set_schema ON evaluation.golden_set(schema_ex_id);
CREATE INDEX idx_evaluation_session_schema ON evaluation.evaluation_session(schema_ex_id);
CREATE INDEX idx_adaptive_rubric_session ON evaluation.adaptive_rubric(session_id);
CREATE INDEX idx_rubric_judge_rubric ON evaluation.adaptive_rubric_judge_record(adaptive_rubric_id);
```

**Reading Copilot Tables (in `copilot` schema - read-only):**

```sql
-- Example: Copilot's existing tables (you only read from these)
-- copilot.sessions
-- copilot.iterations
-- copilot.ai_responses
-- copilot.user_actions
-- (Exact schema depends on Copilot's implementation)

-- Your app reads but never writes to copilot schema
```

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
```

### REST API Endpoints (Express.js)

For operations that don't fit GraphQL well:

```typescript
// Health & Status
GET  /api/health
GET  /api/status

// CLI Support (simpler than GraphQL for automation)
POST /api/cli/run-evaluation
  Body: {
    schemaExId: string,
    copilotType: string,
    modelName: string
  }

GET  /api/cli/export-results/:sessionId
  Returns: JSON or CSV export

// Webhook endpoints (if copilot needs to notify completion)
POST /api/webhook/session-complete
  Body: { sessionId: number, status: string }
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

---

## System Workflow

### Complete Evaluation Flow

```
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

## CLI Tool

For automation and CI/CD integration:

```bash
# Run evaluation
npm run eval -- --schema <schema_id> --type <copilot_type> --model <model_name>

# Generate rubrics
npm run rubrics:gen -- --session <session_id>

# Export results
npm run export -- --session <session_id> --format csv

# Batch evaluation (run all golden set schemas)
npm run eval:batch -- --type data_model --model gpt-4

# Check status
npm run status -- --session <session_id>
```

---

## Project Structure

```
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
│   ├── api/                        # REST endpoints
│   │   ├── routes.ts
│   │   └── controllers/
│   │
│   ├── cli/                        # CLI tool
│   │   ├── index.ts
│   │   └── commands/
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
- [ ] Implement copilot API client (if API exists)
- [ ] Create execution automation (UI automation)
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

### Phase 4: CLI & Automation (Week 4-5)

- [ ] Build CLI tool
- [ ] Add batch processing
- [ ] Create export utilities
- [ ] Setup CI/CD integration examples

### Phase 5: Testing & Documentation (Week 5-6)

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
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
LANGCHAIN_TRACING_V2=true  # Optional: Enable LangSmith tracing
LANGCHAIN_API_KEY=...      # Optional: For LangSmith

# LLM Configuration
LLM_PROVIDER=openai  # or anthropic
LLM_MODEL=gpt-4      # or claude-3-opus-20240229
LLM_TEMPERATURE=0.7
LLM_MAX_TOKENS=2000

# Copilot Integration
COPILOT_API_URL=http://localhost:3000/api
COPILOT_API_KEY=...

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
2. **Caching**: Cache golden set schemas, rubrics in Redis
3. **Async Processing**: Use job queue (Bull/BullMQ) for long-running evaluations
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
- Service layer functions

### End-to-End Tests

- Complete evaluation flow
- Dashboard user journeys
- CLI commands

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
