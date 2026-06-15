import type { NetworkClient } from "../domain/entity/network-client.entity.ts";
import type { IGQLClient } from "../domain/interface/graphql-client.interface.ts";
import type { INetworkService } from "../domain/interface/network-service.interface.ts";
import type { IWebSocketClient } from "../domain/interface/websocket-client.interface.ts";
import { GQLClient } from "./graphql-client.ts";
import { WebSocketClient } from "./websocket-client.ts";

export class NetworkService implements INetworkService {
  private buildGQLClient(data: {
    url: string;
    headers: Record<string, string>;
  }): IGQLClient {
    return new GQLClient(data.url, data.headers);
  }
  private buildWebSocketClient(data: {
    url: string;
    headers: Record<string, string>;
  }): IWebSocketClient {
    return new WebSocketClient(data.url, data.headers);
  }

  public gqlClient(data: NetworkClient): IGQLClient {
    return this.buildGQLClient(data.getUrlAndHeaderForGraphQL());
  }

  public wsClient(data: NetworkClient): IWebSocketClient {
    return this.buildWebSocketClient(data.getUrlAndHeaderForWebSocket());
  }
}
