# AI Agent Evaluation System

An end-to-end evaluation framework for Copilot-style agents. It orchestrates Human-in-the-Loop (HITL) workflows with LangGraph, stores structured results in PostgreSQL via Prisma, and exposes a GraphQL API for golden set management, evaluations, and analytics.

## Key Features

- **HITL Workflow**: Interactive evaluation with human review checkpoints for rubric generation and final scoring.
- **Automated Mode**: Fully automated AI-based evaluation for batch processing.
- **Structured Rubrics**: AI-generated evaluation criteria with customizable weights, scoring scales, and hard constraints.
- **Dual Evaluation**: Compare agent vs. human evaluation scores with discrepancy detection and audit logs.
- **Analytics Dashboard**: Query metrics, compare models, and track performance trends.
- **Scalable Execution**: Optional Kubernetes Job runners for handling long-running evaluation tasks.

## Architecture

- **Server**: Express + Apollo Server (GraphQL) in [src/index.ts](src/index.ts).
- **Workflow Engine**: LangGraph state machine in [src/langGraph/agent.ts](src/langGraph/agent.ts).
- **Persistence**: PostgreSQL + Prisma ([prisma/schema.prisma](prisma/schema.prisma)).
- **Business Logic**: Services in [src/services/](src/services/) (e.g., `GraphExecutionService`, `EvaluationPersistenceService`).
- **Job Runners**: Kubernetes-based runners in [src/jobs/](src/jobs/) for scalable execution.

## Tech Stack

- **Language**: TypeScript (ESM), Node.js 18+
- **API**: GraphQL (Apollo Server)
- **Workflow**: LangGraph + LangChain
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Infrastructure**: Kubernetes (optional)

## Setup

### Prerequisites

- Node.js 18+ and `pnpm`
- PostgreSQL 14+
- LLM Provider API Keys (Azure OpenAI or Google Gemini)
- Functorz Copilot WebSocket access

### Environment Variables

Create a `.env` file based on [.env.example](.env.example). Key variables include:

- `DATABASE_URL`: PostgreSQL connection string.
- `WS_URL`: Base Copilot WebSocket endpoint.
- `userToken`: Functorz user token.
- `projectExId`: Target project external ID.
- `LLM_PROVIDER`: `openai` or `gemini` (defaults to `auto`).

### Installation

```bash
pnpm install
pnpm db:generate
pnpm db:push
# Optional: Seed example golden set
pnpm db:seed
```

## GraphQL API Quickstart

### 1. Create or append a Golden Set input

```graphql
mutation UpsertGoldenSetInput {
  updateGoldenSetInput(
    projectExId: "proj-123"
    schemaExId: "schema-abc"
    copilotType: DATA_MODEL_BUILDER
    description: "login flow"
    query: "Generate a login page with email + OTP"
  ) {
    id
    projectExId
    schemaExId
    copilotType
    isActive
    userInput {
      id
      description
      content
    }
  }
}
```

### 2. Run an automated evaluation for that Golden Set

```graphql
mutation RunEval {
  execAiCopilot(
    goldenSetId: 1
    skipHumanReview: true
    skipHumanEvaluation: true
  )
}
```

### 3. (Optional) Submit rubric review and human evaluation

#### Full Replacement Approach (Deprecated)

```graphql
mutation Review {
  submitRubricReview(
    sessionId: 1
    threadId: "thread-xyz"
    approved: true
    reviewerAccountId: "user-456"
  ) {
    status
    rubricFinal {
      id
      version
    }
    message
  }
}

mutation Eval {
  submitHumanEvaluation(
    sessionId: 1
    threadId: "thread-xyz"
    overallAssessment: "The agent followed all requirements."
    evaluatorAccountId: "user-456"
    scores: [{ criterionId: "crit-1", score: 1.0, reasoning: "Perfect match." }]
  ) {
    status
    finalReport {
      verdict
      overallScore
      discrepancies
    }
    message
  }
}
```

#### Partial Update Approach (Recommended)

**Submit only modified questions** instead of the entire rubric:

```graphql
mutation ReviewWithPatches {
  submitRubricReview(
    sessionId: 1
    threadId: "thread-xyz"
    approved: false
    reviewerAccountId: "user-456"
    questionPatches: [
      {
        questionId: 123
        weight: 0.6
        title: "Correctness - Enhanced"
      }
      {
        questionId: 124
        expectedAnswer: false
      }
    ]
    feedback: "Adjusted weights based on project priorities"
  ) {
    status
    questionSetFinal {
      questions {
        id
        title
        weight
        expectedAnswer
      }
      totalWeight
    }
    message
  }
}
```

**Submit only adjusted answers** instead of all evaluation answers:

```graphql
mutation EvalWithPatches {
  submitHumanEvaluation(
    sessionId: 1
    threadId: "thread-xyz"
    overallAssessment: "Minor corrections needed"
    evaluatorAccountId: "user-456"
    answerPatches: [
      {
        questionId: 123
        answer: true
        explanation: "Nearly perfect, minor edge case"
      }
      {
        questionId: 125
        answer: false
        explanation: "Code quality needs improvement"
      }
    ]
  ) {
    status
    finalReport {
      verdict
      overallScore
      humanEvaluation {
        answers {
          questionId
          answer
          explanation
        }
        overallScore
      }
      discrepancies
    }
    message
  }
}
```

**Benefits of partial updates:**
- **Less data transfer**: Send only what changed
- **Fewer errors**: No risk of accidentally modifying unrelated fields
- **Better UX**: Clearer intent - reviewers see exactly what they're changing
- **Automatic recalculation**: System recalculates `totalWeight` and `overallScore` based on patches


## Data Model

The system uses a structured schema to track the entire evaluation lifecycle:

- **`goldenSet`**: Identified by (`projectExId`, `schemaExId`, `copilotType`); holds user-provided prompts and context through related `userInput` rows, and stores generated outputs via `copilotOutput` rows. A single `isActive` flag guards in-progress sets.
- **`userInput` / `copilotOutput`**: Child records that capture multiple inputs and outputs per golden set (each uses the golden set’s ID as its primary/foreign key).
- **`evaluationSession`**: Runs are keyed by `goldenSetId` and store performance metrics (latency, tokens, context usage) plus metadata.
- **`adaptiveRubric`**: Generated or reviewed rubric content tied to an `evaluationSession`, with criteria and weights.
- **`adaptiveRubricJudgeRecord`**: Stores agent or human scoring against a rubric.
- **`evaluationResult`**: Final report for a session (verdict, score, summary, discrepancies, audit trace).

## Development

- **Run Dev**: `pnpm dev`
- **Build**: `pnpm build:bundle`
- **Test**: 
  - `pnpm test:lg` (LangGraph workflow)
  - `pnpm test:graphql` (GraphQL API)
  - `pnpm test:partial-update` (Partial update functionality)
- **DB Studio**: `pnpm db:studio`

## License

ISC
