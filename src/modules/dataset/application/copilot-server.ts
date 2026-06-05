import type { ICopilotServerRepository } from "../domain/interface/copilot-server.interface.ts";

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
