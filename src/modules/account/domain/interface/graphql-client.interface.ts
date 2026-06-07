import type { DocumentNode } from "graphql/language/index.js";

export interface IGQLClient {
  gqlRequest<TData>(document: DocumentNode): Promise<TData>;
  gqlRequest<TData, TVariables extends object>(
    document: DocumentNode,
    variables: TVariables,
  ): Promise<TData>;
}
