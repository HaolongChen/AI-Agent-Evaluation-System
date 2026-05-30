export interface IGQLClient {
  gqlRequest<TData>(document: string): Promise<TData>;
  gqlRequest<TData, TVariables extends object>(
    document: string,
    variables: TVariables,
  ): Promise<TData>;
}
