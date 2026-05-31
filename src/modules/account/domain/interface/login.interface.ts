import type { IGQLClient } from "../../../shared/domain/interface/graphql-client.interface.ts";
import type { AccountInfo } from "../schema/account.schema.ts";

export interface ILoginService {
  login(
    phoneNumber: string,
    password: string,
    gqlClient: IGQLClient,
  ): Promise<AccountInfo>;
  login(
    username: string,
    password: string,
    gqlClient: IGQLClient,
  ): Promise<AccountInfo>;
}
