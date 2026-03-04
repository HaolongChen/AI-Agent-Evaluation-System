# Zed / Functorz Type System

> **Scope:** src/utils/zed/ | **Created:** 2026-03-02

Functorz-specific CRDT schema retrieval, Zed type system bindings, and UI component type definitions. Used by job runners that need to inspect a project's live schema.

## Files

| File | Purpose |
|------|---------|
| `TypeSystemStore.ts` | Class: downloads + rehydrates CRDT schema from Functorz backend |
| `TypeSystem.ts` | Re-exports all types/values from `@functorz/ztype` package |
| `helpers.ts` | Pure utilities: null guards, `genExtraContext()`, `fetchCustomModelParam()` |
| `AfCustomCodeTemplates.ts` | Auto-generated GQL response types for `visibleAfCustomCodeTemplates` |
| `ZSchema.ts` | Auto-generated GQL response types + `SYSTEM_MODEL_PROVIDER` constant |
| `index.ts` | **Large** (~2500+ lines): Functorz UI component attribute interfaces + action flow node types |
| `createProject.ts` | Creates a new WEB project via mutation + Apollo WS subscription; saves `projectExId` to DB |

## TypeSystemStore

Primary class for fetching and rehydrating a project's Zed schema.

```typescript
import { TypeSystemStore } from '../utils/zed/TypeSystemStore.ts';

const store = new TypeSystemStore();

// Fetch and rehydrate CRDT schema → returns OpaqueSchemaGraph
const schemaGraph = await store.rehydrate(projectExId);

// Fetch AF custom code templates (cached after first call)
const templates = await store.getAFCustomCodeTemplates();

// Fetch supported AI model descriptors (cached after first call)
const modelDescriptor = await store.getSupportedCustomModelDescriptor();
```

**Auth:** Calls `ensureAuthenticated()` before every request. Uses `authState.isValid()` to check token; if expired, calls `login(FUNCTORZ_PHONE_NUMBER, FUNCTORZ_PASSWORD)` and sets new token via `authState.setToken()`.

**`rehydrate()` steps:**
1. `fetchAppDetailByExId()` → get `crdtModelUrl` + patches
2. Fetch binary CRDT model from URL
3. `Crdt.initModel(binaryBase64, patchBase64Strings)` — apply patches
4. `model.view()` → JSON schema
5. `ZTypeSystem.parseZSchemaFromJsObject()` + `resolveZSchemaToSchemaGraph()` → `OpaqueSchemaGraph`

## TypeSystem.ts

Thin re-export barrel for `@functorz/ztype` Kotlin-compiled types. Import from here, not directly from `@functorz/ztype`.

Key re-exports:
- `ZTypeSystem` — core type system operations (`parseZSchemaFromJsObject`, `resolveZSchemaToSchemaGraph`, `parseDataBindingFromJsObject`)
- `OpaqueSchemaGraph`, `OpaqueType`, `TypeDescriptor`, `FieldDescriptor` — schema graph types
- `TypeBuilder`, `TypeMerger`, `OpaqueTypeSerializer` — type manipulation
- `Copilot` — copilot-specific operations
- `KtList`, `KtMap`, `KtSet` — Kotlin collection wrappers needed when calling Kotlin-compiled APIs

## helpers.ts — Utilities

| Export | Purpose |
|--------|---------|
| `isNotNull<T>` | Type guard: `T \| null → T` |
| `isDefined<T>` | Type guard: `T \| undefined → T` |
| `isDefinedAndNotNull<T>` | Type guard: `T \| null \| undefined → T` |
| `filterNotNullOrUndefined<T>` | Array filter removing nulls/undefineds |
| `assertNotNull<T>` | Throws if null/undefined |
| `assertUnreachable` | Exhaustive match helper |
| `getError` | Throws with attached result payload |
| `genExtraContext()` | Builds `ExtraContext` from AI model descriptors + AF templates |
| `Nullable<T>` | Type alias: `T \| null \| undefined` |
| `RequiredNonNullable<P>` | Makes all properties required + non-nullable |

## index.ts — UI Component Types

Auto-generated Functorz UI component attribute interfaces (~2500+ lines). Contains:
- Component attribute interfaces: `BlankContainerAttributes`, `ButtonAttributes`, `TextAttributes`, `InputAttributes`, `ImageAttributes`, `VideoAttributes`, etc.
- Action flow node interfaces: `BranchSeparation`, `ForEachStart`, `InsertRecord`, `QueryRecord`, `RunCustomCode`, etc.
- Enums: `BackendOnlyActionFlowNodeType`, `GeneralActionFlowNodeType`, `FrontendOnlyActionFlowNodeType`
- Event binding types, data binding types, navigation types

**Do not hand-edit** — treat as generated even though it has no `@generated` header.

## AfCustomCodeTemplates.ts / ZSchema.ts

Auto-generated (`@generated` header present). GQL response type interfaces. Do not edit.

- `AfCustomCodeTemplates_visibleAfCustomCodeTemplates` — template descriptor shape
- `SupportedCustomModelDescriptor_supportedCustomModelDescriptor` — chat/embedding model lists
- `SYSTEM_MODEL_PROVIDER` — string constant for system-provided model provider

## Notes

- Import `TypeSystem.ts` re-exports rather than `@functorz/ztype` directly
- `KtList.fromJsArray()` / `KtMap.fromJsMap()` are required when passing JS arrays/maps to Kotlin APIs
- `genExtraContext()` is the main entry point for building the context object used by Zed copilot operations

## createProject.ts

Creates a Functorz project asynchronously. Pre-flight checks the name for duplicates, fires a GQL mutation to get a `taskId`, then subscribes to `OnProjectCreationStatusChanged`. On `COMPLETED`, upserts the `project` row in the database.

```typescript
import { createProject, ProjectNameDuplicateError } from '../utils/zed/createProject.ts';

// Legacy Apollo WS path (default)
const projectExId = await createProject('My New Project');

// Modern graphql-ws path (for future use once backend supports it)
const projectExId2 = await createProject('My New Project', { useModernProtocol: true });
```

**Requires env vars:** `ORGANIZATION_EX_ID`, `SUBSCRIPTION_GRAPHQL_URL` (defaults to `wss://zionbackend.functorz.work/api/graphql-subscription`).

**Auth:** reads token from `authState.getToken()` — call `authState.setToken()` (or `login()`) before invoking.

**Flow:**
1. `CheckProjectNameDuplicate` query — throws `ProjectNameDuplicateError` if name is taken
2. `createProjectInOrganizationAsync` mutation with `platform: WEB`, `projectSpaceType: PERSONAL`, `category: OTHERS` → `taskId`
3. Subscribe to `OnProjectCreationStatusChanged(uniqueId: taskId)` — legacy Apollo WS path by default, or modern `gqlSubscribe()` path via `useModernProtocol: true`
4. Resolves on `COMPLETED`, rejects on `FAILED`, keeps waiting on `PROCESSING`

**Legacy WS protocol details:**
- Subprotocol header: `graphql-ws` (Apollo `subscriptions-transport-ws` format — NOT modern graphql-ws)
- Init payload includes `authToken`, `X-SESSION-ID` (uuid v4), `X-ZED-VERSION: "2.0.5"`
- Messages use `type: "start"` / `type: "data"` (old format)

**Named exports:**
- `createProject(projectName, opts?): Promise<string>` — main entry point
- `ProjectNameDuplicateError` — thrown when name check returns `true`
- `GQL_CHECK_PROJECT_NAME_DUPLICATE` — name-check query document (string)
- `GQL_CREATE_PROJECT_IN_ORGANIZATION` — mutation document (string)
- `GQL_ON_PROJECT_CREATION_STATUS_CHANGED` — subscription document (string)
- `PROJECT_CREATION_STATUS` — `as const` object `{ COMPLETED, FAILED, PROCESSING }`
- `ProjectCreationStatus` — union type of the above values
