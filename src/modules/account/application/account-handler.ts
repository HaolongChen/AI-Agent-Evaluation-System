import { login } from "../infrastructure/login.ts";
import { AccountService } from "../domain/service/account.service.ts";
import {
  NetworkClient,
  type GQLClient,
  type WebSocketClient,
} from "../../shared/application/graphql-client.ts";

export class Account extends AccountService {
  private networkClient: NetworkClient;
  private gqlClient: GQLClient | undefined;
  private wsClient: WebSocketClient | undefined;
  private _sessionId: string;
  constructor(
    phoneNumber: string,
    password: string,
    _url?: string,
    headers?: Record<string, string>,
  ) {
    console.log("Initializing Account with phoneNumber:", phoneNumber);
    super(phoneNumber, password);
    this._sessionId = crypto.randomUUID();
    this.networkClient = new NetworkClient(_url, {
      ...headers,
      "X-Session-Id": this._sessionId,
    });
  }

  get sessionId(): string {
    return this._sessionId;
  }

  set sessionId(value: string) {
    this._sessionId = value;
    this.networkClient.setHeader("X-Session-Id", value);
  }

  setAccessToken(token: string) {
    const exId = this.exId;
    if (!exId) {
      throw new Error("Account exId is required to set access token");
    }
    this.account.setAccountInfo({
      accessToken: token,
      account: { exId: this.exId },
    });
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

  async login() {
    const accountInfo = await login(
      this.account.data.phoneNumber,
      this.account.data.password,
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

  get exId(): string | undefined {
    return this.account.getAccountInfo()?.account?.exId;
  }
}
