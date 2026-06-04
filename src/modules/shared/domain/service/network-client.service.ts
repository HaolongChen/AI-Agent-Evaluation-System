import type { NetworkClientEntity } from "../entity/network-client.entity.ts";
import type { IGQLClient } from "../interface/graphql-client.interface.ts";
import type {
	INetworkClient
} from "../interface/network.interface.ts";
import type { IWebSocketClient } from "../interface/websocket-client.interface.ts";

export class NetworkClientService {
	private _gqlClient: IGQLClient;
	private _webSocketClient: IWebSocketClient;
	constructor(
		private networkService: INetworkClient,
		public networkServer: NetworkClientEntity,
	) {
		const gqlInfo = this.networkServer.getUrlAndHeaderForGraphQL();
		const wsInfo = this.networkServer.getUrlAndHeaderForWebSocket();
		if (!gqlInfo || !wsInfo) {
			throw new Error(
				"Failed to initialize NetworkClientService: Missing GraphQL or WebSocket configuration",
			);
		}
		this._gqlClient = this.networkService.buildGQLClient(
			gqlInfo.url,
			gqlInfo.headers,
		);
		this._webSocketClient = this.networkService.buildWebSocketClient(
			wsInfo.url,
			wsInfo.headers,
		);
	}

	get gqlClient (): IGQLClient
	{
		const info = this.networkServer.getUrlAndHeaderForGraphQL();
		if ( info === null )
		{
			return this._gqlClient;
		}
		this._gqlClient = this.networkService.buildGQLClient(info.url, info.headers);
		return this._gqlClient;
	}

	get wsClient (): IWebSocketClient
	{
		const info = this.networkServer.getUrlAndHeaderForWebSocket();
		if ( info === null )
		{
			return this._webSocketClient;
		}
		this._webSocketClient = this.networkService.buildWebSocketClient(info.url, info.headers);
		return this._webSocketClient;
	}
}
