import type { IGQLClient } from "../domain/interface/graphql-client.interface.ts";
import type { INetworkFactoryClient } from "../domain/interface/network-factory.interface.ts";
import type { IWebSocketClient } from "../domain/interface/websocket-client.interface.ts";
import { GQLClient } from "./graphql-client.ts";
import { WebSocketClient } from "./websocket-client.ts";

export class NetworkClient implements INetworkFactoryClient {
  buildGQLClient(url: string, headers: Record<string, string>): IGQLClient {
    return new GQLClient(url, headers);
  }
  buildWebSocketClient(
    url: string,
    headers: Record<string, string>,
  ): IWebSocketClient {
    return new WebSocketClient(url, headers);
  }
}
