import type { IGQLClient } from "../interface/graphql-client.interface.ts";
import type { INetworkFactoryClient } from "../interface/network-factory.interface.ts";
import type { INetworkService } from "../interface/network-service.interface.ts";
import type { IWebSocketClient } from "../interface/websocket-client.interface.ts";

export class NetworkClientService implements INetworkService {
	constructor(private networkService: INetworkFactoryClient) {}

	public gqlClient(data: {
		url: string;
		headers: Record<string, string>;
	}): IGQLClient {
		return this.networkService.buildGQLClient(data.url, data.headers);
	}

	public wsClient(data: {
		url: string;
		headers: Record<string, string>;
	}): IWebSocketClient {
		return this.networkService.buildWebSocketClient(
			data.url,
			data.headers,
		);
	}
}
