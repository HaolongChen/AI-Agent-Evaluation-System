import { WebSocket } from "ws";

import {
  CopilotMessageType,
  type AIResponseMessage,
  type CopilotMessage,
  type EditableTextMessage,
  type HumanInputMessage,
  type InitialStateMessage,
  type SystemStatusMessage,
  type TaskMessage,
  type ToolCall,
  type ToolCallsMessage,
} from "../external/types.ts";
import {
  ClientType,
  CopilotJs,
  Locale,
  Product,
  type CopilotApiResultJs,
  type OpaqueSchemaGraph,
} from "../external/zed/TypeSystem.ts";
import { assertNotNull } from "../external/zed/helpers.ts";
import type { ToolResult } from "../external/graph-states.ts";
import type { Data } from "ws";

const DEFAULT_TIMEOUT_MS = 300_000; // 5 minutes

export class EvaluationJobRunner {
  private projectExId: string;
  private wsUrl: string;
  private query: string;
  private schemaGraph: OpaqueSchemaGraph;
  private editableText: string = "";
  private rounds: number = 0;
  private tasks: TaskMessage[] | undefined = undefined;
  private completionPromise: Promise<{
    // response: string;
    // tasks: TaskMessage[] | null;
    editableText: string;
  }>;
  private resolveCompletion:
    | ((result: { editableText: string }) => void)
    | undefined = undefined;
  private rejectCompletion: ((reason: Error) => void) | undefined = undefined;
  private isCompleted: boolean = false;
  private timeoutId: NodeJS.Timeout | undefined = undefined;
  // private isSchemaSaving: boolean = false;

  constructor(
    projectExId: string,
    wsUrl: string,
    query: string,
    schemaGraph: OpaqueSchemaGraph,
  ) {
    this.projectExId = projectExId;
    this.wsUrl = wsUrl;
    this.query = query;
    this.schemaGraph = schemaGraph;
    this.completionPromise = new Promise<{
      editableText: string;
    }>((resolve, reject) => {
      this.resolveCompletion = resolve;
      this.rejectCompletion = reject;
    }).then((result) => {
      this.stopJob();
      return result;
    });
  }

  private socket: WebSocket | undefined;
  async connect(): Promise<void> {
    this.socket = new WebSocket(this.wsUrl);

    this.socket.addEventListener("open", () => {
      console.info("WebSocket connection opened.");
    });

    this.socket.addEventListener("message", (event) => {
      this.handleMessage(event.data);
    });

    this.socket.addEventListener("close", () => {
      console.info("WebSocket connection closed.");
      if (!this.isCompleted && this.rejectCompletion) {
        this.rejectCompletion(
          new Error("WebSocket connection closed before job completion"),
        );
      }
    });

    this.socket.addEventListener("error", (error) => {
      console.error("WebSocket error:", error);
      if (!this.isCompleted && this.rejectCompletion) {
        this.rejectCompletion(
          error instanceof Error ? error : new Error(String(error)),
        );
      }
    });
  }

  send(data: CopilotMessage): void {
    if (this.isCompleted) {
      console.warn(
        "Attempted to send message after job completion. Ignoring.",
        data,
      );
      return;
    }
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.info(`Sending message: ${JSON.stringify(data)}`);
      this.socket.send(JSON.stringify(data));
    } else {
      console.error("WebSocket is not open. Cannot send message:", data);
    }
  }

  terminate(): void {
    if (this.isCompleted) return;
    this.send({ type: CopilotMessageType.TERMINATE });
    this.isCompleted = true;
    this.socket?.close();
  }

  handleMessage(message: Data): void {
    const data: CopilotMessage[] = JSON.parse(message.toString());
    console.info(`Received message: ${JSON.stringify(data)}`);
    if (this.isCompleted) return;
    switch (data[0]?.type) {
      case CopilotMessageType.INITIAL_STATE: {
        this.handleInitialStateMessage(data[0] as InitialStateMessage);
        break;
      }
      case CopilotMessageType.SYSTEM_STATUS: {
        this.handleSystemStatusMessage(data[0] as SystemStatusMessage);
        break;
      }
      case CopilotMessageType.TOOL_CALLS: {
        this.handleToolCallsMessage(data[0] as ToolCallsMessage);
        break;
      }
      case CopilotMessageType.AI_RESPONSE: {
        this.handleAIResponseMessage(data[0] as AIResponseMessage);
        break;
      }
      case CopilotMessageType.TASK: {
        this.tasks?.push(data[0] as TaskMessage);
        break;
      }
      case CopilotMessageType.ERROR: {
        if (!this.isCompleted && this.rejectCompletion) {
          this.rejectCompletion(
            new Error(
              `Job execution error: ${(data[0] as { content: string }).content}`,
            ),
          );
        }
        break;
      }
      case CopilotMessageType.EDITABLE_TEXT: {
        this.handleEditableTextMessage(data[0] as EditableTextMessage);
        break;
      }
      case CopilotMessageType.STATE_CHANGE: {
        if (data[0]?.currentJobIsRunning === false) {
          console.info(
            `Job for project ${this.projectExId} has stopped running.`,
          );
          if (!this.isCompleted && this.rejectCompletion) {
            console.error("Job has stopped running unexpectedly");
            this.rejectCompletion(
              new Error("Job has stopped running unexpectedly"),
            );
          }
        }
        break;
      }
      default: {
        console.info(
          `Received message of type ${data[0]?.type} for project ${this.projectExId}.`,
        );
      }
    }
  }

  handleEditableTextMessage(message: EditableTextMessage) {
    this.editableText = message.content;
    if (!this.isCompleted && this.resolveCompletion) {
      this.resolveCompletion({
        editableText: this.editableText,
      });
    } else {
      console.warn(
        "Received editable text message but job is already completed. Ignoring.",
      );
    }
  }

  handleInitialStateMessage(message: InitialStateMessage): void {
    if (message.terminated) {
      if (!this.isCompleted && this.rejectCompletion) {
        this.rejectCompletion(new Error("Job has terminated"));
      }
      return;
    }
    if (message.currentJobIsRunning === true) {
      console.info(`Job for project ${this.projectExId} is running.`);
    }
    const response: HumanInputMessage = {
      type: CopilotMessageType.HUMAN_INPUT,
      content: this.query,
    };
    this.send(response);
  }

  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleSystemStatusMessage(_message: SystemStatusMessage): void {
    // TODO: Handle system status message as needed
  }

  handleToolCallsMessage(message: ToolCallsMessage) {
    const { result, successful, errorMessage } = this.runToolCalls(
      message.toolCalls,
    );
    if (successful) {
      this.send({
        type: CopilotMessageType.TOOL_RESPONSE,
        toolCallsId: message.toolCallsId,
        result: result!,
      });
    } else {
      console.error(
        `Tool calls failed for project ${this.projectExId}: ${errorMessage}.`,
      );
      if (!this.isCompleted && this.rejectCompletion) {
        this.rejectCompletion(new Error(`Tool calls failed: ${errorMessage}`));
      }
    }
  }

  handleAIResponseMessage(message: AIResponseMessage) {
    this.editableText = message.content;
    if (!this.isCompleted && this.resolveCompletion) {
      this.resolveCompletion({
        editableText: this.editableText,
        // schema: schema as unknown as string,
      });
    } else {
      console.warn(
        "Received AI response message but job is already completed. Ignoring.",
      );
    }
  }

  runToolCalls = (toolCalls: ToolCall[]) => {
    const product = Product.ZION;
    const clientType = ClientType.WEB;
    const locale = Locale.ZH;
    this.rounds++;
    try {
      const result: CopilotApiResultJs = CopilotJs.toolCalls(
        assertNotNull(this.schemaGraph),
        undefined,
        product,
        clientType,
        "WEB", // clientExId: wechat mini program, web, etc.
        locale,
        toolCalls,
      );
      // probably not necessary to apply schema diff in evaluation job runner
      return { result: result as unknown as ToolResult, successful: true };
    } catch (error: unknown) {
      console.error("toolCall---error:", error, toolCalls);
      return {
        successful: false,
        errorMessage: error instanceof Error ? error.message : String(error),
        result: (error as { result?: ToolResult }).result,
      };
    }
  };

  startJob(): void {
    this.connect();
    // this.socket?.send(JSON.stringify({ action: "start", jobId }));
  }

  /**
   * Clear the timeout if set
   */
  private clearTimeout(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
    }
  }

  /**
   * Wait for the job to complete with an optional timeout.
   * Can be called multiple times; all calls will receive the same promise.
   * If called after completion, returns the already resolved/rejected promise.
   * @param timeoutMs Optional timeout in milliseconds (default: 5 minutes)
   * @returns Promise that resolves with the response when job completes
   */
  async waitForCompletion(
    timeoutMs: number = DEFAULT_TIMEOUT_MS,
  ): Promise<{ editableText: string }> {
    // Clear any existing timeout before setting a new one (for multiple calls)
    this.clearTimeout();

    // Add timeout handling
    this.timeoutId = setTimeout(() => {
      if (!this.isCompleted && this.rejectCompletion) {
        this.rejectCompletion(
          new Error(`Job execution timeout after ${timeoutMs}ms`),
        );
      }
    }, timeoutMs);

    return await this.completionPromise;
  }

  stopJob(): void {
    this.terminate();
    this.clearTimeout();
  }
}
