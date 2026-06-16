import type { NetworkClient } from "../entity/network-client.entity.ts";
import type { IGQLClient } from "./graphql-client.interface.ts";
import type { IWebSocketClient } from "./websocket-client.interface.ts";

export interface INetworkService {
  gqlClient(data: NetworkClient): IGQLClient;
  wsClient(data: NetworkClient): IWebSocketClient;
}
