import type { NetworkClientEntity } from "../domain/entity/network-client.entity.ts";
import type { IGQLClient } from "../domain/interface/graphql-client.interface.ts";
import type { INetworkFactoryClient } from "../domain/interface/network-factory.interface.ts";
import type { INetworkService } from "../domain/interface/network-service.interface.ts";
import type { IWebSocketClient } from "../domain/interface/websocket-client.interface.ts";
import { GQLClient } from "./graphql-client.ts";
import { WebSocketClient } from "./websocket-client.ts";

export class NetworkClient implements INetworkFactoryClient, INetworkService {
	buildGQLClient(data: {
		url: string;
		headers: Record<string, string>;
	}): IGQLClient {
		return new GQLClient(data.url, data.headers);
	}
	buildWebSocketClient(data: {
		url: string;
		headers: Record<string, string>;
	}): IWebSocketClient {
		return new WebSocketClient(data.url, data.headers);
	}

	public gqlClient(data: NetworkClientEntity): IGQLClient {
		return this.buildGQLClient(data.getUrlAndHeaderForGraphQL());
	}

	public wsClient(data: NetworkClientEntity): IWebSocketClient {
		return this.buildWebSocketClient(
			data.getUrlAndHeaderForWebSocket(),
		);
	}
}
