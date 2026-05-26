import { clearTimeout } from "node:timers";
import { Event } from "ts-event-target";
import {
  CopilotInputEvent,
  CopilotJobEntity,
} from "../domain/entity/copilot-job.entity.ts";
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
    private runner: ExecutionJobRunnerV2,
    private job: CopilotJobEntity,
  ) {}

  /**
   * Start listening for session events. Returns a promise that resolves
   * with the CopilotJobEntity when editable text is received, or rejects
   * on error/timeout.
   */
  async run(): Promise<CopilotJobEntity> {
    const { publish, listen } = this.runner.execute();
    let rejectFunction: (error: unknown) => void;

    const timer = setTimeout(() => {
      rejectFunction(new Error("Session timeout"));
    }, SessionOrchestrator.SESSION_TIMEOUT_MS);

    return new Promise<CopilotJobEntity>((resolve, reject) => {
      rejectFunction = reject;

      listen("CopilotEditableTextMessage", (event) => {
        this.job.editableText = event.data.content;
      });

      listen("CopilotAiResponseMessage", (event) => {
        this.job.aiResponse = event.data.content;
        if (!this.job.editableText) {
          logger.warn(
            "Received AI response before editable text. This may indicate an issue with the backend job execution.",
          );
        }
      });

      listen("CopilotToolCallBatchMessage", (event) => {
        const { toolCallBatchId, toolCalls } = event.data;
        const result = runToolCalls(toolCalls, this.job.getData("schemaGraph"));
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
        // this.job.setTerminate();
        publish(new Event("unsubscribe"));
      });

      listen("CopilotStateChangeMessage", (event) => {
        if (event.data.currentJobIsRunning === false) {
          if (this.job.isFinished()) {
            clearTimeout(timer);
            resolve(this.job);
          } else if (this.job.editableText) {
            publish(
              new CopilotInputEvent("HUMAN_OPERATION", {
                humanOperationType: "CONTINUE",
              }),
            );
          } else {
            logger.warn(
              "Received job state change indicating job is no longer running, but job is not finished. This may indicate an issue with the backend job execution.",
            );
          }
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
        if (event.data.terminated) {
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
          logger.info(
            "Existing messages in initial state:",
            event.data.copilotMessages,
          );
        }
        if (!event.data.currentJobIsRunning) {
          publish(
            new CopilotInputEvent("HUMAN_INPUT", {
              content: this.job.getData("query"),
            }),
          );
        }
      });
    });
  }
}
