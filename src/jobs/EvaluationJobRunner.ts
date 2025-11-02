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
	type ToolCallsMessage,
} from '../utils/types.ts';

const DISCONNECT = true;

export class EvaluationJobRunner {
  private projectExId: string;
  private wsUrl: string;
  private promptTemplate: string;

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
		logger.info(`Received system status for project ${this.projectExId}: ${message.content}.`);
		// Handle system status message as needed
	}

	handleToolCallsMessage(message: ToolCallsMessage): void {
		logger.info(`Received tool calls for project ${this.projectExId}: ${JSON.stringify(message)}.`);
		// Handle tool calls message as needed
	}

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
