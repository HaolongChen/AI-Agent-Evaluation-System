import { URL } from '../config/env.ts';
import axios from 'axios';
import * as z from 'zod';
import { logger } from './logger.ts';

class GraphQLUtils {
  private gqlUrl: string = URL + '/graphql';

  public accessEndpointWithQuery = async (query: string): Promise<object> => {
    try {
      query = z.string().nonempty().parse(query);
      const response = await axios.post(
        this.gqlUrl,
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
    mutation: string
  ): Promise<object> => {
    try {
      mutation = z.string().nonempty().parse(mutation);
      const response = await axios.post(
        this.gqlUrl,
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
    queries: string[]
  ): Promise<object[]> => {
    try {
      queries = z.array(z.string().nonempty()).min(1).parse(queries);
      const results = await Promise.all(
        queries.map((query) => {
          return this.accessEndpointWithQuery(query);
        })
      );
      return results;
    } catch (error) {
      logger.error('Error accessing GraphQL endpoint:', error);
      throw new Error('Failed to access GraphQL endpoint');
    }
  };

  public accessEndpointWithMutations = async (
    mutations: string[]
  ): Promise<object[]> => {
    try {
      mutations = z.array(z.string().nonempty()).min(1).parse(mutations);
      const results = await Promise.all(
        mutations.map((mutation) => {
          return this.accessEndpointWithMutation(mutation);
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
