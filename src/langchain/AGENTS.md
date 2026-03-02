# LangChain Rubric Generation

> **Scope:** src/langchain/ | **Created:** 2026-03-02

LangChain chain for AI-driven adaptive rubric generation. Used by `questionDrafter` node as an alternative to the direct LLM approach in LangGraph.

## Files

| File | Exports | Purpose |
|------|---------|---------|
| `chains/copilotRubricChain.ts` | `generateAdaptiveRubric()` | Multi-provider chain with structured output |
| `parsers/rubricParser.ts` | `rubricParser`, `rubricSchema` | StructuredOutputParser with Zod schema |
| `prompts/copilotRubricPrompt.ts` | `copilotRubricPrompt` | ChatPromptTemplate (system + human messages) |

## Primary Entry Point

```typescript
import { generateAdaptiveRubric } from '../langchain/chains/copilotRubricChain.ts';
import type { CopilotRubricInput, RubricGenerationResult } from '../langchain/chains/copilotRubricChain.ts';

const result: RubricGenerationResult = await generateAdaptiveRubric({
  copilotType: 'DATA_MODEL_BUILDER',
  query: 'Generate a login page',
  context: 'React app with Tailwind',
  candidateOutput: '...copilot response...',
});
// result.questions: EvaluationQuestion[]
// result.totalWeight: number
```

## Chain Architecture

`generateAdaptiveRubric()` → resolves provider → builds chain → invokes with retry

**Multi-provider fallback order:**
1. Uses `resolveLLMConfiguration()` from `config/env.ts`
2. Prefers `LLM_PROVIDER` env var; falls back through `['openai', 'gemini']`
3. Throws if no provider is configured

**Output parsing:** `rubricParser` (StructuredOutputParser) enforces Zod schema — 3–8 questions, weights summing to 1.0, boolean `expectedAnswer`.

## Rubric Schema Constraints (rubricParser.ts)

- `questions`: array, 3–8 items
- Each question: `id` (number), `title` (string), `description` (string), `weight` (number, 0–1), `expectedAnswer` (boolean), `scoringCriteria` (string)
- `totalWeight`: must equal 1.0

## Prompt Structure (copilotRubricPrompt.ts)

- System message: role definition, rubric format instructions, output format from parser
- Human message: `{copilotType}`, `{query}`, `{context}`, `{candidateOutput}` placeholders

## Notes

- Uses `invokeWithRetry()` pattern internally (wraps LangChain chain invocation)
- Do not call `copilotRubricPrompt` or `rubricParser` directly — use `generateAdaptiveRubric()`
- This chain is **not** used by the default LangGraph nodes path; it's an alternative entrypoint
