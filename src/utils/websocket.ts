import { WebSocket } from "ws";
import { logger } from "./logger.ts";

export class WebSocketClient {
  private socket: WebSocket | null = null;
  private fn: (message: WebSocket.RawData) => void;

  constructor(fn: (message: WebSocket.RawData) => void) {
    this.fn = fn;
  }

  connect(url: string): void {
    this.socket = new WebSocket(url);

    this.socket.on("open", () => {
      logger.info("WebSocket connection established.");
    });

    this.socket.on("message", (data) => {
      this.messageResolver(data);
      logger.info("Received message:", data);
    });

    this.socket.on("close", () => {
      logger.info("WebSocket connection closed.");
    });

    this.socket.on("error", (error) => {
      logger.error("WebSocket error:", error);
    });
  }

  messageResolver(message: WebSocket.RawData): void {
    logger.info("Resolving message:", message);
    this.fn(message);
  }

  sendMessage(message: string): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(message);
    } else {
      logger.error("WebSocket is not connected.");
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}