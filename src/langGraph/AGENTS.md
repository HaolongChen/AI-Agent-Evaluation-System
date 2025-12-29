# LangGraph HITL Workflow

> Core evaluation workflow with Human-in-the-Loop (HITL) interrupts.

## Overview

Question-based evaluation pipeline: AI drafts questions → human reviews → agent evaluates → human validates → report generated.

## Structure

```
langGraph/
├── agent.ts           # Graph builder, compiles workflow
├── nodes/             # 11 workflow nodes (pure functions)
├── state/             # rubricAnnotation (LangGraph Annotation)
├── llm/               # Provider abstraction (Azure, Gemini)
└── tools/             # Schema download tool
```

## Where to Look

| Task | Location | Notes |
|------|----------|-------|
| Add workflow node | `nodes/` | Pure function, returns partial state |
| Modify state shape | `state/state.ts` | Use Annotation system |
| Add LLM provider | `llm/index.ts` | Implement `getLLM()` pattern |
| Change graph flow | `agent.ts` | Conditional edges, interrupts |
| Add tool | `tools/` | LangChain tool pattern |

## Workflow Flow

```
START → RubricDrafter → HumanReviewer(INTERRUPT) 
      → AgentEvaluator → HumanEvaluator(INTERRUPT) 
      → Merger → ReportGenerator → END
```

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
| `questionSetDraft` | QuestionSet | AI-generated questions |
| `questionsApproved` | boolean | Human approval flag |
| `questionSetFinal` | QuestionSet | Approved questions |
| `agentEvaluation` | QuestionEvaluation | AI's answers |
| `humanEvaluation` | QuestionEvaluation | Human's answers |
| `finalReport` | FinalReport | Generated report |
| `auditTrace` | string[] | Execution log (reducer: append) |

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
