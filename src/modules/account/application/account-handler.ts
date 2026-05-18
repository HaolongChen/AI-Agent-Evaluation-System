import { login } from "../infrastructure/login.ts";
import { AccountService } from "../domain/service/account.service.ts";
import { NetworkClient } from "../../shared/application/graphql-client.ts";

export class Account extends AccountService {
  private networkClient: NetworkClient;
  private _sessionId: string;
  constructor(
    phoneNumber: string,
    password: string,
    _url?: string,
    headers?: Record<string, string>,
  ) {
    super(phoneNumber, password);
    this._sessionId = crypto.randomUUID();
    this.networkClient = new NetworkClient(_url, {
      ...headers,
      "X-Session-ID": this._sessionId,
    });
  }

  get sessionId(): string {
    return this._sessionId;
  }

  set sessionId(value: string) {
    this._sessionId = value;
    this.networkClient.setHeader("X-Session-ID", value);
  }

  async getGQLClient() {
    await this.ensureLoggedIn();
    this.networkClient.setHeader("Authorization", `Bearer ${this.accessToken}`);
    return this.networkClient.buildGQLClient();
  }

  async getWsClient() {
    await this.ensureLoggedIn();
    this.networkClient.setHeader("Authorization", `Bearer ${this.accessToken}`);
    return this.networkClient.buildWsClient();
  }

  async login() {
    const accountInfo = await login(
      this.account.data.phoneNumber,
      this.account.data.password,
    );
    this.handleLogin(accountInfo);
  }

  async ensureLoggedIn() {
    if (!this.account.getAccountInfo()?.accessToken) {
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
