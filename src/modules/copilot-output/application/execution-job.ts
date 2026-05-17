import { WebSocket } from "ws";
import {
  CopilotMessageType,
  type CopilotMessage,
} from "../../shared/domain/interface/types.ts";
import { MessageHandler } from "./message-handler.ts";
import { CopilotJobEntity } from "../domain/entity/copilot-job.entity.ts";

export class EvaluationJobRunner {
  private messageHandler: MessageHandler;
  private socket: WebSocket;
  private promise: Promise<string>;
  private resolve: (result: string | PromiseLike<string>) => void;

  constructor(copilotJobEntity: CopilotJobEntity) {
    const { promise, resolve } = Promise.withResolvers<string>();
    this.promise = promise;
    this.resolve = resolve;
    this.messageHandler = new MessageHandler(copilotJobEntity);
    this.socket = new WebSocket(copilotJobEntity.data.wsUrl);
  }

  start() {
    this.socket.addEventListener("open", () => {
      console.info("WebSocket connection opened.");
    });

    this.socket.addEventListener("message", (event) => {
      const response = this.messageHandler.invoke(event.data);
      if (response) {
        for (const message of response.messagesToSend) this.send(message);
        if (response.shouldTerminate) {
          this.send({ type: CopilotMessageType.TERMINATE });
        }
        if (response.result) {
          this.resolve(response.result);
        }
      }
    });

    this.socket.addEventListener("close", () => {
      if (!this.messageHandler.isTerminated) {
        throw new Error("WebSocket closed unexpectedly before job completion");
      }
    });

    this.socket.addEventListener("error", (error) => {
      console.error("WebSocket error:", error);
      if (!this.messageHandler.isTerminated) {
        throw new Error("WebSocket error occurred");
      }
    });
  }

  private send = (data: CopilotMessage): void => {
    if (this.messageHandler.isTerminated) {
      return;
    }
    this.socket.send(JSON.stringify(data));
  };

  public async waitForResult(): Promise<string> {
    return await this.promise;
  }
}
