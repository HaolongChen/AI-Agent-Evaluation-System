import { gql } from "graphql-tag";
import type {
	LoginMutation,
	LoginMutationVariables,
	LoginWithPhoneNumberMutation,
	LoginWithPhoneNumberMutationVariables,
} from "../../../graphql/generated/types.ts";
import type { AccountInfo } from "../domain/schema/account.schema.ts";
import type { ILoginService } from "../domain/interface/login.interface.ts";
import type { IGQLClient } from "../domain/interface/graphql-client.interface.ts";
import { AccountEntity } from "../domain/entity/account.entity.ts";

// ---------------------------------------------------------------------------
// Document
// ---------------------------------------------------------------------------

const ORGANIZATION_FRAGMENT = gql`
	fragment organizationFragment on Organization {
		exId
		name
	}
`;

const ACCOUNT_FRAGMENT = gql`
	fragment accountInfoFragment on AccountInfo {
		accessToken
		account {
			exId
			username
			currentOrganization {
				...organizationFragment
			}
		}
	}
	${ORGANIZATION_FRAGMENT}
`;

const LOGIN_MUTATION = gql`
	mutation LoginWithPhoneNumber($phoneNumber: String!, $password: String!) {
		loginWithPhoneNumber(phoneNumber: $phoneNumber, password: $password) {
			...accountInfoFragment
		}
	}
	${ACCOUNT_FRAGMENT}
`;

const LOGIN_WITH_PASSWORD_MUTATION = gql`
	mutation Login($username: String!, $password: String!) {
		login(username: $username, password: $password) {
			...accountInfoFragment
		}
	}
	${ACCOUNT_FRAGMENT}
`;

// ---------------------------------------------------------------------------
// Login function
// ---------------------------------------------------------------------------

const accountInfoMapper = (
	data:
		| LoginWithPhoneNumberMutation["loginWithPhoneNumber"]
		| LoginMutation["login"],
): AccountInfo => {
	return {
		accessToken: data!.accessToken!,
		...data!.account!,
		organizationExId: data!.account!.currentOrganization.exId,
		organizationName: data!.account!.currentOrganization.name!,
	};
};

export class LoginService implements ILoginService {
	async loginWithPhoneNumber(
		phoneNumber: string,
		password: string,
		gqlClient: IGQLClient,
	): Promise<AccountEntity> {
		const info = await gqlClient.gqlRequest<
			LoginWithPhoneNumberMutation,
			LoginWithPhoneNumberMutationVariables
		>(LOGIN_MUTATION, {
			phoneNumber,
			password,
		});
		return new AccountEntity({
			type: "phone",
			value: phoneNumber,
			password,
			...accountInfoMapper(info.loginWithPhoneNumber),
		});
	}

	private accountInfoMapper = (
		data: LoginWithPhoneNumberMutation["loginWithPhoneNumber"],
	): AccountInfo => {
		if (!data || !data.account?.currentOrganization) {
			throw new Error("Login failed: No account information returned.");
		}
		return {
			accessToken: data.accessToken!,
			organizationExId: data.account.currentOrganization.exId,
			organizationName: data.account.currentOrganization.name!,
			username: data.account.username,
			exId: data.account.exId,
		};
	};

	async loginWithUsername(
		username: string,
		password: string,
		gqlClient: IGQLClient,
	): Promise<AccountEntity> {
		const info = await gqlClient.gqlRequest<
			LoginMutation,
			LoginMutationVariables
		>(LOGIN_WITH_PASSWORD_MUTATION, {
			username,
			password,
		});
		return new AccountEntity({
			type: "username",
			value: username,
			password,
			...accountInfoMapper(info.login),
		});
	}
}
