import type { Account } from "../entity/account.entity.ts";
import { NetworkClient } from "../entity/network-client.entity.ts";

export class NetworkAccount {
  assignNetworkToAccount(account: Account, networkClient: NetworkClient) {
    networkClient.setHeader("Authorization", account.getData("accessToken"));
  }

  getDefaultNetworkClientForAccount ( account: Account ): NetworkClient
  {
    const networkClient = NetworkClient.createDefault();
    this.assignNetworkToAccount(account, networkClient);
    return networkClient;
  }
}
