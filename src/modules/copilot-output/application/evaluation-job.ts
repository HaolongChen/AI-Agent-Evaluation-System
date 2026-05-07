import { WebSocket } from "ws";
import { type CopilotMessage } from "../../../external/types.ts";
import { MessageHandler } from "./message-handler.js";
import { CopilotJobEntity } from "../domain/entity/copilot-job.entity.ts";

export class EvaluationJobRunner {
  private messageHandler: MessageHandler;
  private socket: WebSocket;

  constructor(copilotJobEntity: CopilotJobEntity) {
    this.messageHandler = new MessageHandler(this.send, copilotJobEntity);
    this.socket = new WebSocket(copilotJobEntity.data.wsUrl);
  }

  async start(): Promise<void> {
    this.socket.addEventListener("open", () => {
      console.info("WebSocket connection opened.");
    });

    this.socket.addEventListener("message", (event) => {
      this.messageHandler.invoke(event.data);
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

  private send(data: CopilotMessage): void {
    if (this.messageHandler.isTerminated) {
      throw new Error("Cannot send message after job termination");
    }
    this.socket.send(JSON.stringify(data));
  }
}
