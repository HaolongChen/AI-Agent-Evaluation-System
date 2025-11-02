import { WebSocket } from 'ws';
import * as z from 'zod';

class EvaluationJobRunner {
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

    this.socket.on("open", () => {
      console.log("WebSocket connection established.");
    });

    this.socket.on("message", (data) => {
      this.handleMessage(data);
    });

    this.socket.on("close", () => {
      console.log("WebSocket connection closed.");
    });

    this.socket.on("error", (error) => {
      console.error("WebSocket error:", error);
    });
  }

  handleMessage(message: WebSocket.RawData): void {
    const data = JSON.parse(message.toString());
    console.log("Job Update:", data);
    console.log(`Project ${this.projectExId} - Status: ${data.status}, Progress: ${data.progress}%, promptTemplate: ${this.promptTemplate}`);
    // Handle job updates here (e.g., update database, notify users, etc.)
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

const args = z.object({
	projectExId: z.string().min(1, "projectExId is required"),
	wsUrl: z.url("wsUrl must be a valid URL"),
	promptTemplate: z.string().min(1, "promptTemplate is required"),
}).parse({
	projectExId: process.argv[2] || "",
	wsUrl: process.argv[3] || "",
	promptTemplate: process.argv[4] || "",
});

const evaluationJobRunner = new EvaluationJobRunner(
	args.projectExId,
	args.wsUrl,
	args.promptTemplate
);

evaluationJobRunner.startJob();