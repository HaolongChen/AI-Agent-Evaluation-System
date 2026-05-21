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
  execution-service.ts     ExecuteCopilotUseCase (orchestrates full job lifecycle)
  execution-job-v2.ts      ExecutionJobV2 (WebSocket job orchestration v2)
  tool-call-handler.ts     ToolCallHandler (dispatches copilot tool calls)
  get-by-id.ts             GetCopilotOutputByIdUseCase
  get-by-copilot-input.ts  GetCopilotOutputsByCopilotInputUseCase
infrastructure/
  copilot-network.ts       WebSocket connection management, message parsing
  repository/
    copilot-output.repository.ts  Prisma-backed ICopilotOutputRepository
```

## ENTITIES

- **CopilotJobEntity**: Owns WebSocket lifecycle state (editableText, tasks, isTerminated). Created per execution run.
- **CopilotOutputEntity**: Persisted record of copilot output content tied to a goldenSetId + userInputId pair.

## DOMAIN SERVICES

- **CopilotJobService**: Domain logic for copilot job state management.

## APPLICATION USE CASES

- **ExecuteCopilotUseCase**: Main use case. Fetches golden set/user input from copilot-input, creates temp project via projectService, opens WebSocket, sends user query, waits for editableText, persists output, deletes temp project.
- **ExecutionJobV2**: WebSocket job orchestration (v2). Manages connection lifecycle, message handling, and output capture.
- **ToolCallHandler**: Type-dispatched handler for copilot tool calls during execution.
- **GetCopilotOutputByIdUseCase**: Retrieve single output by ID.
- **GetCopilotOutputsByCopilotInputUseCase**: Retrieve all outputs for a golden set + user input pair.

## INFRASTRUCTURE

**CopilotNetwork** — WebSocket connection management: opens connections, parses incoming messages, handles connection lifecycle. Contains TODO for session tracking (line 315).

## CROSS-MODULE DEPENDENCY

Depends on **copilot-input**: uses `IGoldenSetRepository.getCopilotInputByGoldenSetIdAndUserInputId()` and `projectService.createProject/deleteProject` to orchestrate execution.
Depends on **account**: uses Account for WebSocket authentication.

## CONVENTIONS

- WebSocket job entities extend Entity for data consistency.
- ExecutionJobV2 owns socket lifecycle; ToolCallHandler owns message dispatch.
- `.ts` extensions required in imports (ESM).
- All repository methods throw on missing records (no null returns for singular lookups).
- Heavy `console.log/error/warn` usage — candidate for structured logger migration.
