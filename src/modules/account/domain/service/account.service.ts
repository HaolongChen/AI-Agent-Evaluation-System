import { NetworkClientEntity } from "../entity/network-client.entity.ts";
import type { ILoginService } from "../interface/login.interface.ts";
import type { INetworkService } from "../interface/network-service.interface.ts";
import { Account } from "../aggregate/account.aggregate.ts";

export class NetworkAccount {
	constructor(
		private readonly loginService: ILoginService,
		private readonly networkService: INetworkService,
	) {}

	async loginWithPhoneNumber(
		phoneNumber: string,
		password: string,
	): Promise<Account> {
		const networkClient = NetworkClientEntity.createDefault();
		const gqlClient = this.networkService.gqlClient(
			networkClient.getUrlAndHeaderForGraphQL(),
		);
		const accountInfo = await this.loginService.loginWithPhoneNumber(
			phoneNumber,
			password,
			gqlClient,
		);
		return new Account(accountInfo, networkClient);
	}

	async loginWithUsername(
		username: string,
		password: string,
	): Promise<Account> {
		const networkClient = NetworkClientEntity.createDefault();
		const gqlClient = this.networkService.gqlClient(
			networkClient.getUrlAndHeaderForGraphQL(),
		);
		const accountInfo = await this.loginService.loginWithUsername(
			username,
			password,
			gqlClient,
		);
		return new Account(accountInfo, networkClient);
	}

	async login(account: Account) {
		const gqlClient = this.networkService.gqlClient(
			account.getEntity("networkClient").getUrlAndHeaderForGraphQL(),
		);
		const accountInfo = await this.loginService.loginWithUsername(
			account.loginParameters.username,
			account.loginParameters.password,
			gqlClient,
		);
		return new Account(accountInfo, account.getEntity("networkClient"));
	}
}
