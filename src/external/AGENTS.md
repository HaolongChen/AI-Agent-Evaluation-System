# Utilities Layer

> **Scope:** src/utils/ | **Updated:** 2026-03-04

Shared utilities and cross-cutting concerns used across all layers.

## WHERE TO LOOK

| File                   | Purpose                                                                                            | Used By                  |
| ---------------------- | -------------------------------------------------------------------------------------------------- | ------------------------ |
| `graphql-client.ts`    | Primary GQL client — `authState`, `localClient`, `backendClient`, `gqlRequest()`, `gqlSubscribe()` | Tests, job runners, zed/ |
| `graphql-builder.ts`   | Typed GQL documents (`GoldenSetDocuments`) + legacy string builders                                | Tests, job runners       |
| ~~`graphql-utils.ts`~~ | **Deleted** — was a deprecated shim; use `graphql-client.ts` directly                              | —                        |
| `login.ts`             | `login(phone, password)` — authenticates and returns `accessToken`                                 | Job runners, zed/        |
| `console.ts`           | Structured logging (console + caller location)                                                     | All modules              |
| `types.ts`             | Domain types: `CopilotMessage` union, `copilotType`, `SessionState`, enums                         | Services, jobs, state    |
| `graph-states.ts`      | Copilot job runtime types: `JobState`, `Task`, `JobStateType`, `RuntimeContext`                    | Job runners              |
| `validators.ts`        | Zod validators for common input fields                                                             | Services                 |
| `websocket.ts`         | `WebSocketClient` class — connect/send/receive via `ws`                                            | Job runners              |
| `formatters.ts`        | Pure formatters: `formatDuration`, `formatTokenCount`, `formatPercentage`                          | Services, jobs           |
| `zed/`                 | Zed CRDT schema, type system, and Functorz backend helpers                                         | Job runners, services    |

## GRAPHQL CLIENT (primary pattern)

```typescript
import {
  backendClient,
  localClient,
  gqlRequest,
  authState,
} from "../utils/graphql-client.ts";
import {
  GoldenSetDocuments,
  type GetGoldenSetsVariables,
} from "../utils/graphql-builder.ts";

// Authenticate first (sets 1-hour TTL token)
authState.setToken(accessToken);

// Typed request with variables
const data = await gqlRequest<GetGoldenSetsResponse, GetGoldenSetsVariables>(
  localClient, // or backendClient for Functorz backend
  GoldenSetDocuments.getGoldenSets,
  { projectExId: "proj-123" },
);
```

**Subscriptions (graphql-ws protocol):**

```typescript
import { gqlSubscribe } from "../utils/graphql-client.ts";

// Subscribe — returns an unsubscribe cleanup function
const unsubscribe = gqlSubscribe<MyEventData, MyVars>(
  MY_SUBSCRIPTION_DOCUMENT,
  { id: "123" }, // optional variables
  {
    next: (data) => console.info("event", data),
    error: (err) => console.error("sub error", err),
    complete: () => console.info("subscription ended"),
  },
);

// Stop listening:
unsubscribe();
```

**Subscription client config:** reads `SUBSCRIPTION_GRAPHQL_URL` from env (default: `wss://zionbackend.functorz.work/api/graphql-subscription`). WS connection is created lazily on first `gqlSubscribe()` call. Auth token is injected via `connectionParams` on every (re)connect.

**Clients:**

- `localClient` → our own Apollo Server (`URL/graphql`, no auth required)
- `backendClient` → Functorz backend (`BACKEND_GRAPHQL_URL`, requires Bearer token)
- `authState.setToken(token)` / `authState.clearToken()` / `authState.isValid()`

**Never** import from `graphql-utils.ts` — it has been deleted. Import from `graphql-client.ts` directly.

## GRAPHQL BUILDER

Two tiers:

1. **`GoldenSetDocuments`** — typed `gql`-tagged constants; use with `gqlRequest()` (production)
2. **`QueryBuilder` / `MutationBuilder`** — fluent string builders for ad-hoc local Apollo queries (tests only)
3. **`GoldenSetQueries`** — `@deprecated`; retained for compat, use `GoldenSetDocuments` instead

## LOGGER

```typescript
console.info("Processing evaluation", { sessionId });
console.error("Failed operation", error);
console.debug("Trace info"); // Only in development (NODE_ENV check)
```

- **Never** `console.log` — always use `console`
- Each call auto-includes `[FILE:LINE]` caller info from stack trace

## CONVENTIONS

- Pure functions only (no side effects, except console I/O and WebSocket state)
- `graph-states.ts` types are used by job runners (`EvaluationJobRunner`) for WebSocket message parsing
- `validators.ts` uses Zod — validators are named `<field>Validator` (e.g., `copilotTypeValidator`)
- `formatters.ts` — stateless; safe to import anywhere

## NOTES

- `zed/` is the heaviest subdirectory (10k+ lines in `index.ts`) — see `zed/AGENTS.md` for details
- `graphql-utils.ts` has been **deleted** (was a no-op shim with zero real callers)
- `login.ts` calls `backendClient` with typed variables — the returned token should be passed to `authState.setToken()`
