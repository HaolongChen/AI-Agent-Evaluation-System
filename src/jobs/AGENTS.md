# AGENTS.md - Job Runners

## OVERVIEW
CLI job runners wrapping LangGraph workflows for batch and Kubernetes-orchestrated execution.

## WHERE TO LOOK
| File | Purpose |
|------|---------|
| `EvaluationJobRunner.ts` | Orchestrates end-to-end evaluation batches via WebSocket |
| `RubricGenerationJobRunner.ts` | CLI entry for automated rubric drafting workflows |
| `RubricReviewJobRunner.ts` | CLI entry for batch rubric approval/rejection tasks |
| `HumanEvaluationJobRunner.ts` | CLI entry for batch human-in-the-loop scoring tasks |

## CONVENTIONS
- **CLI Parsing**: Embedded Zod schema validation for all `process.argv` inputs
- **K8s Integration**: Guarded by `RUN_KUBERNETES_JOBS` environment flag
- **Standard Output**: Successful results emitted as `JOB_RESULT_JSON: {...}` for log parsing
- **Exit Codes**: Zero on success, `1` on timeout, error, or WebSocket disconnection
- **Logging**: Uses structured `logger` with job-specific metadata and file-based `logs.txt` persistence

## LIFECYCLE PATTERN
All runners implement a standard start-wait-stop orchestration pattern:

1. **`startJob()`**:
   - Initializes WebSocket connection to Copilot backend
   - Sends initial query/context to trigger LangGraph workflow
2. **`waitForCompletion(timeoutMs)`**:
   - Promise-based block (default 5m timeout)
   - Polls WebSocket for `AI_RESPONSE`, `EDITABLE_TEXT`, or `ERROR` messages
   - Handles LLM tool calls via `TypeSystemStore` and `Copilot.toolCalls`
3. **`stopJob()`**:
   - Sends `TERMINATE` message to backend
   - Clears timeout IDs and closes WebSocket connection
   - Resolves/rejects the completion promise
