import type { NetworkClient } from "../../../account/domain/entity/network-client.entity.ts";
import type { CopilotServerEntity } from "../entity/copilot-server.entity.ts";

export class CopilotServerProvider {
	configure(networkClient: NetworkClient, copilotServer: CopilotServerEntity) {
		networkClient.setGraphQLUrl(copilotServer.getData("gqlEndpoint"));
		networkClient.setWebSocketUrl(copilotServer.getData("wsEndpoint"));
	}
}
