import { clearTimeout } from "node:timers";
import { Event } from "ts-event-target";
import { CopilotInputEvent } from "../domain/entity/copilot-job.entity.ts";
import { ExecutionJobRunnerV2 } from "./execution-job-v2.ts";
import { logger } from "../../shared/infrastructure/logger.ts";
import type { CopilotSessionAggregate } from "../domain/aggregate/copilot-session.aggregate.ts";

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
    private session: CopilotSessionAggregate,
  ) {}

  /**
   * Start listening for session events. Returns a promise that resolves
   * with the CopilotJobEntity when editable text is received, or rejects
   * on error/timeout.
   */
  async run(): Promise<void> {
    const { publish, listen } = this.runner.execute(
      await this.session.crdtSchemaLifecycle.schemaGraph(),
    );
    let rejectFunction: (error: unknown) => void;

    const timer = setTimeout(() => {
      rejectFunction(new Error("Session timeout"));
    }, SessionOrchestrator.SESSION_TIMEOUT_MS);

    return new Promise((resolve, reject) => {
      rejectFunction = reject;

      listen("CopilotEditableTextMessage", (event) => {
        this.session.setData({ editableText: event.data.content });
      });

      listen("CopilotAiResponseMessage", (event) => {
        this.session.setData({ aiResponse: event.data.content });
        if (!this.session.getData("editableText")) {
          logger.warn(
            "Received AI response before editable text. This may indicate an issue with the backend job execution.",
          );
        }
      });

      listen("CopilotTaskMessage", (event) => {
        this.session.setData({
          tasks: [...(this.session.getData("tasks") ?? []), event.data],
        });
      });

      listen("CopilotTerminateMessage", () => {
        // this.job.setTerminate();
        publish(new Event("unsubscribe"));
      });

      listen("CopilotStateChangeMessage", (event) => {
        if (event.data.currentJobIsRunning === false) {
          if (this.session.getData("aiResponse")) {
            clearTimeout(timer);
            resolve();
          } else if (this.session.getData("editableText")) {
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
              content: this.session
                .getEntity("project")
                .getEntity("copilotInput")
                .getEntity("userInput")
                .getData("content"),
            }),
          );
        }
      });
    });
  }
}
