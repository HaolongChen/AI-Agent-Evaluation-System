import type { Account } from "../entity/account.entity.ts";
import type { NetworkClient } from "../entity/network-client.entity.ts";

export class NetworkAccount {
  assignNetworkToAccount(account: Account, networkClient: NetworkClient) {
    networkClient.setHeader("Authorization", account.getData("accessToken"));
  }
}
