import { AccountService } from "../domain/service/account.service.ts";
import { logger } from "../../shared/infrastructure/logger.ts";
import type { ILoginService } from "../domain/interface/login.interface.ts";
import type { IGQLClient } from "../../shared/domain/interface/graphql-client.interface.ts";
import type { IWebSocketClient } from "../../shared/domain/interface/websocket-client.interface.ts";
import { WebSocketClient } from "../../shared/application/websocket-client.ts";
import { GQLClient } from "../../shared/application/graphql-client.ts";

export class Account extends AccountService {
  public gqlClient: IGQLClient;
  public wsClient: IWebSocketClient;
  constructor(
    private loginService: ILoginService,
    phoneNumber: string,
    password: string,
  ) {
    logger.info("Initializing Account with phoneNumber:", phoneNumber);
    super(phoneNumber, password);
    this.gqlClient = new GQLClient(this.networkClient);
    this.wsClient = new WebSocketClient(this.networkClient);
  }

  private async login() {
    const accountInfo = await this.loginService.login(
      this.account.getData("phoneNumber"),
      this.account.getData("password"),
      this.gqlClient,
    );
    this.handleLogin(accountInfo, true);
  }

  async ensureLoggedIn() {
    if (!this.isLoggedIn) {
      await this.login();
    }
  }
}
