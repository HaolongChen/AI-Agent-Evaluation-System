import { URL, BACKEND_GRAPHQL_URL } from '../config/env.ts';
import axios from 'axios';
import * as z from 'zod';
import { logger } from './logger.ts';
import { ACCESS_TOKEN } from '../config/env.ts';

class GraphQLUtils {
  private gqlUrl: string = URL + '/graphql';
  private backendGqlUrl: string = BACKEND_GRAPHQL_URL;
  private accessToken: string | null = ACCESS_TOKEN;
  private tokenExpiry: number | null = null;
  private readonly TOKEN_TTL_MS = 3600000; // 1 hour default TTL

  public setAccessToken(token: string): void {
    this.accessToken = token;
    this.tokenExpiry = Date.now() + this.TOKEN_TTL_MS;
    logger.info(
      'Access token set, expires in',
      this.TOKEN_TTL_MS / 1000,
      'seconds'
    );
  }

  public clearAccessToken(): void {
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  public isTokenValid(): boolean {
    if (!this.accessToken || !this.tokenExpiry) {
      return false;
    }
    return Date.now() < this.tokenExpiry;
  }

  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.accessToken && this.isTokenValid()) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    return headers;
  }

  public accessEndpointWithQuery = async (
    query: string,
    useBackendEndpoint: boolean = false
  ): Promise<object> => {
    try {
      query = z.string().nonempty().parse(query);
      const endpoint = useBackendEndpoint ? this.backendGqlUrl : this.gqlUrl;
      // logger.info('GraphQL Query to:', endpoint);
      // console.debug('GraphQL Query:', query);
      const response = await axios.post(
        endpoint,
        {
          query,
        },
        {
          headers: this.getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      logger.error('Error accessing GraphQL endpoint:', error);
      throw new Error('Failed to access GraphQL endpoint');
    }
  };

  public accessEndpointWithMutation = async (
    mutation: string,
    useBackendEndpoint: boolean = false
  ): Promise<object> => {
    try {
      mutation = z.string().nonempty().parse(mutation);
      const endpoint = useBackendEndpoint ? this.backendGqlUrl : this.gqlUrl;
      logger.info('GraphQL Mutation to:', endpoint);
      console.debug('GraphQL Mutation:', mutation);
      const response = await axios.post(
        endpoint,
        {
          query: mutation,
        },
        {
          headers: this.getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      logger.error('Error accessing GraphQL endpoint:', error);
      throw new Error('Failed to access GraphQL endpoint');
    }
  };

  public accessEndpointWithQueries = async (
    queries: string[],
    useBackendEndpoint: boolean = false
  ): Promise<object[]> => {
    try {
      queries = z.array(z.string().nonempty()).min(1).parse(queries);
      const results = await Promise.all(
        queries.map((query) => {
          return this.accessEndpointWithQuery(query, useBackendEndpoint);
        })
      );
      return results;
    } catch (error) {
      logger.error('Error accessing GraphQL endpoint:', error);
      throw new Error('Failed to access GraphQL endpoint');
    }
  };

  public accessEndpointWithMutations = async (
    mutations: string[],
    useBackendEndpoint: boolean = false
  ): Promise<object[]> => {
    try {
      mutations = z.array(z.string().nonempty()).min(1).parse(mutations);
      const results = await Promise.all(
        mutations.map((mutation) => {
          return this.accessEndpointWithMutation(mutation, useBackendEndpoint);
        })
      );
      return results;
    } catch (error) {
      logger.error('Error accessing GraphQL endpoint:', error);
      throw new Error('Failed to access GraphQL endpoint');
    }
  };
}

export const graphqlUtils = new GraphQLUtils();
