import type { NetworkClientEntity } from "../../shared/domain/entity/network-client.entity.ts";
import type { INetworkClient } from "../../shared/domain/interface/network.interface.ts";
import { NetworkClientService } from "../../shared/domain/service/network-client.service.ts";
import type { AccountEntity } from "../domain/entity/account.entity.ts";
import type { ILoginService } from "../domain/interface/login.interface.ts";
import { NetworkAccount } from "../domain/service/account.service.ts";

export class OnlineAccount {
  constructor(
    private loginService: ILoginService,
    private networkClient: INetworkClient,
  ) {}

  async bindNetworkToAccount(
    networkClientEntity: NetworkClientEntity,
    account: AccountEntity,
  ): Promise<NetworkAccount> {
    const networkService = new NetworkClientService(
      this.networkClient,
      networkClientEntity,
    );
    const onlineAccount = new NetworkAccount(
      account,
      networkClientEntity,
      networkService.gqlClient,
      networkService.wsClient,
    );
    if (!account.isLoggedIn) {
      onlineAccount.loginManager(
        await this.loginService.login(
          account.getLoginParameters(),
          networkService.gqlClient,
        ),
      );
    }
    return onlineAccount;
  }
}
