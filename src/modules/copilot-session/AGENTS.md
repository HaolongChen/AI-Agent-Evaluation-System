# copilot-output Module

## OVERVIEW

Executes copilot queries over WebSocket and persists captured outputs.

## STRUCTURE

```
domain/
  entity/          CopilotJobEntity, CopilotOutputEntity
  interface/       ICopilotOutputRepository
  schema/          copilot.schema.ts, copilot-output.schema.ts
  service/         CopilotJobService (domain logic for job state)
  value-object/    Value objects for job state
application/
  execution-service.ts       ExecuteCopilotUseCase (orchestrates full job lifecycle)
  session-orchestrator.ts    SessionOrchestrator (WS event dispatching, 8 listeners)
  execution-job-v2.ts        ExecutionJobV2 (WebSocket subscription lifecycle)
  tool-call-handler.ts       ToolCallHandler (dispatches copilot tool calls)
infrastructure/
  copilot-network.ts         WebSocket connection management, message parsing
  repository/
    copilot-output.repository.ts  Prisma-backed ICopilotOutputRepository
```

## ENTITIES

- **CopilotJobEntity**: Owns WebSocket lifecycle state (editableText, aiResponse, tasks, isFinished). Created per execution run. `aiResponse` signals job completion (replaces legacy `isTerminated`).
- **CopilotOutputEntity**: Persisted record of copilot output (editableText, aiResponse, copilotSessionExId) tied to a goldenSetId + userInputId pair.

## DOMAIN SERVICES

- **CopilotJobService**: Domain logic for copilot job state management.

## APPLICATION USE CASES

- **ExecuteCopilotUseCase**: Main use case. Fetches golden set/user input from copilot-input, creates/imports a temp project via `IProjectLifecycle` (from copilot-input), opens WebSocket, delegates event handling to `SessionOrchestrator`, persists output, deletes temp project.
- **SessionOrchestrator**: Encapsulates WebSocket event handling for a session. Registers 8 event listeners (CopilotEditableTextMessage, CopilotToolCallBatchMessage, CopilotTaskMessage, CopilotTerminateMessage, CopilotStateChangeMessage, CopilotErrorMessage, CopilotToolCallBatchExecErrorMessage, CopilotInitialStateMessage), dispatches tool calls via `ToolCallHandler`, and enforces a 2-minute timeout. Extracted from `ExecutionJobV2` to reduce complexity.
- **ExecutionJobV2**: WebSocket subscription lifecycle. Manages GraphQL subscription setup, message publishing/sending, and connection teardown. Owns the event-target machinery.
- **ToolCallHandler**: Type-dispatched handler for copilot tool calls during execution.

## INFRASTRUCTURE

**CopilotNetwork** — WebSocket connection management: opens connections, parses incoming messages, handles connection lifecycle. Contains TODO for session tracking (line 315).

## CROSS-MODULE DEPENDENCY

Depends on **copilot-input**: uses `IGoldenSetRepository.getCopilotInputByGoldenSetIdAndUserInputId()` and `IProjectLifecycle` (createTemporaryProject, importExistingProject, deleteTemporaryProject) to orchestrate execution.
Depends on **account**: uses Account for WebSocket authentication.

## CONVENTIONS

- WebSocket job entities extend Entity for data consistency.
- ExecutionJobV2 owns socket subscription lifecycle; ToolCallHandler owns message dispatch; SessionOrchestrator owns event handling logic.
- `.ts` extensions required in imports (ESM).
- All repository methods throw on missing records (no null returns for singular lookups).
