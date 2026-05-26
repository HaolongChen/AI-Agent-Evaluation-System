# Config Layer

> **Scope:** src/config/ | **Updated:** 2026-05-26

⚠️ **NOTE:** `env.ts` and `constants.ts` are documented below but do **NOT** exist on disk. Only `prisma.ts` exists. This doc serves as a reference for expected env vars and domain constants.

Environment, constants, and database client. All other modules import from here — never from `process.env` directly.

## Files

| File           | Exports                                                   | Purpose                             | Status         |
| -------------- | --------------------------------------------------------- | ----------------------------------- | -------------- |
| `env.ts`       | Named constants + `resolveLLMConfiguration()`             | Env vars, LLM provider resolution   | ❌ Not created |
| `constants.ts` | Domain constant objects (`COPILOT_TYPES`, statuses, etc.) | Domain constants (as-const objects) | ❌ Not created |
| `prisma.ts`    | `prisma`                                                  | Singleton `PrismaClient` instance   | ✅ Exists      |

## env.ts — Key Exports (Reference)

**Required startup** (throws if missing): `WS_URL`, `userToken`, `projectExId`
**Database:** `DATABASE_URL`
**Backend API:** `BACKEND_GRAPHQL_URL` (default: `https://zionbackend.functorz.work/api/graphql`), `FUNCTORZ_PHONE_NUMBER`, `FUNCTORZ_PASSWORD`, `DANGEROUS_USERNAME`, `DANGEROUS_PASSWORD`
**LLM:** `LLM_PROVIDER` (`openai` | `gemini` | `auto`), `OPENAI_API_KEY` / `AZURE_API_KEY`, `GEMINI_API_KEY`, `AZURE_OPENAI_ENDPOINT` + `DEPLOYMENT` + `API_VERSION`, `OPENAI_MODEL` (default: `gpt-4o-mini`), `GEMINI_MODEL` (default: `gemini-2.5-pro`), `LLM_TEMPERATURE` (default: `0.2`), `LLM_MAX_OUTPUT_TOKENS` (default: `1024`), `USES_AZURE_OPENAI`
**Kubernetes:** `RUN_KUBERNETES_JOBS`, `KUBERNETES_NAMESPACE` (default: `ai-evaluation`), `KUBERNETES_JOB_IMAGE`, CPU/MEM requests+limits, backoff/deadline config

**LLM Resolution:**

```typescript
import { resolveLLMConfiguration } from "../config/env.ts"; // when env.ts is created
import type { LLMConfiguration } from "../config/env.ts";
const config: LLMConfiguration | null = resolveLLMConfiguration("openai");
// Returns first provider with valid API key; null if none configured
```

## constants.ts — Domain Constants (Reference)

All `as const` objects (not enums): `SESSION_STATUS` (PENDING\|IN_PROGRESS\|COMPLETED\|FAILED\|CANCELLED), `EVALUATION_STATUS` (PENDING\|RUNNING\|AWAITING_REVIEW\|AWAITING_EVALUATION\|COMPLETED\|FAILED), `REVIEW_STATUS` (PENDING\|APPROVED\|REJECTED), `EVALUATOR` (AGENT\|HUMAN), `COPILOT_TYPES`, `METRIC_CATEGORIES`, `CALL_GRAPHQL`

## prisma.ts ✅

```typescript
import { prisma } from "../config/prisma.ts";
const result = await prisma.goldenSet.findMany({ where: { isActive: true } });
```

Never instantiate `PrismaClient` directly elsewhere.
