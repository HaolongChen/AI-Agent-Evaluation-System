import { gql } from "graphql-tag";
import type {
  LoginMutation,
  LoginMutationVariables,
  LoginWithPhoneNumberMutation,
  LoginWithPhoneNumberMutationVariables,
} from "../../../graphql/generated/types.ts";
import { logger } from "../../shared/infrastructure/logger.ts";
import type {
  AccountInfo,
  accountSchema,
} from "../domain/schema/account.schema.ts";
import type { ILoginService } from "../domain/interface/login.interface.ts";
import type { IGQLClient } from "../../shared/domain/interface/graphql-client.interface.ts";
import type { z } from "zod";

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

export class LoginService implements ILoginService {
  private async loginWithPhoneNumber(
    data: z.infer<typeof accountSchema>,
    gqlClient: IGQLClient,
  ): Promise<AccountInfo> {
    const info = await gqlClient.gqlRequest<
      LoginWithPhoneNumberMutation,
      LoginWithPhoneNumberMutationVariables
    >(LOGIN_MUTATION, data);
    return info.loginWithPhoneNumber as AccountInfo;
  }

  private async loginWithUsername(
    data: z.infer<typeof accountSchema>,
    gqlClient: IGQLClient,
  ): Promise<AccountInfo> {
    const info = await gqlClient.gqlRequest<
      LoginMutation,
      LoginMutationVariables
    >(LOGIN_WITH_PASSWORD_MUTATION, {
      username: data.phoneNumber,
      password: data.password,
    });
    return info.login as AccountInfo;
  }

  login = async (
    data: z.infer<typeof accountSchema>,
    gqlClient: IGQLClient,
  ): Promise<AccountInfo> => {
    try {
      const accountInfo =
        data.phoneNumber.startsWith("+") || /^\d+$/.test(data.phoneNumber)
          ? await this.loginWithPhoneNumber(data, gqlClient)
          : await this.loginWithUsername(data, gqlClient);

      if (!accountInfo.accessToken) {
        throw new Error("Login failed: No access token received");
      }

      return accountInfo;
    } catch (error) {
      logger.error("Error during login:", error);
      throw new Error("Failed to login", { cause: error });
    }
  };
}
