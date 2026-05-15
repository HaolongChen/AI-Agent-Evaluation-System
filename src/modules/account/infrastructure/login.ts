import { gql } from "graphql-request";
import type {
  LoginWithPhoneNumberMutation,
  LoginWithPhoneNumberMutationVariables,
} from "../../../graphql/generated/resolvers-types.ts";
import { publicNetworkClient } from "../../shared/application/graphql-client.ts";
import type { AccountInfo } from "../domain/schema/account.schema.ts";

// Types
// ---------------------------------------------------------------------------

type AttachAccountInfo<
  T extends LoginWithPhoneNumberMutation,
  K extends AccountInfo["account"],
> = T & { loginWithPhoneNumber?: { account?: K } };

// ---------------------------------------------------------------------------
// Document
// ---------------------------------------------------------------------------

const LOGIN_MUTATION = gql`
  mutation LoginWithPhoneNumber($phoneNumber: String!, $password: String!) {
    loginWithPhoneNumber(phoneNumber: $phoneNumber, password: $password) {
      accessToken
      account {
        exId
      }
    }
  }
`;

// ---------------------------------------------------------------------------
// Login function
// ---------------------------------------------------------------------------

export const login = async (
  phoneNumber: string,
  password: string,
): Promise<AccountInfo> => {
  try {
    console.info(
      "Attempting login for phone number:",
      `***${phoneNumber.slice(-4)}`,
    );

    const data = await publicNetworkClient
      .buildGQLClient()
      .gqlRequest<
        AttachAccountInfo<LoginWithPhoneNumberMutation, AccountInfo["account"]>,
        LoginWithPhoneNumberMutationVariables
      >(LOGIN_MUTATION, { phoneNumber, password });

    const accountInfo = data.loginWithPhoneNumber as AccountInfo;

    if (!accountInfo || !accountInfo.accessToken) {
      throw new Error("Login failed: No access token received");
    }

    return accountInfo;
  } catch (error) {
    console.error("Error during login:", error);
    throw new Error("Failed to login", { cause: error });
  }
};
