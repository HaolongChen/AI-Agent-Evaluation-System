import type { Account } from "../entity/account.entity.ts";
import { NetworkClient } from "../entity/network-client.entity.ts";

export class NetworkAccount {
  getDefaultNetworkClientForAccount(account: Account): NetworkClient {
    const networkClient = NetworkClient.createDefault();
    account.acquireNetwork(networkClient);
    return networkClient;
  }
}
