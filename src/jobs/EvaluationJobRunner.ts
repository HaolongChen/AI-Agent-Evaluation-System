import { WebSocket } from 'ws';
import * as z from 'zod';
import { RUN_KUBERNETES_JOBS } from '../config/env.ts';
import { logger } from '../utils/logger.ts';
import { appendFileSync } from 'fs';
import {
  CopilotMessageType,
  type AIResponseMessage,
  type CopilotMessage,
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
} from '../utils/zed/TypeSystem.ts';

import { NODE_ENV } from '../config/env.ts';

import { isNil, get } from 'lodash-es';
import { TypeSystemStore } from '../utils/zed/TypeSystemStore.ts';
import { assertNotNull, getError } from '../utils/zed/helpers.ts';
import type { ToolResult } from '../utils/graph-states.ts';

const DISCONNECT = false;
const TERMINATE = false;
const DEFAULT_TIMEOUT_MS = 300000; // 5 minutes

export class EvaluationJobRunner {
  private projectExId: string;
  private wsUrl: string;
  private promptTemplate: string;
  response: string = '';
  tasks: TaskMessage[] | null = null;
  private completionPromise: Promise<{
    response: string;
    tasks: TaskMessage[] | null;
  }>;
  private resolveCompletion:
    | ((value: { response: string; tasks: TaskMessage[] | null }) => void)
    | null = null;
  private rejectCompletion: ((reason: Error) => void) | null = null;
  private isCompleted: boolean = false;
  private timeoutId: NodeJS.Timeout | null = null;

  constructor(projectExId: string, wsUrl: string, promptTemplate: string) {
    this.projectExId = projectExId;
    this.wsUrl = wsUrl;
    this.promptTemplate = promptTemplate;
    // Create the completion promise in the constructor
    this.completionPromise = new Promise<{
      response: string;
      tasks: TaskMessage[] | null;
    }>((resolve, reject) => {
      this.resolveCompletion = resolve;
      this.rejectCompletion = reject;
    });
  }

  socket: WebSocket | null = null;

  connect(): void {
    this.socket = new WebSocket(this.wsUrl);

    if (DISCONNECT) {
      this.stopJob();
    }

    if (TERMINATE) {
      this.terminate();
    }

    this.socket.on('open', () => {
      logger.info('WebSocket connection established.');
    });

    this.socket.on('message', (data) => {
      this.handleMessage(data);
    });

    this.socket.on('close', () => {
      logger.info('WebSocket connection closed.');
      if (!this.isCompleted && this.rejectCompletion) {
        this.clearTimeout();
        this.isCompleted = true;
        this.rejectCompletion(
          new Error('WebSocket connection closed before job completion')
        );
      }
    });

    this.socket.on('error', (error) => {
      logger.error('WebSocket error:', error);
      if (!this.isCompleted && this.rejectCompletion) {
        this.clearTimeout();
        this.isCompleted = true;
        this.rejectCompletion(
          error instanceof Error ? error : new Error(String(error))
        );
      }
    });
  }

  send(data: CopilotMessage): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      logger.info(`Sending message: ${JSON.stringify(data)}`);
      this.socket.send(JSON.stringify(data));
      if(data.type === CopilotMessageType.TERMINATE) {
        this.rejectCompletion?.(new Error('Job terminated by user'));
        this.stopJob();
      }
    } else {
      logger.error('WebSocket is not open. Cannot send message:', data);
      setTimeout(() => {
        this.send(data);
      }, 1000); // Retry after 1 second
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
      2
    )}\n`;
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
        logger.info(
          `Received task message for project ${
            this.projectExId
          }: ${JSON.stringify(data[0].name)}.`
        );
        break;
      case CopilotMessageType.ERROR:
        logger.error(
          `Received error message for project ${
            this.projectExId
          }: ${JSON.stringify(data[0])}.`
        );
        if (!this.isCompleted && this.rejectCompletion) {
          this.clearTimeout();
          this.isCompleted = true;
          this.rejectCompletion(
            new Error(
              `Job execution error: ${(data[0] as { content: string }).content}`
            )
          );
        }
        this.stopJob();
        break;
      case CopilotMessageType.EDITABLE_TEXT:
        this.send({
          type: CopilotMessageType.HUMAN_OPERATION,
          operation: 'continue',
        });
        break;
      default:
        logger.info(
          `Received message of type ${data[0]?.type} for project ${this.projectExId}.`
        );
    }
  }

  handleInitialStateMessage(message: InitialStateMessage): void {
    if (message.terminated) {
      logger.error(`Job for project ${this.projectExId} has terminated.`);
      if (!this.isCompleted && this.rejectCompletion) {
        this.clearTimeout();
        this.isCompleted = true;
        this.rejectCompletion(new Error('Job has terminated'));
      }
      this.stopJob();
      return;
    }
    if (message.currentJobIsRunning === true) {
      logger.info(`Job for project ${this.projectExId} is running.`);
    }
    logger.info(`Received initial state for project ${this.projectExId}.`);
    const response: HumanInputMessage = {
      type: CopilotMessageType.HUMAN_INPUT,
      content: this.promptTemplate,
    };
    this.send(response);
  }

  handleSystemStatusMessage(message: SystemStatusMessage): void {
    logger.info(
      `Received system status for project ${this.projectExId}: ${message.content}.`
    );
    // TODO: Handle system status message as needed
  }

  async handleToolCallsMessage(message: ToolCallsMessage): Promise<void> {
    logger.info(
      `Received tool calls for project ${this.projectExId}: ${JSON.stringify(
        message
      )}.`
    );
    const { result, successful, errorMessage } = await this.runToolCalls(
      message.toolCalls
    );
    if (successful) {
      this.send({
        type: CopilotMessageType.TOOL_RESPONSE,
        toolCallsId: message.toolCallsId,
        result,
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
        `Tool calls failed for project ${this.projectExId}: ${errorMessage}.`
      );
    }
  }

  handleAIResponseMessage(message: AIResponseMessage): void {
    logger.info(
      `Received AI response for project ${this.projectExId}: ${JSON.stringify(
        message
      )}.`
    );
    this.response = message.content;
    if (!this.isCompleted && this.resolveCompletion) {
      this.clearTimeout();
      this.isCompleted = true;
      this.resolveCompletion({ response: this.response, tasks: this.tasks });
    }
    this.stopJob();
    // TODO:Handle AI response message as needed
  }

  runToolCalls = async (toolCalls: ToolCall[]) => {
    const product = (() => {
      return false;
    })()
      ? Product.MOMEN
      : Product.ZION;
    const clientType = (() => {
      return false;
    })()
      ? ClientType.WECHAT_MINI_PROGRAM
      : ClientType.WEB;
    const locale = (() => {
      return true;
    })()
      ? Locale.ZH
      : Locale.EN;

    try {
      const typeSystemStore = new TypeSystemStore();
      await typeSystemStore.rehydrate(this.projectExId);
      const result: CopilotApiResult = Copilot.toolCalls(
        assertNotNull(typeSystemStore.schemaGraph),
        product,
        clientType,
        locale,
        toolCalls
      );
      if (NODE_ENV === 'development') {
        logger.debug('toolCall---result:', result, toolCalls);
      }
      const errorMessage = get(result, 'error');
      if (errorMessage) {
        throw getError(errorMessage, result);
      }
      const schemaDiff = get(result, 'schemaDiff');
      if (isNil(schemaDiff)) {
        return { result: (result as unknown as ToolResult), successful: true };
      }
      if (NODE_ENV === 'development') {
        logger.debug('toolCall---schemaDiff:', schemaDiff);
      }
      // const applyResult = applyLocalCrdtDiff(schemaDiff, {
      //   isPendingApplication: true,
      // });
      // if (applyResult.successful) {
      //   return { result, successful: true };
      // }
      // throw getError(JSON.stringify(applyResult.errorContent), result);
      // probably not necessary to apply schema diff in evaluation job runner
      return { result: (result as unknown as ToolResult), successful: true };
    } catch (error: unknown) {
      console.log('toolCall---error:', error, toolCalls);
      return {
        successful: false,
        errorMessage: (error as unknown as { message: string }).message,
        result: (error as unknown as { result: ToolResult }).result,
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
    timeoutMs: number = DEFAULT_TIMEOUT_MS
  ): Promise<{ response: string; tasks: TaskMessage[] | null }> {
    // Clear any existing timeout before setting a new one (for multiple calls)
    this.clearTimeout();

    // Add timeout handling
    this.timeoutId = setTimeout(() => {
      if (!this.isCompleted && this.rejectCompletion) {
        this.timeoutId = null;
        this.isCompleted = true;
        this.rejectCompletion(
          new Error(`Job execution timeout after ${timeoutMs}ms`)
        );
      }
    }, timeoutMs);

    return this.completionPromise;
  }

  stopJob(): void {
    // Clean up timeout when stopping the job
    this.clearTimeout();
    // this.socket?.send(JSON.stringify({ action: "stop", jobId }));
    this.socket?.close();
  }
}

if (
  RUN_KUBERNETES_JOBS &&
  process.argv[2] &&
  process.argv[3] &&
  process.argv[4]
) {
  logger.debug(`${process.argv}`);
  const args = z
    .object({
      projectExId: z.string().min(1, 'projectExId is required'),
      wsUrl: z.url('wsUrl must be a valid URL'),
      promptTemplate: z.string().min(1, 'promptTemplate is required'),
    })
    .parse({
      projectExId: process.argv[2] || '',
      wsUrl: process.argv[3] || '',
      promptTemplate: process.argv[4] || '',
    });

  const evaluationJobRunner = new EvaluationJobRunner(
    args.projectExId,
    args.wsUrl,
    args.promptTemplate
  );

  evaluationJobRunner.startJob();

  // Wait for completion and output the result as JSON for the parent process to read
  evaluationJobRunner
    .waitForCompletion()
    .then((result) => {
      // Output the result as a special marker line that can be parsed from logs
      console.log(`JOB_RESULT_JSON: ${JSON.stringify(result)}`);
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Job execution failed:', error);
      process.exit(1);
    });
}
