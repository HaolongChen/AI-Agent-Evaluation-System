# Config Layer

> **Scope:** src/config/ | **Created:** 2026-03-02

Environment, constants, and database client. All other modules import from here — never from `process.env` directly.

## Files

| File | Exports | Purpose |
|------|---------|---------|
| `env.ts` | Named constants + `resolveLLMConfiguration()` | All env vars, LLM provider resolution |
| `constants.ts` | `COPILOT_TYPES`, `SESSION_STATUS`, `EVALUATION_STATUS`, `REVIEW_STATUS`, `EVALUATOR`, `METRIC_CATEGORIES`, `CALL_GRAPHQL` | Domain constants (as-const objects, not enums) |
| `prisma.ts` | `prisma` | Singleton `PrismaClient` instance |

## env.ts — Key Exports

**Required at startup** (throws if missing):
- `WS_URL` — Copilot WebSocket endpoint (built with `userToken`, `projectExId`, `clientType`)
- `userToken` — Functorz user token
- `projectExId` — Target project external ID

**Database:**
- `DATABASE_URL` — PostgreSQL connection string

**Backend API:**
- `BACKEND_GRAPHQL_URL` — Functorz backend GQL endpoint (default: `https://zionbackend.functorz.work/api/graphql`)
- `FUNCTORZ_PHONE_NUMBER`, `FUNCTORZ_PASSWORD` — Used by `TypeSystemStore.ensureAuthenticated()`

**LLM:**
- `LLM_PROVIDER`: `'openai' | 'gemini' | 'auto'` (default: `'auto'`)
- `OPENAI_API_KEY` / `AZURE_API_KEY`, `GEMINI_API_KEY`
- `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_DEPLOYMENT`, `AZURE_OPENAI_API_VERSION`
- `OPENAI_MODEL` (default: `gpt-4o-mini`), `GEMINI_MODEL` (default: `gemini-2.5-pro`)
- `LLM_TEMPERATURE` (default: `0.2`), `LLM_MAX_OUTPUT_TOKENS` (default: `1024`)
- `USES_AZURE_OPENAI`: boolean — true when Azure endpoint + deployment + key are all set

**Kubernetes:**
- `RUN_KUBERNETES_JOBS`: boolean
- `KUBERNETES_NAMESPACE` (default: `ai-evaluation`), `KUBERNETES_JOB_IMAGE`
- Resource limits: `CPU_REQUEST=500m`, `MEMORY_REQUEST=1Gi`, `CPU_LIMIT=2000m`, `MEMORY_LIMIT=4Gi`
- `KUBERNETES_JOB_BACKOFF_LIMIT` (default: 3), `KUBERNETES_JOB_ACTIVE_DEADLINE_SECONDS` (default: 3600)

**LLM Resolution:**
```typescript
import { resolveLLMConfiguration } from '../config/env.ts';
import type { LLMConfiguration } from '../config/env.ts';

const config: LLMConfiguration | null = resolveLLMConfiguration('openai');
// Returns first provider with a valid API key; null if none configured
// LLMConfiguration: { provider, apiKey, model, temperature, maxOutputTokens }
```

## constants.ts — Domain Constants

All exported as `as const` objects (not TypeScript enums):

| Constant | Values |
|----------|--------|
| `SESSION_STATUS` | `PENDING`, `IN_PROGRESS`, `COMPLETED`, `FAILED`, `CANCELLED` |
| `EVALUATION_STATUS` | `PENDING`, `RUNNING`, `AWAITING_REVIEW`, `AWAITING_EVALUATION`, `COMPLETED`, `FAILED` |
| `REVIEW_STATUS` | `PENDING`, `APPROVED`, `REJECTED` |
| `EVALUATOR` | `AGENT`, `HUMAN` |
| `COPILOT_TYPES` | List of valid copilot type strings |
| `METRIC_CATEGORIES` | Scoring metric category names |
| `CALL_GRAPHQL` | Internal GraphQL operation names |

## prisma.ts

```typescript
import { prisma } from '../config/prisma.ts';

// Use directly — singleton, already instantiated
const result = await prisma.goldenSet.findMany({ where: { isActive: true } });
```

Never instantiate `PrismaClient` directly elsewhere.
