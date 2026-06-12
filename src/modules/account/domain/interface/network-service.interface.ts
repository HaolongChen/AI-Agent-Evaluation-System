import type { NetworkClientEntity } from "../entity/network-client.entity.ts";
import type { IGQLClient } from "./graphql-client.interface.ts";
import type { IWebSocketClient } from "./websocket-client.interface.ts";

export interface INetworkService {
  gqlClient(data: NetworkClientEntity): IGQLClient;
  wsClient(data: NetworkClientEntity): IWebSocketClient;
}
