import type { Account } from "../domain/entity/account.entity.ts";
import type { NetworkClient } from "../domain/entity/network-client.entity.ts";
import type { ILoginService } from "../domain/interface/login.interface.ts";
import type { INetworkService } from "../domain/interface/network-service.interface.ts";

export class AccountApplicationService {
  constructor(
    private readonly networkService: INetworkService,
    private readonly loginService: ILoginService,
  ) {}

  async loginWithPhoneNumber(
    phoneNumber: string,
    password: string,
    networkClient: NetworkClient,
  ): Promise<Account> {
    const gqlClient = this.networkService.gqlClient(networkClient);
    const account = await this.loginService.loginWithPhoneNumber(
      phoneNumber,
      password,
      gqlClient,
    );
    account.acquireNetwork(networkClient);
    return account;
  }

  async loginWithUsername(
    username: string,
    password: string,
    networkClient: NetworkClient,
  ): Promise<Account> {
    const gqlClient = this.networkService.gqlClient(networkClient);
    const account = await this.loginService.loginWithUsername(username, password, gqlClient);
    account.acquireNetwork(networkClient);
    return account;
  }
}
