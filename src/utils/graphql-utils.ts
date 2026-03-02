/**
 * @deprecated
 * This module is a compatibility shim. All new code should import directly from
 * `./graphql-client.ts` and use `localClient`, `backendClient`, and `gqlRequest()`.
 *
 * This file will be removed in a future cleanup.
 */

import { authState, localClient, backendClient, gqlRequest } from './graphql-client.ts';
import { logger } from './logger.ts';

class GraphQLUtilsShim {
  /** @deprecated Use `authState.setToken()` from `./graphql-client.ts`. */
  public setAccessToken(token: string): void {
    authState.setToken(token);
  }

  /** @deprecated Use `authState.clearToken()` from `./graphql-client.ts`. */
  public clearAccessToken(): void {
    authState.clearToken();
  }

  /** @deprecated Use `authState.isValid()` from `./graphql-client.ts`. */
  public isTokenValid(): boolean {
    return authState.isValid();
  }

  /** @deprecated Use `gqlRequest(localClient | backendClient, document, variables)`. */
  public accessEndpointWithQuery = async (
    query: string,
    useBackendEndpoint: boolean = false,
  ): Promise<object> => {
    const client = useBackendEndpoint ? backendClient : localClient;
    return gqlRequest<object>(client, query);
  };

  /** @deprecated Use `gqlRequest(localClient | backendClient, document, variables)`. */
  public accessEndpointWithMutation = async (
    mutation: string,
    useBackendEndpoint: boolean = false,
  ): Promise<object> => {
    const client = useBackendEndpoint ? backendClient : localClient;
    logger.info('GraphQL Mutation to:', useBackendEndpoint ? 'backend' : 'local');
    return gqlRequest<object>(client, mutation);
  };

  /** @deprecated Use parallel `gqlRequest()` calls instead. */
  public accessEndpointWithQueries = async (
    queries: string[],
    useBackendEndpoint: boolean = false,
  ): Promise<object[]> => {
    const client = useBackendEndpoint ? backendClient : localClient;
    return Promise.all(queries.map((q) => gqlRequest<object>(client, q)));
  };

  /** @deprecated Use parallel `gqlRequest()` calls instead. */
  public accessEndpointWithMutations = async (
    mutations: string[],
    useBackendEndpoint: boolean = false,
  ): Promise<object[]> => {
    const client = useBackendEndpoint ? backendClient : localClient;
    return Promise.all(mutations.map((m) => gqlRequest<object>(client, m)));
  };
}

/** @deprecated Import from `./graphql-client.ts` instead. */
export const graphqlUtils = new GraphQLUtilsShim();
