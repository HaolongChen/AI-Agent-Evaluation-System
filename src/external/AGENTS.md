# External Utilities Layer

> **Scope:** src/external/ | **Updated:** 2026-05-09

Shared utilities and Functorz backend integration. **NOT src/utils/** - all utilities are here.

## WHERE TO LOOK

| File                   | Purpose                                                                                            | Used By                  |
| ---------------------- | -------------------------------------------------------------------------------------------------- | ------------------------ |
| `graphql-client.ts`    | Primary GQL client — `authState`, `localClient`, `backendClient`, `gqlRequest()`, `gqlSubscribe()` | Job runners, modules, zed |
| `login.ts`             | `login(phone, password)` — authenticates and returns `accessToken`                                 | Job runners, zed/        |
| `types.ts`             | Domain types: `CopilotMessage` union, `copilotType`, `SessionState`, enums                         | Services, jobs, modules |
| `schemaIdGeneration.ts`| Schema ID generation utilities                                                                     | Modules                  |
| `ali-oss.ts`           | Ali OSS integration (if needed)                                                                   | Rare                     |
| `zed/`                 | Zed CRDT schema, type system, and Functorz backend helpers                                         | Job runners, modules     |

> **Note:** `src/utils/` does not exist. All shared utilities are in `src/external/`.

## GRAPHQL CLIENT (primary pattern)

```typescript
import {
  backendClient,
  localClient,
  gqlRequest,
  authState,
} from "./graphql-client.ts";

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
import { gqlSubscribe } from "./graphql-client.ts";

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

## TYPES

Domain types in `types.ts`:
- `CopilotMessage` union type
- `copilotType` enum values
- `SessionState` enum
- Various domain enums

## CONVENTIONS

- Pure functions only (no side effects, except console I/O and WebSocket state)
- Import paths use `.ts` extension (ESM requirement)
- All utilities are in `src/external/`, not `src/utils/`

## NOTES

- `zed/` is the heaviest subdirectory (10k+ lines in `index.ts`) — see `zed/AGENTS.md` for details
- `login.ts` calls `backendClient` with typed variables — the returned token should be passed to `authState.setToken()`