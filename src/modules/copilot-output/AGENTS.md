# copilot-output Module

## OVERVIEW

Executes copilot queries over WebSocket and persists captured outputs.

## STRUCTURE

```
domain/
  entity/          CopilotJobEntity, CopilotOutputEntity
  interface/       ICopilotOutputRepository
  schema/          copilot.schema.ts, copilot-output.schema.ts
  service/         CopilotExecutionJobService (extends entity)
application/
  execution-service.ts    ExecuteCopilotUseCase (orchestrates full job lifecycle)
  evaluation-job.ts       EvaluationJobRunner (WebSocket lifecycle)
  message-handler.ts      MessageHandler (dispatches WS messages to typed handlers)
  get-by-id.ts            GetCopilotOutputByIdUseCase
  get-by-copilot-input.ts GetCopilotOutputsByCopilotInputUseCase
infrastructure/repository/
  copilot-output.repository.ts  Prisma-backed ICopilotOutputRepository
```

## ENTITIES

- **CopilotJobEntity**: Owns WebSocket lifecycle state (editableText, tasks, isTerminated). Created per execution run.
- **CopilotOutputEntity**: Persisted record of copilot output content tied to a goldenSetId + userInputId pair.

## DOMAIN SERVICES

- **CopilotExecutionJobService**: Thin subclass of CopilotJobEntity, no additional logic.

## APPLICATION USE CASES

- **ExecuteCopilotUseCase**: Main use case. Fetches golden set/user input from copilot-input, creates temp project via projectService, opens WebSocket, sends user query, waits for editableText, persists output, deletes temp project.
- **EvaluationJobRunner**: Manages WebSocket connection lifecycle. Sends terminate on job completion or error.
- **MessageHandler**: Type-dispatched handler map for all CopilotMessageType variants. Handles INITIAL_STATE (sends query), TOOL_CALLS (executes via CopilotJs), EDITABLE_TEXT (resolves promise), TERMINATE.
- **GetCopilotOutputByIdUseCase**: Retrieve single output by ID.
- **GetCopilotOutputsByCopilotInputUseCase**: Retrieve all outputs for a golden set + user input pair.

## CROSS-MODULE DEPENDENCY

Depends on **copilot-input**: uses `IGoldenSetRepository.getCopilotInputByGoldenSetIdAndUserInputId()` and `projectService.createProject/deleteProject` to orchestrate execution.

## CONVENTIONS

- WebSocket job entities (CopilotJobEntity, MessageHandler) extend Entity for data consistency.
- EvaluationJobRunner owns socket lifecycle; MessageHandler owns message dispatch.
- `.js` extensions required in imports (ESM).
- All repository methods throw on missing records (no null returns for singular lookups).
