import type { AccountEntity } from "../entity/account.entity.ts";
import type { IGQLClient } from "./graphql-client.interface.ts";

export interface ILoginService {
  loginWithPhoneNumber(
    phoneNumber: string,
    password: string,
    gqlClient: IGQLClient,
  ): Promise<AccountEntity>;
  loginWithUsername(
    username: string,
    password: string,
    gqlClient: IGQLClient,
  ): Promise<AccountEntity>;
}
