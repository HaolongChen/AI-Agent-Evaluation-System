import type { AccountService } from "../../account/domain/service/online-account.service.ts";
import type { ICopilotServerRepository } from "../domain/interface/copilot-server.interface.ts";
import { AcquireCopilotServer } from "../domain/service/copilot-server-client.ts";

export class GetCopilotServerUseCase {
  private acquireCopilotServer: AcquireCopilotServer;
  constructor(
    private repository: ICopilotServerRepository,
    accountService: AccountService,
  ) {
    this.acquireCopilotServer = new AcquireCopilotServer(accountService);
  }

  async execute() {
    return await this.acquireCopilotServer.acquire(
      this.repository.getDefault.bind(this.repository),
    );
  }
}
