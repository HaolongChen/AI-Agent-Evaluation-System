import { WebSocket } from 'ws';
import * as z from 'zod';
import { RUN_KUBERNETES_JOBS } from '../config/env.ts';
import { logger } from '../utils/logger.ts';
import { appendFileSync } from 'fs';
import {
  CopilotMessageType,
  type CopilotMessage,
  type HumanInputMessage,
  type InitialStateMessage,
  type SystemStatusMessage,
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

const DISCONNECT = false;

export class EvaluationJobRunner {
  private projectExId: string;
  private wsUrl: string;
  private promptTemplate: string;
  response: string = '';

  constructor(projectExId: string, wsUrl: string, promptTemplate: string) {
    this.projectExId = projectExId;
    this.wsUrl = wsUrl;
    this.promptTemplate = promptTemplate;
  }

  socket: WebSocket | null = null;

  connect(): void {
    this.socket = new WebSocket(this.wsUrl);

    if (DISCONNECT) {
      this.stopJob();
    }

    this.socket.on('open', () => {
      logger.info('WebSocket connection established.');
    });

    this.socket.on('message', (data) => {
      this.handleMessage(data);
    });

    this.socket.on('close', () => {
      logger.info('WebSocket connection closed.');
    });

    this.socket.on('error', (error) => {
      logger.error('WebSocket error:', error);
    });
  }

  handleMessage(message: WebSocket.RawData): void {
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
        this.handleToolCallsMessage(data[0] as ToolCallsMessage);
        break;
      case CopilotMessageType.AI_RESPONSE:
        this.handleAIResponseMessage(data[0] as CopilotMessage);
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
      this.stopJob();
    }
    if (message.currentJobIsRunning === true) {
      logger.info(`Job for project ${this.projectExId} is running.`);
    }
    logger.info(`Received initial state for project ${this.projectExId}.`);
    const response: HumanInputMessage = {
      type: CopilotMessageType.HUMAN_INPUT,
      content: this.promptTemplate,
    };
    this.socket?.send(JSON.stringify(response));
  }

  handleSystemStatusMessage(message: SystemStatusMessage): void {
    logger.info(
      `Received system status for project ${this.projectExId}: ${message.content}.`
    );
    // Handle system status message as needed
  }

  handleToolCallsMessage(message: ToolCallsMessage): void {
    logger.info(
      `Received tool calls for project ${this.projectExId}: ${JSON.stringify(
        message
      )}.`
    );
    // TODO:Handle tool calls message as needed
  }

  handleAIResponseMessage(message: CopilotMessage): void {
    logger.info(
      `Received AI response for project ${this.projectExId}: ${JSON.stringify(
        message
      )}.`
    );
    this.response = JSON.stringify(message);
    this.stopJob();
    // TODO:Handle AI response message as needed
  }

  runToolCalls = async (toolCalls: ToolCall[]) => {
    const product = (() => {
      return false;
    })()
      ? Product.MOMEN
      : Product.ZION;
    const clientType =
      (() => {
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
      const result: CopilotApiResult = Copilot.toolCalls(
        assertNotNull(TypeSystemStore.schemaGraph),
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
        return { result, successful: true };
      }
      if (NODE_ENV === 'development') {
        logger.debug('toolCall---schemaDiff:', schemaDiff);
      }
      const applyResult = applyLocalCrdtDiff(schemaDiff, {
        isPendingApplication: true,
      });
      if (applyResult.successful) {
        return { result, successful: true };
      }
      throw getError(JSON.stringify(applyResult.errorContent), result);
    } catch (error: unknown) {
      console.log('toolCall---error:', error, toolCalls);
      return {
        successful: false,
        errorMessage: (error as unknown as { message: string }).message,
        result: (error as unknown as { result: unknown }).result,
      };
    }
  };

  startJob(): void {
    this.connect();
    // this.socket?.send(JSON.stringify({ action: "start", jobId }));
  }

  stopJob(): void {
    // this.socket?.send(JSON.stringify({ action: "stop", jobId }));
    this.socket?.close();
  }
}

if (RUN_KUBERNETES_JOBS) {
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
}
