import type { NetworkClientEntity } from "../entity/network-client.entity.ts";
import type { IGQLClient } from "../interface/graphql-client.interface.ts";
import type { IWebSocketClient } from "../interface/websocket-client.interface.ts";
import { AccountEntity } from "../entity/account.entity.ts";
import type { AccountInfo } from "../schema/account.schema.ts";

export class NetworkAccount {
  private readonly TTL_MS = 3_600_000; // 1 hour
  private timeout: NodeJS.Timeout | undefined;
  constructor(
    public account: AccountEntity,
    public networkClientEntity: NetworkClientEntity,
    public readonly gqlClient: IGQLClient,
    public readonly wsClient: IWebSocketClient,
  ) {}

  resetNetwork = () => {
    this.networkClientEntity.setHeader("Authorization", "");
    this.networkClientEntity.setHeader("X-SESSION-ID", "");
    this.account.clearToken();
  };

  loginManager(accountInfo: AccountInfo) {
    this.account.setAccountInfo(accountInfo);
    this.networkClientEntity.setHeader(
      "Authorization",
      accountInfo.accessToken,
    );
    this.timeout = setTimeout(async () => {
      this.resetNetwork();
      clearTimeout(this.timeout);
    }, this.TTL_MS);
  }
}
