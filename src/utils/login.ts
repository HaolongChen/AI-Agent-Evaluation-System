import { logger } from './logger.ts';
import { graphqlUtils } from './graphql-utils.ts';

export const login = async (
  phoneNumber: string,
  password: string
): Promise<string> => {
  const query = `
      mutation LoginWithPhoneNumber {
        loginWithPhoneNumber(
          phoneNumber: "${phoneNumber}"
          password: "${password}"
        ) {
          accessToken
        }
      }
    `;

  try {
    logger.info('Attempting login for phone number:', phoneNumber);
    const response = await graphqlUtils.accessEndpointWithQuery(query, true);

    const data = response as {
      data?: {
        loginWithPhoneNumber?: {
          accessToken: string;
        };
      };
      errors?: Array<{ message: string }>;
    };

    if (data.errors) {
      logger.error('Login error:', data.errors);
      throw new Error(
        `Login failed: ${data.errors[0]?.message || 'Unknown error'}`
      );
    }

    const accessToken = data.data?.loginWithPhoneNumber?.accessToken;

    if (!accessToken) {
      throw new Error('No access token received from login');
    }

    logger.info('Login successful');
    return accessToken;
  } catch (error) {
    logger.error('Error during login:', error);
    throw new Error('Failed to login');
  }
};
