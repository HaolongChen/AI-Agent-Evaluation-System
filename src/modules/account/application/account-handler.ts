import { AccountService } from "../domain/service/account.service.ts";
import { logger } from "../../shared/infrastructure/logger.ts";
import type { ILoginService } from "../domain/interface/login.interface.ts";
import type { NetworkClientEntity } from "../../shared/domain/entity/network-client.entity.ts";
import type { IGQLClient } from "../../shared/domain/interface/graphql-client.interface.ts";
import type { IWebSocketClient } from "../../shared/domain/interface/websocket-client.interface.ts";
import { GQLClient } from "../../shared/application/graphql-client.ts";
import { WebSocketClient } from "../../shared/application/websocket-client.ts";

export class Account extends AccountService {
  public gqlClient: IGQLClient;
  public wsClient: IWebSocketClient;
  constructor(
    private loginService: ILoginService,
    phoneNumber: string,
    password: string,
    networkClient: NetworkClientEntity,
  ) {
    logger.info("Initializing Account with phoneNumber:", phoneNumber);
    super(phoneNumber, password, networkClient);
    this.gqlClient = new GQLClient(networkClient);
    this.wsClient = new WebSocketClient(networkClient);
  }

  private async login() {
    const accountInfo = await this.loginService.login(
      this.account.getData("phoneNumber"),
      this.account.getData("password"),
      this.gqlClient,
    );
    this.handleLogin(accountInfo);
  }

  async ensureLoggedIn() {
    if (!this.isLoggedIn) {
      await this.login();
    }
  }

  get accessToken(): string {
    const token = this.account.getAccountInfo()?.accessToken;
    if (!token) {
      throw new Error("No access token available");
    }
    return token;
  }

  get username(): string | undefined {
    return this.account.getAccountInfo()?.account?.username;
  }
}
