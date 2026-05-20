import { gql } from "graphql-request";
import type {
  LoginWithPhoneNumberMutation,
  LoginWithPhoneNumberMutationVariables,
} from "../../../graphql/generated/types.ts";
import { publicNetworkClient } from "../../shared/application/graphql-client.ts";
import type { AccountInfo } from "../domain/schema/account.schema.ts";

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
    const data = await publicNetworkClient
      .buildGQLClient()
      .gqlRequest<
        LoginWithPhoneNumberMutation,
        LoginWithPhoneNumberMutationVariables
      >(LOGIN_MUTATION, { phoneNumber, password });

    const accountInfo = data.loginWithPhoneNumber as AccountInfo;

    if (!accountInfo.accessToken) {
      throw new Error("Login failed: No access token received");
    }

    return accountInfo;
  } catch (error) {
    console.error("Error during login:", error);
    throw new Error("Failed to login", { cause: error });
  }
};
