import type { NetworkClientEntity } from "../../../shared/domain/entity/network-client.entity.ts";
import type { CopilotServerEntity } from "../entity/copilot-server.entity.ts";

export class CopilotServerClient
{
  private isLocked: boolean = false;
  constructor(private networkClient: NetworkClientEntity) {}

  acquire( copilotServer: CopilotServerEntity
  )
  {
    if(!this.isLocked) {
      throw new Error("Copilot server is not initialized or is locked");
    }
    this.isLocked = true;
    this.networkClient.setGraphQLUrl(copilotServer.getData("gqlEndpoint"));
    this.networkClient.setWebSocketUrl(copilotServer.getData("wsEndpoint"));
  }
}
