import type { Account } from "../../../account/domain/aggregate/account.aggregate.ts";
import type { CopilotServerEntity } from "../../../dataset/domain/entity/copilot-server.entity.ts";

export class CopilotServerHandler {
	invoke(data: CopilotServerEntity, account: Account) {
		const networkClient = account.getEntity("networkClient");
		networkClient.setGraphQLUrl(data.getData("gqlEndpoint"));
		networkClient.setWebSocketUrl(data.getData("wsEndpoint"));
	}
}
