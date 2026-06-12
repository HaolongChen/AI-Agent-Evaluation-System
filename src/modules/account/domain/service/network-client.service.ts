import type { NetworkClientEntity } from "../entity/network-client.entity.ts";
import type { IGQLClient } from "../interface/graphql-client.interface.ts";
import type { INetworkFactoryClient } from "../interface/network-factory.interface.ts";
import type { INetworkService } from "../interface/network-service.interface.ts";
import type { IWebSocketClient } from "../interface/websocket-client.interface.ts";

export class NetworkClientService implements INetworkService {
  constructor(private networkService: INetworkFactoryClient) {}

  public gqlClient(data: NetworkClientEntity): IGQLClient {
    return this.networkService.buildGQLClient(data.getUrlAndHeaderForGraphQL());
  }

  public wsClient(data: NetworkClientEntity): IWebSocketClient {
    return this.networkService.buildWebSocketClient(
      data.getUrlAndHeaderForWebSocket(),
    );
  }
}
