import { AccountEntity } from "../entity/account.entity.ts";
import type { AccountInfo } from "../schema/account.schema.ts";

export class AccountService {
  private readonly TTL_MS = 3_600_000; // 1 hour
  private timeout: NodeJS.Timeout | undefined;
  public account: AccountEntity;
  public isLoggedIn = false;
  constructor(phoneNumber: string, password: string) {
    this.account = new AccountEntity({ phoneNumber, password });
  }

  handleLogin(accountInfo: AccountInfo) {
    if (this.isLoggedIn) return;
    this.account.setAccountInfo(accountInfo);
    this.timeout = setTimeout(() => {
      this.account.clearToken();
      this.isLoggedIn = false;
      clearTimeout(this.timeout);
    }, this.TTL_MS);
    this.isLoggedIn = true;
  }
}
