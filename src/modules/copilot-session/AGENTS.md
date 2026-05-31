# copilot-session Module (domain: copilot-output)

Executes copilot queries over WebSocket, persists captured outputs.

## DIRECTORY LAYOUT

```
domain/
  entity/          CopilotJobEntity, CopilotOutputEntity
  interface/       ICopilotOutputRepository
  schema/          copilot.schema.ts, copilot-output.schema.ts
  service/         CopilotJobService
  value-object/
  aggregate/
application/
  execution-service.ts           ExecuteCopilotUseCase (full lifecycle orchestration)
  session-orchestrator.ts        SessionOrchestrator (8 WS listeners, 2-min timeout)
  execution-job-v2.ts            WebSocket subscription lifecycle
  tool-call-handler.ts           Type-dispatched tool call handling
  crdt-schema-lifecycle.ts       CRDT schema lifecycle
  create-project.ts              Project creation/import
  get-copilot-output.ts          Output retrieval
infrastructure/
  copilot-network.ts             WS connection management, message parsing
  crdt-schema-manager.ts         CRDT schema persistence
  project-manager.ts             Project lifecycle
  zion-project-repository.ts     Zion-specific project repo
  repository/
    copilot-output.repository.ts  Prisma-backed ICopilotOutputRepository
```

## KEY ENTITIES

- **CopilotJobEntity**: WS lifecycle state (editableText, aiResponse, tasks, isFinished). `aiResponse` signals completion.
- **CopilotOutputEntity**: Persisted output (editableText, aiResponse, copilotSessionExId) tied to goldenSetId + userInputId.

## APPLICATION SERVICES

- **ExecuteCopilotUseCase**: Main use case. Fetches golden set/user input from copilot-input, creates/imports temp project, opens WS, delegates to SessionOrchestrator, persists output, deletes temp project.
- **SessionOrchestrator**: 8 event listeners (CopilotEditableTextMessage, CopilotToolCallBatchMessage, CopilotTaskMessage, CopilotTerminateMessage, CopilotStateChangeMessage, CopilotErrorMessage, CopilotToolCallBatchExecErrorMessage, CopilotInitialStateMessage). Dispatches tool calls, enforces 2-min timeout.
- **ExecutionJobV2**: GraphQL subscription setup, message publishing, connection teardown.
- **ToolCallHandler**: Type-dispatched handler for copilot tool calls.

## INFRASTRUCTURE

- **CopilotNetworkService**: Opens WS connections, parses messages, handles lifecycle.

## CROSS-MODULE DEPS

- **copilot-input**: `IGoldenSetRepository`, `IProjectLifecycle`
- **account**: WebSocket auth via Account

## CONVENTIONS

- ExecutionJobV2 owns socket lifecycle; ToolCallHandler owns dispatch; SessionOrchestrator owns event handling.
- ESM with `.ts` extensions.
- Repos throw on missing records (no null returns).
