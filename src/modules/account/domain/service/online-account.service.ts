import type { NetworkClientService } from "../../../shared/domain/service/network-client.service.ts";
import { AccountEntity } from "../entity/account.entity.ts";
import type { ILoginService } from "../interface/login.interface.ts";

export class OnlineAccount extends AccountEntity {
	private readonly TTL_MS = 3_600_000; // 1 hour
	private timeout: NodeJS.Timeout | undefined;
	public isLoggedIn = false;
	constructor(
		data: {
			phoneNumber: string;
			password: string;
		},
		private networkService: NetworkClientService,
		private loginService: ILoginService,
	) {
		super(data, networkService.networkServer);
	}

	async login() {
		const accountInfo = await this.loginService.login(
			super.getLoginParameters(),
			this.networkService.gqlClient,
		);
		this.setAccountInfo(accountInfo);
		this.timeout = setTimeout(() => {
			this.clearToken();
			this.isLoggedIn = false;
			clearTimeout(this.timeout);
		}, this.TTL_MS);
		this.isLoggedIn = true;
  }

  get gqlClient ()
  {
    return this.networkService.gqlClient;
  }

  get wsClient ()
  {
    return this.networkService.wsClient;
  }
}
