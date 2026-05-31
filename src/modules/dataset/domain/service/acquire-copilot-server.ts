import type { AccountService } from "../../../account/domain/service/account.service.ts";
import type { CopilotServerEntity } from "../entity/copilot-server.entity.ts";

export class AcquireCopilotServer {
  constructor(private accountService: AccountService) {}

  async acquire(
    acquireFunction: (...arguments_: unknown[]) => Promise<CopilotServerEntity>,
  ): Promise<CopilotServerEntity> {
    const copilotServer = await acquireFunction();
    this.accountService.updateGQLEndpoint(copilotServer.getData("gqlEndpoint"));
    this.accountService.updateWebSocketEndpoint(
      copilotServer.getData("wsEndpoint"),
    );
    return copilotServer;
  }
}
