import { clearTimeout } from "node:timers";
import { Event } from "ts-event-target";
import {
  CopilotInputEvent,
  CopilotJobEntity,
} from "../domain/entity/copilot-job.entity.ts";
import { CopilotOutputEntity } from "../domain/entity/copilot-output.entity.ts";
import { ExecutionJobRunnerV2 } from "./execution-job-v2.ts";
import { runToolCalls } from "./tool-call-handler.ts";
import { logger } from "../../shared/infrastructure/logger.ts";

/**
 * SessionOrchestrator — encapsulates WebSocket event handling for a single
 * copilot execution session. Listens for incoming messages, dispatches tool
 * calls, manages timeouts, and resolves with the final CopilotOutputEntity.
 *
 * This is the test surface for session behavior: mock ExecutionJobRunnerV2
 * to verify event handling without real network calls.
 */
export class SessionOrchestrator {
  private static readonly SESSION_TIMEOUT_MS = 2 * 60 * 1000;
  constructor(
    private readonly runner: ExecutionJobRunnerV2,
    private readonly job: CopilotJobEntity,
    private readonly goldenSetId: string,
    private readonly userInputId: string,
  ) {}

  /**
   * Start listening for session events. Returns a promise that resolves
   * with the CopilotOutputEntity when editable text is received, or rejects
   * on error/timeout.
   */
  async run(): Promise<CopilotOutputEntity> {
    const { publish, listen } = this.runner.execute();
    let rejectFunction: (error: unknown) => void;

    const timer = setTimeout(() => {
      rejectFunction(new Error("Session timeout"));
    }, SessionOrchestrator.SESSION_TIMEOUT_MS);

    return new Promise<CopilotOutputEntity>((resolve, reject) => {
      rejectFunction = reject;

      listen("CopilotEditableTextMessage", (event) => {
        this.job.editableText = event.data.content;
        publish(new CopilotInputEvent("TERMINATE", {}));
        clearTimeout(timer);
        resolve(this.jobToOutput());
      });

      listen("CopilotToolCallBatchMessage", (event) => {
        const { toolCallBatchId, toolCalls } = event.data;
        const result = runToolCalls(toolCalls, this.job.data.schemaGraph);
        if (result.error) {
          logger.error(
            `Error executing tool call batch ${toolCallBatchId}:`,
            result.error,
          );
          clearTimeout(timer);
          reject(
            new Error(
              `Error executing tool call batch ${toolCallBatchId}: ${result.error}`,
            ),
          );
          return;
        }
        if (result.schemaDiff) {
          logger.info(
            `Schema diff produced by tool call batch ${toolCallBatchId}:`,
            result.schemaDiff,
          );

          // TODO: apply schema diff to local
        }
        publish(
          new CopilotInputEvent("TOOL_CALL_BATCH_RESPONSE", {
            toolCallBatchId: event.data.toolCallBatchId,
            responseByToolCallId: JSON.parse(result.data ?? "{}"),
            schemaDiff: result.schemaDiff,
          }),
        );
      });

      listen("CopilotTaskMessage", (event) => {
        this.job.addTask(event.data);
      });

      listen("CopilotTerminateMessage", () => {
        this.job.setTerminate();
        publish(new Event("unsubscribe"));
      });

      listen("CopilotStateChangeMessage", (event) => {
        if (!event.data.currentJobIsRunning && !this.job.isTerminated) {
          logger.error(
            "Current job is not running, but session is not marked as terminated. This likely indicates an issue with the backend job execution.",
          );
        }
      });

      listen("CopilotErrorMessage", (error) => {
        clearTimeout(timer);
        reject(error);
      });
      listen("CopilotToolCallBatchExecErrorMessage", (error) => {
        clearTimeout(timer);
        reject(error);
      });

      listen("CopilotInitialStateMessage", (event) => {
        if (event.data.currentJobIsRunning || event.data.terminated) {
          logger.error(
            "Received initial state message for a session that is already running or terminated. This likely indicates an issue with the backend job execution.",
          );
          clearTimeout(timer);
          reject(
            new Error(
              "Received initial state message for a session that is already running or terminated. This likely indicates an issue with the backend job execution.",
            ),
          );
          return;
        }
        if (event.data.copilotMessages.length > 0) {
          logger.warn(
            "Received initial state message with existing copilot messages. This may indicate that the session was not properly cleaned up after the last execution.",
          );
          clearTimeout(timer);
          reject(
            new Error(
              "Received initial state message with existing copilot messages. This may indicate that the session was not properly cleaned up after the last execution.",
            ),
          );
          return;
        }
        publish(
          new CopilotInputEvent("HUMAN_INPUT", {
            content: this.job.data.query,
          }),
        );
      });
    });
  }

  private jobToOutput(): CopilotOutputEntity {
    if (!this.job.editableText) {
      throw new Error(
        "Copilot job has not produced editable text or has not terminated yet.",
      );
    }
    return new CopilotOutputEntity({
      goldenSetId: this.goldenSetId,
      userInputId: this.userInputId,
      content: this.job.editableText,
    });
  }
}
