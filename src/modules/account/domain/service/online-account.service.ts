import type { NetworkClientService } from "../../../shared/domain/service/network-client.service.ts";
import { AccountEntity } from "../entity/account.entity.ts";
import type { ILoginService } from "../interface/login.interface.ts";

export class OnlineAccount extends AccountEntity {
  private readonly TTL_MS = 3_600_000; // 1 hour
  private timeout: NodeJS.Timeout | undefined;
  constructor(
    account: AccountEntity,
    private networkService: NetworkClientService,
    private loginService: ILoginService,
  ) {
    super(account);
  }

  async login() {
    const accountInfo = await this.loginService.login(
      this.getLoginParameters(),
      this.networkService.gqlClient,
    );
    this.setAccountInfo(accountInfo);
    this.networkService.networkServer.setHeader(
      "Authorization",
      accountInfo.accessToken,
    );
    this.timeout = setTimeout(async () => {
      this.clearToken();
      clearTimeout(this.timeout);
      await this.login();
    }, this.TTL_MS);
  }

  get gqlClient() {
    return this.networkService.gqlClient;
  }

  get wsClient() {
    return this.networkService.wsClient;
  }
}
