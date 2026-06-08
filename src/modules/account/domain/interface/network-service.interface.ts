import type { IGQLClient } from "./graphql-client.interface.ts";
import type { IWebSocketClient } from "./websocket-client.interface.ts";

export interface INetworkService
{
  gqlClient(data: { url: string; headers: Record<string, string> }): IGQLClient;
  wsClient(data: { url: string; headers: Record<string, string> }): IWebSocketClient;
}