import type z from "zod";
import {
	Entity,
	type EntityMetadata,
} from "../../../shared/domain/entity/entity.ts";
import { accountSchema, type AccountInfo } from "../schema/account.schema.js";
import type { NetworkClientEntity } from "../../../shared/domain/entity/network-client.entity.ts";

export class AccountEntity extends Entity<
	typeof accountSchema,
	{ accountInfo?: AccountInfo } & EntityMetadata
> {
	constructor(
		data: z.infer<typeof accountSchema>,
		private networkClient: NetworkClientEntity,
		id?: string,
	) {
		super(data, accountSchema, { id });
	}

	protected setAccountInfo(accountInfo: AccountInfo) {
		this.setData({ accountInfo: accountInfo });
		this.networkClient.setHeader("Authorization", accountInfo.accessToken);
	}

	private getAccountInfo(): AccountInfo {
		const accountInfo = this.getData("accountInfo");
		if (!accountInfo) {
			throw new Error("Account info is not set");
		}
		return accountInfo;
	}

	protected getLoginParameters(): z.infer<typeof accountSchema> {
		return {
			phoneNumber: this.getData("phoneNumber"),
			password: this.getData("password"),
		};
	}

	getOrganizationExId(): string {
		const id = this.getAccountInfo().account.currentOrganization.exId;
		if (!id) {
			throw new Error("Organization ExId is not available");
		}
		return id;
	}

	getUsername(): string {
		const username = this.getAccountInfo().account.username;
		if (!username) {
			throw new Error("Username is not available");
		}
		return username;
	}

	getAccessToken(): string {
		const token = this.getAccountInfo().accessToken;
		if (!token) {
			throw new Error("Access token is not available");
		}
		return token;
	}

	clearToken() {
		this.setAccountInfo({} as AccountInfo);
	}
}
