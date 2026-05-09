# AGENTS.md - Job Runners

> **Scope:** src/jobs/ | **Generated:** 2026-05-08

## OVERVIEW

CLI entry points orchestrating DDD modules. Jobs delegate business logic to module services; runners own lifecycle and CLI concerns only.

## WHERE TO LOOK

| File                           | Purpose                              | Modules Used                        |
| ------------------------------ | ------------------------------------ | ----------------------------------- |
| `EvaluationJobRunner.ts`       | E2E evaluation batches via WebSocket | copilot-output, evaluation, rubrics |
| `RubricGenerationJobRunner.ts` | Automated rubric drafting workflows  | rubrics, copilot-output             |
| `RubricReviewJobRunner.ts`     | Batch rubric approval/rejection      | rubrics, evaluation                 |
| `HumanEvaluationJobRunner.ts`  | Batch human-in-the-loop scoring      | evaluation, rubrics                 |

## MODULE INTEGRATION

Jobs consume module application services:

- **`copilot-output`**: `ExecuteCopilotUseCase` runs WebSocket job lifecycle (start, wait, stop)
- **`evaluation`**: `EvaluationSessionService` manages session state and scoring
- **`rubrics`**: `RubricGenerationService` / `RubricReviewService` handle rubric lifecycle

Runners orchestrate; modules own business logic. Jobs never contain domain rules.

## CONVENTIONS

- **CLI Parsing**: Embedded Zod schema validation for all `process.argv` inputs
- **K8s Integration**: Guarded by `RUN_KUBERNETES_JOBS` environment flag
- **Standard Output**: Successful results emitted as `JOB_RESULT_JSON: {...}` for log parsing
- **Exit Codes**: Zero on success, `1` on timeout, error, or WebSocket disconnection
- **Logging**: Structured `console` with job metadata + file-based `logs.txt` persistence

## LIFECYCLE PATTERN

Delegates to `ExecuteCopilotUseCase` (copilot-output):

1. **`execute()`**:
   - Fetches golden set + user input via copilot-input module
   - Creates temp project, opens WebSocket
   - Sends query to trigger LangGraph workflow
2. **`waitForCompletion(timeoutMs)`**:
   - Promise-based block (default 5m timeout)
   - `MessageHandler` dispatches `AI_RESPONSE`, `EDITABLE_TEXT`, `ERROR` messages
   - Handles LLM tool calls via `TypeSystemStore` and `Copilot.toolCalls`
3. **`stop()`**:
   - Sends `TERMINATE` to backend
   - Clears timeout IDs, closes WebSocket
   - Resolves/rejects completion promise

(End of file - total 48 lines)
