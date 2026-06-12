import type { IGQLClient } from "./graphql-client.interface.ts";
import type { IWebSocketClient } from "./websocket-client.interface.ts";

export interface INetworkFactoryClient {
  buildGQLClient(data: {
    url: string;
    headers: Record<string, string>;
  }): IGQLClient;
  buildWebSocketClient(data: {
    url: string;
    headers: Record<string, string>;
  }): IWebSocketClient;
}
