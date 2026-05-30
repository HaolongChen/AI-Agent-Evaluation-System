import { AccountService } from "../domain/service/account.service.ts";
import {
  NetworkClient,
  type GQLClient,
  type WebSocketClient,
} from "../../shared/application/graphql-client.ts";
import { logger } from "../../shared/infrastructure/logger.ts";
import type { ILoginService } from "../domain/interface/login.interface.ts";
import type { NetworkClientEntity } from "../../shared/domain/entity/network-client.entity.ts";

export class Account extends AccountService {
  constructor(
    private loginService: ILoginService,
    phoneNumber: string,
    password: string,
    private networkClient: NetworkClientEntity,
  ) {
    logger.info("Initializing Account with phoneNumber:", phoneNumber);
    super(phoneNumber, password);
    this.networkClient.setHeader("X-Session-Id", crypto.randomUUID());
  }

  get sessionId(): string {
    return this._sessionId;
  }

  async getGQLClient(newUrl?: string) {
    await this.ensureLoggedIn();

    this.networkClient.setHeader("Authorization", `Bearer ${this.accessToken}`);
    if (!newUrl && this.gqlClient) {
      return this.gqlClient;
    }
    this.gqlClient = this.networkClient.buildGQLClient(newUrl);
    return this.gqlClient;
  }

  async getWsClient(newUrl?: string) {
    await this.ensureLoggedIn();
    this.networkClient.setHeader("Authorization", `Bearer ${this.accessToken}`);
    if (!newUrl && this.wsClient) {
      return this.wsClient;
    }
    this.wsClient = this.networkClient.buildWsClient(newUrl);
    return this.wsClient;
  }

  clearWsClient() {
    if (this.wsClient) {
      this.wsClient.close();
      this.wsClient = undefined;
    }
  }

  async login() {
    const accountInfo = await this.loginService.login(
      this.account.getData("phoneNumber"),
      this.account.getData("password"),
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
