# LangGraph Workflow Nodes

> **Scope:** src/langGraph/nodes/

Pure workflow functions implementing the HITL evaluation pipeline.

## OVERVIEW

10 active nodes wired in `agent.ts` implementing the HITL evaluation pipeline. 13 files exist; `AnalysisAgent.ts` and `Merger.ts` are present but **not wired** into the active graph.

## WHERE TO LOOK

| Node | File | Purpose | Interrupts | Active |
|------|------|---------|------------|--------|
| `inputCollector` | `InputCollector.ts` | Gathers initial context from state | No | ✅ |
| `schemaChecker` | `SchemaChecker.ts` | Determines if schema download needed | No | ✅ |
| `schemaLoader` | `SchemaLoader.ts` | Downloads schema via tool | No | ✅ |
| `questionDrafter` | `RubricDrafterAgent.ts` | Generates question set via LangChain | No | ✅ |
| `humanReviewer` | `HumanReviewer.ts` | **INTERRUPT** for human rubric review | Yes | ✅ |
| `questionInterpreter` | `RubricInterpreter.ts` | Parses approved rubric from human input | No | ✅ |
| `questionInterpreterDirect` | *(inline in agent.ts)* | Parses rubric when skipping human review | No | ✅ |
| `agentEvaluator` | `AgentEvaluator.ts` | Agent answers evaluation questions | No | ✅ |
| `humanEvaluator` | `HumanEvaluator.ts` | **INTERRUPT** for human evaluation | Yes | ✅ |
| `reportGenerator` | `ReportGenerator.ts` | Generates narrative final report | No | ✅ |
| *(unused)* | `AnalysisAgent.ts` | Analyzes requirements | No | ❌ not wired |
| *(unused)* | `Merger.ts` | Compares agent/human answers | No | ❌ commented out |

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
