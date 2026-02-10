# LangGraph Workflow Nodes

> **Scope:** src/langGraph/nodes/

Pure workflow functions implementing the HITL evaluation pipeline.

## OVERVIEW

12 pure functions forming the question-based evaluation workflow: draft → review → evaluate → merge → report.

## WHERE TO LOOK

| Node | Purpose | Interrupts |
|------|---------|------------|
| `InputCollector.ts` | Gathers initial context | No |
| `SchemaChecker.ts` | Validates schema needs via LLM | No |
| `SchemaLoader.ts` | Downloads schema via tool | No |
| `AnalysisAgent.ts` | Analyzes requirements | No |
| `RubricDrafterAgent.ts` | Generates question set | No |
| `RubricInterpreter.ts` | Parses LLM output | No |
| `HumanReviewer.ts` | **INTERRUPT** for human review | Yes |
| `AgentEvaluator.ts` | Agent answers questions | No |
| `HumanEvaluator.ts` | **INTERRUPT** for human eval | Yes |
| `Merger.ts` | Compares agent/human answers | No |
| `ReportGenerator.ts` | Generates narrative report | No |

## NODE PATTERN (MANDATORY)

```typescript
export async function myNode(
  state: typeof rubricAnnotation.State,
  config?: RunnableConfig
): Promise<Partial<typeof rubricAnnotation.State>> {
  // 1. Read state immutably
  const { query, context } = state;
  
  // 2. Do work (LLM via invokeWithRetry)
  const llm = getLLM({ provider: 'azure', model: 'gpt-4o' });
  const result = await invokeWithRetry(
    () => llm.invoke([new HumanMessage(prompt)], config),
    'azure',
    { operationName: 'MyNode.invoke' }
  );
  
  // 3. Return partial state + auditTrace
  return {
    someField: result,
    auditTrace: [`[${timestamp}] MyNode: what happened`],
  };
}
```

## RULES

- **Pure functions**: No side effects except LLM calls
- **Return partial state**: LangGraph merges automatically
- **auditTrace**: Always append (never replace)
- **LLM calls**: Use `invokeWithRetry()` (centralized retry + logging)
- **DB writes**: Never — delegate to services layer
- **Interrupts**: Use `interrupt<Input, Output>()` for human checkpoints

## ANTI-PATTERNS

| Forbidden | Why | Fix |
|-----------|-----|-----|
| Mutate state in-place | Breaks LangGraph merge | Return new partial state |
| Skip auditTrace | Breaks observability | Always append |
| Direct LLM calls | No retry/logging | Use `invokeWithRetry()` |
| DB writes in nodes | Side effects violate purity | Call services from orchestration layer |
| Multiple responsibilities | Hard to test/maintain | Split into focused nodes |
