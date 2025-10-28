import { WebSocket } from "ws";

class WebSocketClient {
  private socket: WebSocket | null = null;

  connect(url: string): void {
    this.socket = new WebSocket(url);

    this.socket.on("open", () => {
      console.log("WebSocket connection established.");
    });

    this.socket.on("message", (data) => {
      this.messageResolver(data);
      console.log("Received message:", data);
    });

    this.socket.on("close", () => {
      console.log("WebSocket connection closed.");
    });

    this.socket.on("error", (error) => {
      console.error("WebSocket error:", error);
    });
  }

  messageResolver(message: WebSocket.RawData): void {
    console.log("Resolving message:", message);
  }

  sendMessage(message: string): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(message);
    } else {
      console.error("WebSocket is not connected.");
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

export default WebSocketClient;