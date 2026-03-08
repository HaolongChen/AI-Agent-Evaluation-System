import { WebSocket } from 'ws';
import { logger } from '../utils/logger.ts';
import { appendFileSync } from 'fs';
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
} from '../utils/types.ts';
import {
  ClientType,
  Copilot,
  Locale,
  Product,
  type CopilotApiResult,
  type OpaqueSchemaGraph,
} from '../utils/zed/TypeSystem.ts';
import type { SupportedCustomModelDescriptor_supportedCustomModelDescriptor } from '../utils/zed/ZSchema.ts';
import type { AfCustomCodeTemplates_visibleAfCustomCodeTemplates } from '../utils/zed/AfCustomCodeTemplates.ts';
import { assertNotNull, genExtraContext } from '../utils/zed/helpers.ts';
import type { ToolResult } from '../utils/graph-states.ts';

const DEFAULT_TIMEOUT_MS = 300000; // 5 minutes

export class EvaluationJobRunner {
  private projectExId: string;
  private wsUrl: string;
  private query: string;
  private supportedCustomModelDescriptor: SupportedCustomModelDescriptor_supportedCustomModelDescriptor | null =
    null;
  private afCustomCodeTemplates: AfCustomCodeTemplates_visibleAfCustomCodeTemplates[] =
    [];
  private schemaGraph: OpaqueSchemaGraph | null = null;
  response: string = '';
  editableText: string = '';
  tasks: TaskMessage[] | null = null;
  private completionPromise: Promise<{
    // response: string;
    // tasks: TaskMessage[] | null;
    editableText: string;
  }>;
  // private resolveCompletion:
  //   | ((value: { response: string; tasks: TaskMessage[] | null }) => void)
  //   | null = null;
  private resolveCompletion:
    | ((result: { editableText: string }) => void)
    | null = null;
  private rejectCompletion: ((reason: Error) => void) | null = null;
  private isCompleted: boolean = false;
  private timeoutId: NodeJS.Timeout | null = null;
  // private isSchemaSaving: boolean = false;

  constructor(
    projectExId: string,
    wsUrl: string,
    query: string,
    supportedCustomModelDescriptor: SupportedCustomModelDescriptor_supportedCustomModelDescriptor | null,
    afCustomCodeTemplates: AfCustomCodeTemplates_visibleAfCustomCodeTemplates[],
    schemaGraph: OpaqueSchemaGraph | null,
  ) {
    this.projectExId = projectExId;
    this.wsUrl = wsUrl;
    this.query = query;
    this.supportedCustomModelDescriptor = supportedCustomModelDescriptor;
    this.afCustomCodeTemplates = afCustomCodeTemplates;
    this.schemaGraph = schemaGraph;
    // Create the completion promise in the constructor
    this.completionPromise = new Promise<{
      // response: string;
      // tasks: TaskMessage[] | null;
      editableText: string;
      // schema: string;
    }>((resolve, reject) => {
      this.resolveCompletion = resolve;
      this.rejectCompletion = reject;
    });
  }

  socket: WebSocket | null = null;

  connect(): void {
    this.socket = new WebSocket(this.wsUrl);


    this.socket.on('open', () => {
      logger.info('WebSocket connection established.');
    });

    this.socket.on('message', (data) => {
      void this.handleMessage(data).catch((err: unknown) => {
        logger.error('Unhandled error in message handler:', err);
      });
    });

    this.socket.on('close', () => {
      logger.info('WebSocket connection closed.');
      if (!this.isCompleted && this.rejectCompletion) {
        this.clearTimeout();
        this.isCompleted = true;
        this.rejectCompletion(
          new Error('WebSocket connection closed before job completion'),
        );
      }
    });

    this.socket.on('error', (error) => {
      logger.error('WebSocket error:', error);
      if (!this.isCompleted && this.rejectCompletion) {
        this.clearTimeout();
        this.isCompleted = true;
        this.rejectCompletion(
          error instanceof Error ? error : new Error(String(error)),
        );
      }
    });
  }

  send(data: CopilotMessage): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      logger.info(`Sending message: ${JSON.stringify(data)}`);
      this.socket.send(JSON.stringify(data));
      if (data.type === CopilotMessageType.TERMINATE) {
        this.rejectCompletion?.(new Error('Job terminated by user'));
        this.clearTimeout();
        this.socket.close();
      }
    } else {
      logger.error('WebSocket is not open. Cannot send message:', data);
    }
  }

  terminate(): void {
    this.send({ type: CopilotMessageType.TERMINATE });
  }

  async handleMessage(message: WebSocket.RawData): Promise<void> {
    const data: CopilotMessage[] = JSON.parse(message.toString());
    const logEntry = `${new Date().toISOString()} - Job Update: ${JSON.stringify(
      data,
      null,
      2,
    )}\n`;
    logger.info(`Received message: ${JSON.stringify(data)}`);
    appendFileSync('logs.txt', logEntry);
    switch (data[0]?.type) {
      case CopilotMessageType.INITIAL_STATE:
        this.handleInitialStateMessage(data[0] as InitialStateMessage);
        break;
      case CopilotMessageType.SYSTEM_STATUS:
        this.handleSystemStatusMessage(data[0] as SystemStatusMessage);
        break;
      case CopilotMessageType.TOOL_CALLS:
        await this.handleToolCallsMessage(data[0] as ToolCallsMessage);
        break;
      case CopilotMessageType.AI_RESPONSE:
        this.handleAIResponseMessage(data[0] as AIResponseMessage);
        break;
      case CopilotMessageType.TASK:
        this.tasks?.push(data[0] as TaskMessage);
        break;
      case CopilotMessageType.ERROR:
        if (!this.isCompleted && this.rejectCompletion) {
          this.clearTimeout();
          this.isCompleted = true;
          this.rejectCompletion(
            new Error(
              `Job execution error: ${(data[0] as { content: string }).content}`,
            ),
          );
        }
        this.stopJob();
        break;
      case CopilotMessageType.EDITABLE_TEXT:
        this.handleEditableTextMessage(data[0] as EditableTextMessage);
        break;
      case CopilotMessageType.STATE_CHANGE:
        if (data[0]?.currentJobIsRunning === false) {
          logger.info(
            `Job for project ${this.projectExId} has stopped running.`,
          );
          if (!this.isCompleted && this.rejectCompletion) {
            logger.error('Job has stopped running unexpectedly');
            this.clearTimeout();
            this.isCompleted = true;
            this.rejectCompletion(
              new Error('Job has stopped running unexpectedly'),
            );
            this.stopJob();
          }
        }
        break;
      default:
        logger.info(
          `Received message of type ${data[0]?.type} for project ${this.projectExId}.`,
        );
    }
  }

  async handleEditableTextMessage(message: EditableTextMessage): Promise<void> {
    this.editableText = message.content;
    // this.isSchemaSaving = true;
    // const schema = await SchemaDownloaderForTest(this.projectExId);
    if (!this.isCompleted && this.resolveCompletion) {
      this.clearTimeout();
      this.isCompleted = true;
      this.resolveCompletion({
        editableText: this.editableText,
        // schema: schema as unknown as string,
      });
    }
    this.stopJob();
  }

  handleInitialStateMessage(message: InitialStateMessage): void {
    if (message.terminated) {
      if (!this.isCompleted && this.rejectCompletion) {
        this.clearTimeout();
        this.isCompleted = true;
        this.rejectCompletion(new Error('Job has terminated'));
      }
      this.clearTimeout();
      this.socket?.close();
      return;
    }
    if (message.currentJobIsRunning === true) {
      logger.info(`Job for project ${this.projectExId} is running.`);
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

  async handleToolCallsMessage(message: ToolCallsMessage): Promise<void> {
    const { result, successful, errorMessage } = await this.runToolCalls(
      message.toolCalls,
    );
    if (successful) {
      this.send({
        type: CopilotMessageType.TOOL_RESPONSE,
        toolCallsId: message.toolCallsId,
        result: result!,
      });
    } else {
      // this.send({
      //   type: CopilotMessageType.EXEC_ERROR,
      //   error: errorMessage,
      //   context: {
      //     schemaExId: this.schemaExId,
      //     lastPatch
      //   }
      // })
      logger.error(
        `Tool calls failed for project ${this.projectExId}: ${errorMessage}.`,
      );
    }
  }

  async handleAIResponseMessage(message: AIResponseMessage): Promise<void> {
    this.editableText = message.content;
    // this.isSchemaSaving = true;
    // const schema = await SchemaDownloaderForTest(this.projectExId);
    if (!this.isCompleted && this.resolveCompletion) {
      this.clearTimeout();
      this.isCompleted = true;
      this.resolveCompletion({
        editableText: this.editableText,
        // schema: schema as unknown as string,
      });
    }
    this.stopJob();
  }

  runToolCalls = async (toolCalls: ToolCall[]) => {
    const product = Product.ZION;
    const clientType = ClientType.WEB;
    const locale = Locale.ZH;

    try {
      const result: CopilotApiResult = await Copilot.toolCalls(
        assertNotNull(this.schemaGraph),
        genExtraContext(
          this.supportedCustomModelDescriptor,
          this.afCustomCodeTemplates,
        ),
        null,
        product,
        clientType,
        'WEB', // clientExId: wechat mini program, web, etc.
        locale,
        toolCalls,
      );
      // probably not necessary to apply schema diff in evaluation job runner
      return { result: result as unknown as ToolResult, successful: true };
    } catch (error: unknown) {
      logger.error('toolCall---error:', error, toolCalls);
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
      this.timeoutId = null;
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
        this.timeoutId = null;
        this.isCompleted = true;
        this.rejectCompletion(
          new Error(`Job execution timeout after ${timeoutMs}ms`),
        );
      }
    }, timeoutMs);

    try {
      return await this.completionPromise;
    } finally {
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
        this.timeoutId = null;
      }
    }
  }

  stopJob(): void {
    this.terminate();
  }
}

