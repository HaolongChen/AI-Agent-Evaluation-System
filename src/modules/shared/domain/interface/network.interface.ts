import type { IGQLClient } from "./graphql-client.interface.ts";
import type { IWebSocketClient } from "./websocket-client.interface.ts";

export interface INetworkClient {
  buildGQLClient(url: string, headers: Record<string, string>): IGQLClient;
  buildWebSocketClient(
    url: string,
    headers: Record<string, string>,
  ): IWebSocketClient;
}
