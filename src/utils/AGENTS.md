# Utilities Layer

> **Scope:** src/utils/ | **Updated:** 2026-03-02

Shared utilities and cross-cutting concerns used across all layers.

## WHERE TO LOOK

| File | Purpose | Used By |
|------|---------|---------|
| `graphql-client.ts` | Primary GQL client — `authState`, `localClient`, `backendClient`, `gqlRequest()` | Tests, job runners, zed/ |
| `graphql-builder.ts` | Typed GQL documents (`GoldenSetDocuments`) + legacy string builders | Tests, job runners |
| `graphql-utils.ts` | **@deprecated** compat shim → re-routes to `graphql-client.ts` | Legacy callers only |
| `login.ts` | `login(phone, password)` — authenticates and returns `accessToken` | Job runners, zed/ |
| `logger.ts` | Structured logging (console + caller location) | All modules |
| `types.ts` | Domain types: `CopilotMessage` union, `copilotType`, `SessionState`, enums | Services, jobs, state |
| `graph-states.ts` | Copilot job runtime types: `JobState`, `Task`, `JobStateType`, `RuntimeContext` | Job runners |
| `validators.ts` | Zod validators for common input fields | Services |
| `websocket.ts` | `WebSocketClient` class — connect/send/receive via `ws` | Job runners |
| `formatters.ts` | Pure formatters: `formatDuration`, `formatTokenCount`, `formatPercentage` | Services, jobs |
| `zed/` | Zed CRDT schema, type system, and Functorz backend helpers | Job runners, services |

## GRAPHQL CLIENT (primary pattern)

```typescript
import { backendClient, localClient, gqlRequest, authState } from '../utils/graphql-client.ts';
import { GoldenSetDocuments, type GetGoldenSetsVariables } from '../utils/graphql-builder.ts';

// Authenticate first (sets 1-hour TTL token)
authState.setToken(accessToken);

// Typed request with variables
const data = await gqlRequest<GetGoldenSetsResponse, GetGoldenSetsVariables>(
  localClient,  // or backendClient for Functorz backend
  GoldenSetDocuments.getGoldenSets,
  { projectExId: 'proj-123' },
);
```

**Clients:**
- `localClient` → our own Apollo Server (`URL/graphql`, no auth required)
- `backendClient` → Functorz backend (`BACKEND_GRAPHQL_URL`, requires Bearer token)
- `authState.setToken(token)` / `authState.clearToken()` / `authState.isValid()`

**Never** use `graphql-utils.ts` in new code — import from `graphql-client.ts` directly.

## GRAPHQL BUILDER

Two tiers:
1. **`GoldenSetDocuments`** — typed `gql`-tagged constants; use with `gqlRequest()` (production)
2. **`QueryBuilder` / `MutationBuilder`** — fluent string builders for ad-hoc local Apollo queries (tests only)
3. **`GoldenSetQueries`** — `@deprecated`; retained for compat, use `GoldenSetDocuments` instead

## LOGGER

```typescript
import { logger } from '../utils/logger.ts';

logger.info('Processing evaluation', { sessionId });
logger.error('Failed operation', error);
logger.debug('Trace info');  // Only in development (NODE_ENV check)
```

- **Never** `console.log` — always use `logger`
- Each call auto-includes `[FILE:LINE]` caller info from stack trace

## CONVENTIONS

- Pure functions only (no side effects, except logger I/O and WebSocket state)
- `graph-states.ts` types are used by job runners (`EvaluationJobRunner`) for WebSocket message parsing
- `validators.ts` uses Zod — validators are named `<field>Validator` (e.g., `copilotTypeValidator`)
- `formatters.ts` — stateless; safe to import anywhere

## NOTES

- `zed/` is the heaviest subdirectory (10k+ lines in `index.ts`) — see `zed/AGENTS.md` for details
- `graphql-utils.ts` will be removed in a future cleanup; do not add new callers
- `login.ts` calls `backendClient` with typed variables — the returned token should be passed to `authState.setToken()`
