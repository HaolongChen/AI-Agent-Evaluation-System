import { clearTimeout } from "node:timers";
import { logger } from "../../shared/infrastructure/logger.ts";
import { CopilotOutputEntity } from "../domain/entity/copilot-output.entity.ts";
import type { CopilotApiResultJs } from "../../shared/domain/interface/type-system.ts";
import type {
  CopilotEvent,
  CopilotEventType,
} from "../domain/entity/copilot-job.entity.ts";
import type { TypeNameList } from "../domain/schema/copilot.schema.ts";
import type { CopilotOutputFactory } from "../domain/service/copilot-output-factory.ts";

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
  private aiResponse: string | undefined;
  private editableText: string | undefined;
  private tasks: CopilotEvent<"CopilotTaskMessage">["data"][] = [];
  constructor(
    private listen: <T extends keyof TypeNameList>(
      eventName: T,
      listener: (event: Extract<CopilotEventType[number], { type: T }>) => void,
    ) => void,
    private runToolCalls: (
      event: CopilotEvent<"CopilotToolCallBatchMessage">,
    ) => CopilotApiResultJs,
    private sendHumanMessage: () => void,
    private sendContinueOperation: () => void,
    private terminateSession: () => void,
    private copilotOutputFactory: CopilotOutputFactory,
  ) {}

  /**
   * Start listening for session events. Returns a promise that resolves
   * with the CopilotJobEntity when editable text is received, or rejects
   * on error/timeout.
   */
  async run(): Promise<CopilotOutputEntity> {
    let rejectFunction: (error: unknown) => void;

    const timer = setTimeout(() => {
      rejectFunction(new Error("Session timeout"));
    }, SessionOrchestrator.SESSION_TIMEOUT_MS);

    return new Promise<CopilotOutputEntity>((resolve, reject) => {
      rejectFunction = reject;

      this.listen("CopilotEditableTextMessage", (event) => {
        this.editableText = event.data.content;
      });

      this.listen("CopilotToolCallBatchMessage", (event) => {
        const result = this.runToolCalls(event);

        logger.info(
          `Tool call batch executed with result: ${JSON.stringify(result)}`,
        );
      });

      this.listen("CopilotAiResponseMessage", (event) => {
        this.aiResponse = event.data.content;
        if (!this.editableText) {
          logger.warn(
            "Received AI response before editable text. This may indicate an issue with the backend job execution.",
          );
        }
      });

      this.listen("CopilotTaskMessage", (event) => {
        this.tasks.push(event.data);
      });

      this.listen("CopilotTerminateMessage", () => {
        this.terminateSession();
      });

      this.listen("CopilotStateChangeMessage", (event) => {
        if (event.data.currentJobIsRunning === false) {
          if (this.aiResponse && this.editableText) {
            clearTimeout(timer);
            resolve(
              this.copilotOutputFactory.build({
                aiResponse: this.aiResponse,
                editableText: this.editableText,
                tasks: this.tasks,
              }),
            );
          } else if (this.editableText) {
            this.sendContinueOperation();
          } else {
            logger.warn(
              "Received job state change indicating job is no longer running, but job is not finished. This may indicate an issue with the backend job execution.",
            );
          }
        }
      });

      this.listen("CopilotErrorMessage", (error) => {
        clearTimeout(timer);
        reject(error);
      });
      this.listen("CopilotToolCallBatchExecErrorMessage", (error) => {
        clearTimeout(timer);
        reject(error);
      });

      this.listen("CopilotInitialStateMessage", (event) => {
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
          this.sendHumanMessage();
        }
      });
    });
  }
}
