import { login } from "../infrastructure/login.ts";
import { AccountService } from "../domain/service/account.service.ts";

export class Account extends AccountService {
  constructor(phoneNumber: string, password: string) {
    super(phoneNumber, password);
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
