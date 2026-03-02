# LangGraph HITL Workflow

> **Scope:** src/langGraph/ | **Updated:** 2026-03-02

Core evaluation workflow with Human-in-the-Loop (HITL) interrupts.

## Overview

Question-based evaluation pipeline: AI drafts questions → human reviews → agent evaluates → human validates → report generated.

## Structure

```text
langGraph/
├── agent.ts           # Graph builder, compiles workflow
├── nodes/             # 10 active workflow nodes (pure functions)
├── state/             # rubricAnnotation (LangGraph Annotation)
├── llm/               # Provider abstraction (Azure, Gemini)
└── tools/             # Schema download tool
```

## Where to Look

| Task | Location | Notes |
|------|----------|-------|
| Add workflow node | `nodes/` | Pure function, returns partial state (see nodes/AGENTS.md) |
| Modify state shape | `state/state.ts` | Use Annotation system |
| Add LLM provider | `llm/index.ts` | Implement `getLLM()` pattern |
| Change graph flow | `agent.ts` | Conditional edges, interrupts |
| Add tool | `tools/` | LangChain tool pattern |

## Workflow Flow

```text
START → inputCollector → schemaChecker → schemaLoader → questionDrafter
  → [skipHumanReview=true]  → questionInterpreterDirect → agentEvaluator
  → [skipHumanReview=false] → humanReviewer(INTERRUPT)
      → [approved]  → questionInterpreter → agentEvaluator
      → [rejected, <5 attempts] → questionDrafter (loop)
  → [skipHumanEvaluation=true]  → reportGenerator → END
  → [skipHumanEvaluation=false] → humanEvaluator(INTERRUPT) → reportGenerator → END
```

**Two interrupt points** (skippable via flags):
1. `humanReviewer` — question set approval (`skipHumanReview=true` to bypass)
2. `humanEvaluator` — evaluation validation (`skipHumanEvaluation=true` to bypass)

**Note:** `mergerNode` exists in `Merger.ts` but is **commented out** in `agent.ts`.

**Two interrupt points:**
1. `HumanReviewer` - question set approval
2. `HumanEvaluator` - evaluation validation

## Node Pattern (MANDATORY)

```typescript
export async function myNode(
  state: typeof rubricAnnotation.State,
  config?: RunnableConfig
): Promise<Partial<typeof rubricAnnotation.State>> {
  // 1. Read from state (immutable)
  const { query, context, questionSetDraft } = state;
  
  // 2. Do work (LLM calls, etc.)
  const result = await doWork(query);
  
  // 3. Return PARTIAL state update
  return {
    someField: result,
    auditTrace: [`[${timestamp}] MyNode: description`],
  };
}
```

**Rules:**
- Pure functions (no side effects except LLM calls)
- Return partial state (LangGraph merges)
- Always append to `auditTrace`
- Use `invokeWithRetry()` for LLM calls

## State Fields

| Field | Type | Purpose |
|-------|------|---------|
| `query` | string | User's evaluation request |
| `context` | string | Additional context |
| `candidateOutput` | string | Copilot output to evaluate |
| `schemaNeeded` | boolean | Whether schema download is required |
| `schema` | string | Raw downloaded schema |
| `schemaExpression` | string | Resolved schema expression |
| `questionSetDraft` | QuestionSet | AI-generated questions |
| `questionsApproved` | boolean | Human approval flag |
| `questionSetFinal` | QuestionSet | Approved questions |
| `questionDraftAttempts` | number | Redraft loop counter (max 5) |
| `evaluation` | QuestionEvaluation | Agent or merged evaluation answers |
| `finalReport` | FinalReport | Generated report |
| `analysis` | string | Analysis output (AnalysisAgent) |
| `auditTrace` | string[] | Execution log (reducer: append-only) |
| `rejectionHistory` | RejectionRecord[] | Redraft rejection reasons (reducer: append-only) |
| `humanExampleQuestions` | EvaluationQuestion[] | Optional human-provided seed questions |

## Interrupt Pattern

```typescript
import { interrupt } from "@langchain/langgraph";

// Inside node function
const humanInput = await interrupt<InputType, OutputType>({
  // Data shown to human
  questionSetDraft: state.questionSetDraft,
  message: "Please review...",
});

// humanInput contains human's response when resumed
```

**Resume via:** `GraphExecutionService.submitRubricReview()` or `submitHumanEvaluation()`

## LLM Usage

```typescript
import { getLLM, invokeWithRetry } from '../llm/index.ts';

const llm = getLLM({ provider: 'azure', model: 'gpt-4o' });
const response = await invokeWithRetry(
  () => llm.invoke([new HumanMessage(prompt)], config),
  'azure',
  { operationName: 'NodeName.invoke' }
);
```

**Providers:** `azure` (default), `gemini`

## Anti-Patterns

| Forbidden | Why | Alternative |
|-----------|-----|-------------|
| Mutate state directly | LangGraph expects immutable | Return new partial state |
| Skip auditTrace | Breaks observability | Always append trace entry |
| Direct LLM calls | No retry, no logging | Use `invokeWithRetry()` |
| Side effects in nodes | Breaks replay/testing | Move to services layer |

## Testing

```bash
pnpm test:lg  # Run LangGraph workflow tests
```

Test files: `tests/langgraph-test.ts`, `tests/hitl-flow-dry-run.ts`
