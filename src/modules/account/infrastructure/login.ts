import { gql } from "graphql-request";
import type {
  LoginMutation,
  LoginMutationVariables,
  LoginWithPhoneNumberMutation,
  LoginWithPhoneNumberMutationVariables,
} from "../../../graphql/generated/types.ts";
import { publicNetworkClient } from "../../shared/application/graphql-client.ts";
import { logger } from "../../shared/infrastructure/logger.ts";
import type { AccountInfo } from "../domain/schema/account.schema.ts";

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

export const login = async (
  phoneNumberOrUsername: string,
  password: string,
): Promise<AccountInfo> => {
  try {
    let phoneNumber: string | undefined;
    let username: string | undefined;
    let accountInfo: AccountInfo | undefined;
    if (
      phoneNumberOrUsername.startsWith("+") ||
      /^\d+$/.test(phoneNumberOrUsername)
    ) {
      phoneNumber = phoneNumberOrUsername;
      const data = await publicNetworkClient
        .buildGQLClient()
        .gqlRequest<
          LoginWithPhoneNumberMutation,
          LoginWithPhoneNumberMutationVariables
        >(LOGIN_MUTATION, { phoneNumber, password });
      accountInfo = data.loginWithPhoneNumber as AccountInfo;
    } else {
      username = phoneNumberOrUsername;
      const data = await publicNetworkClient
        .buildGQLClient()
        .gqlRequest<
          LoginMutation,
          LoginMutationVariables
        >(LOGIN_WITH_PASSWORD_MUTATION, { username, password });
      accountInfo = data.login as AccountInfo;
    }

    if (!accountInfo.accessToken) {
      throw new Error("Login failed: No access token received");
    }

    return accountInfo;
  } catch (error) {
    logger.error("Error during login:", error);
    throw new Error("Failed to login", { cause: error });
  }
};
