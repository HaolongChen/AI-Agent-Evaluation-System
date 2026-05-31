import { GraphQLClient } from "graphql-request";
import type { IGQLClient } from "../domain/interface/graphql-client.interface.ts";
import type { NetworkClientEntity } from "../domain/entity/network-client.entity.ts";

export class GQLClient implements IGQLClient {
  private context: ReturnType<NetworkClientEntity["getHeaderForGraphQL"]> & {
    url: string;
  };
  private graphqlClient: GraphQLClient;
  constructor(private client: NetworkClientEntity) {
    this.context = {
      ...this.client.getHeaderForGraphQL(),
      url: this.client.getData("gqlUrl"),
    };
    const { url, ...headers } = this.context;
    this.graphqlClient = new GraphQLClient(url, { headers });
  }

  private updateClient() {
    const newContext = {
      ...this.client.getHeaderForGraphQL(),
      url: this.client.getData("gqlUrl"),
    };
    if (JSON.stringify(newContext) !== JSON.stringify(this.context)) {
      this.context = newContext;
      const { url, ...headers } = this.context;
      this.graphqlClient = new GraphQLClient(url, { headers });
    }
    return this.graphqlClient;
  }

  async gqlRequest<TData>(document: string): Promise<TData>;
  async gqlRequest<TData, TVariables extends object>(
    document: string,
    variables: TVariables,
  ): Promise<TData>;
  async gqlRequest<TData>(
    document: string,
    variables?: unknown,
  ): Promise<TData> {
    const client = this.updateClient();
    if (variables !== undefined) {
      return client.request<TData>(
        document,
        variables as Record<string, unknown>,
      );
    }
    return client.request<TData>(document as string);
  }
}
