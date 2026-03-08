import { gql } from 'graphql-request';
import { logger } from './logger.ts';
import { backendClient, gqlRequest } from './graphql-client.ts';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface LoginVariables {
  phoneNumber: string;
  password: string;
}

interface LoginResponse {
  loginWithPhoneNumber: {
    accessToken: string;
  };
}

// ---------------------------------------------------------------------------
// Document
// ---------------------------------------------------------------------------

const LOGIN_MUTATION = gql`
  mutation LoginWithPhoneNumber($phoneNumber: String!, $password: String!) {
    loginWithPhoneNumber(phoneNumber: $phoneNumber, password: $password) {
      accessToken
    }
  }
`;

// ---------------------------------------------------------------------------
// Login function
// ---------------------------------------------------------------------------

export const login = async (
  phoneNumber: string,
  password: string,
): Promise<string> => {
  try {
    logger.info('Attempting login for phone number:', `***${phoneNumber.slice(-4)}`);

    const data = await gqlRequest<LoginResponse, LoginVariables>(
      backendClient,
      LOGIN_MUTATION,
      { phoneNumber, password },
    );

    const accessToken = data.loginWithPhoneNumber.accessToken;

    if (!accessToken) {
      throw new Error('No access token received from login');
    }

    logger.info('Login successful');
    return accessToken;
  } catch (error) {
    logger.error('Error during login:', error);
    throw new Error('Failed to login', { cause: error });
  }
};
