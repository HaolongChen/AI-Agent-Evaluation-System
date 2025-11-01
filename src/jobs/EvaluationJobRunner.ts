import WebSocketClient from "../utils/websocket.ts";

export class EvaluationJobRunner {
    private 
    // TODO: implement instances like goldenSets, schemaExId, copilotType, modelName, etc.
//   private wsClient: WebSocketClient;

//   constructor() {
//     this.wsClient = new WebSocketClient(this.handleMessage.bind(this));
//   }

//   startJob(jobId: string, wsUrl: string): void {
//     this.wsClient.connect(wsUrl);
//     this.wsClient.sendMessage(JSON.stringify({ action: "start", jobId }));
//   }

//   handleMessage(message: WebSocket.RawData): void {
//     const data = JSON.parse(message.toString());
//     console.log("Job Update:", data);
//     // Handle job updates here (e.g., update database, notify users, etc.)
//   }

//   stopJob(jobId: string): void {
//     this.wsClient.sendMessage(JSON.stringify({ action: "stop", jobId }));
//     this.wsClient.disconnect();
//   }
}