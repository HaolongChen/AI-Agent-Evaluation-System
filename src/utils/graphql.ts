import { URL } from '../config/env.ts';
import axios from 'axios';
import * as z from 'zod';

class GraphQLUtils {
  private gqlUrl: string = URL + '/graphql';

  public accessEndpointWithQuery = async (
    query: string,
    variables: Record<string, unknown>
  ): Promise<object> => {
    try {
      query = z.string().min(1).parse(query);
      const response = await axios.post(
        this.gqlUrl,
        {
          query,
          variables,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error accessing GraphQL endpoint:', error);
      throw new Error('Failed to access GraphQL endpoint');
    }
  };

  public accessEndpointWithMutation = async (
    mutation: string,
    variables: Record<string, unknown>
  ): Promise<object> => {
    try {
      mutation = z.string().min(1).parse(mutation);
      const response = await axios.post(
        this.gqlUrl,
        {
          query: mutation,
          variables,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error accessing GraphQL endpoint:', error);
      throw new Error('Failed to access GraphQL endpoint');
    }
  };

  public accessEndpointWithQueries = async (
    queries: string[],
    variablesList: Record<string, unknown>[]
  ): Promise<object[]> => {
    try {
      queries = z.array(z.string().min(1)).min(1).parse(queries);
      if (queries.length !== variablesList.length) {
        throw new Error('Queries and variablesList must have the same length');
      }
      const results = await Promise.all(
        queries.map((query, index) => {
          variablesList[index] = z.record(z.string(), z.unknown()).parse(variablesList[index]);
          return this.accessEndpointWithQuery(query, variablesList[index]);
        })
      );
      return results;
    } catch (error) {
      console.error('Error accessing GraphQL endpoint:', error);
      throw new Error('Failed to access GraphQL endpoint');
    }
  };

  public accessEndpointWithMutations = async (
    mutations: string[],
    variablesList: Record<string, unknown>[]
  ): Promise<object[]> => {
    try {
      mutations = z.array(z.string().min(1)).min(1).parse(mutations);
      if (mutations.length !== variablesList.length) {
        throw new Error('Mutations and variablesList must have the same length');
      }
      const results = await Promise.all(
        mutations.map((mutation, index) => {
          variablesList[index] = z.record(z.string(), z.unknown()).parse(variablesList[index]);
          return this.accessEndpointWithMutation(mutation, variablesList[index]);
        })
      );
      return results;
    } catch (error) {
      console.error('Error accessing GraphQL endpoint:', error);
      throw new Error('Failed to access GraphQL endpoint');
    }
  };
}

export const graphqlUtils = new GraphQLUtils();
