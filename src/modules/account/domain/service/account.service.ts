import type { NetworkClientEntity } from "../../../shared/domain/entity/network-client.entity.ts";
import { AccountEntity } from "../entity/account.entity.ts";
import type { AccountInfo } from "../schema/account.schema.ts";

export class AccountService {
  private readonly TTL_MS = 3_600_000; // 1 hour
  private timeout: NodeJS.Timeout | undefined;
  public account: AccountEntity;
  public isLoggedIn = false;
  constructor(
    phoneNumber: string,
    password: string,
    private networkClient: NetworkClientEntity,
  ) {
    this.account = new AccountEntity({ phoneNumber, password });

    this.networkClient.setHeader("X-Session-Id", crypto.randomUUID());
  }

  handleLogin(accountInfo: AccountInfo, force: boolean = false) {
    if (this.isLoggedIn && !force) return;
    this.account.setAccountInfo(accountInfo);
    this.networkClient.setHeader("Authorization", accountInfo.accessToken);
    this.timeout = setTimeout(() => {
      this.account.clearToken();
      this.isLoggedIn = false;
      clearTimeout(this.timeout);
    }, this.TTL_MS);
    this.isLoggedIn = true;
  }
}
