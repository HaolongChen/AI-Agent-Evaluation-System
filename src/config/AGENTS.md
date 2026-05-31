# Config Layer

**Scope:** `src/config/` | **Updated:** 2026-05-31

Environment, constants, and PrismaClient singleton. All modules import from here — never `process.env` directly.

⚠️ **`env.ts` and `constants.ts` are aspirational — they do NOT exist on disk.** Only `prisma.ts` exists. 18+ `process.env` accesses across 9+ files bypass this layer.

## Files

| File           | Exports                                      | Purpose                            | Status          |
| -------------- | -------------------------------------------- | ---------------------------------- | --------------- |
| `env.ts`       | Named constants, `resolveLLMConfiguration()` | Env vars, LLM provider resolution  | ❌ Aspirational |
| `constants.ts` | Domain constant objects                      | `as const` domain objects          | ❌ Aspirational |
| `prisma.ts`    | `prisma` singleton                           | PrismaClient with PrismaPg adapter | ✅ Exists       |

## env.ts (Reference — Not Created)

**Required:** `WS_URL`, `userToken`, `projectExId`, `DATABASE_URL`
**Backend:** `BACKEND_GRAPHQL_URL` (default `https://zionbackend.functorz.work/api/graphql`), `FUNCTORZ_PHONE_NUMBER`, `FUNCTORZ_PASSWORD`, `DANGEROUS_USERNAME`, `DANGEROUS_PASSWORD`
**LLM:** `LLM_PROVIDER` (openai\|gemini\|auto), `OPENAI_API_KEY`, `GEMINI_API_KEY`, `AZURE_OPENAI_ENDPOINT` + `DEPLOYMENT` + `API_VERSION`, `OPENAI_MODEL` (default `gpt-4o-mini`), `GEMINI_MODEL` (default `gemini-2.5-pro`), `LLM_TEMPERATURE` (default `0.2`), `LLM_MAX_OUTPUT_TOKENS` (default `1024`), `USES_AZURE_OPENAI`
**K8s:** `RUN_KUBERNETES_JOBS`, `KUBERNETES_NAMESPACE`, `KUBERNETES_JOB_IMAGE`, CPU/MEM requests+limits

`resolveLLMConfiguration(provider)` scans providers for a valid API key.

## constants.ts (Reference — Not Created)

`as const` objects: `SESSION_STATUS`, `EVALUATION_STATUS`, `REVIEW_STATUS`, `EVALUATOR`, `COPILOT_TYPES`, `METRIC_CATEGORIES`, `CALL_GRAPHQL`

## prisma.ts ✅

```typescript
import { prisma } from "../config/prisma.ts";
```

Never instantiate `PrismaClient` directly elsewhere.
