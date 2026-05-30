import type { IGraphQLClient } from "../domain/interface/graphql-client.interface.ts";
import type { GraphQLClientService } from "../domain/service/graphql-client.service.ts";

export class GraphQLClient implements IGraphQLClient {
  constructor(private clientService: GraphQLClientService) {}
  gqlRequest<TData>(document: string): Promise<TData>;
  gqlRequest<TData, TVariables extends object>(
    document: string,
    variables: TVariables,
  ): Promise<TData>;
  gqlRequest(
    document: unknown,
    variables?: unknown,
  ): Promise<TData> | Promise<TData> {
    throw new Error("Method not implemented.");
  }
}
