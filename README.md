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

### 1. Start a HITL Session

```graphql
mutation Start {
  startGraphSession(
    projectExId: "proj-123"
    schemaExId: "schema-abc"
    copilotType: DATA_MODEL_BUILDER
    modelName: "gpt-4o"
    skipHumanReview: false
    skipHumanEvaluation: false
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
        weight
      }
    }
    message
  }
}
```

### 2. Approve or Modify the Rubric

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
```

### 3. Submit Human Evaluation

```graphql
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

## Data Model

The system uses a structured schema to track the entire evaluation lifecycle:

- **`goldenSet`**: Stores reference queries and contexts for evaluation.
- **`evaluationSession`**: Tracks individual runs, including performance metrics (latency, tokens, reasoning tokens).
- **`adaptiveRubric`**: Stores the AI-generated or human-modified evaluation criteria.
- **`adaptiveRubricJudgeRecord`**: Records both agent and human evaluation scores.
- **`evaluationResult`**: The final report containing the verdict, summary, and audit trace.

## Development

- **Run Dev**: `pnpm dev`
- **Build**: `pnpm build:bundle`
- **Test**: `pnpm test:lg` (LangGraph), `pnpm test:graphql` (API)
- **DB Studio**: `pnpm db:studio`

## License

ISC
