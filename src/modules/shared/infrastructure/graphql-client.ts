import { GraphQLClient } from "graphql-request";
import type { IGQLClient } from "../domain/interface/graphql-client.interface.ts";
import type { DocumentNode } from "graphql/language/ast.js";

export class GQLClient implements IGQLClient {
	private client: GraphQLClient;
	constructor(url: string, headers: Record<string, string>) {
		this.client = new GraphQLClient(url, { headers });
	}
	async gqlRequest<TData>(document: DocumentNode): Promise<TData>;
	async gqlRequest<TData, TVariables extends object>(
		document: DocumentNode,
		variables: TVariables,
	): Promise<TData>;
	async gqlRequest<TData>(
		document: DocumentNode,
		variables?: unknown,
  ): Promise<TData>
  {
    if (variables !== undefined) {
			return this.client.request<TData>(
				document,
				variables as Record<string, unknown>,
			);
		}
		return this.client.request<TData>(document);
	}
}
