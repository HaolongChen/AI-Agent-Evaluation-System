import { URL, BACKEND_GRAPHQL_URL } from '../config/env.ts';
import axios from 'axios';
import * as z from 'zod';
import { logger } from './logger.ts';

class GraphQLUtils {
  private gqlUrl: string = URL + '/graphql';
  private backendGqlUrl: string = BACKEND_GRAPHQL_URL;

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
          headers: {
            'Content-Type': 'application/json',
          },
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
          headers: {
            'Content-Type': 'application/json',
          },
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
