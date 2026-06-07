import type { DocumentNode } from "graphql";

export interface IWebSocketClient {
  subscribe<TData, TVariables extends Record<string, unknown>>(
    document: DocumentNode,
    handlers: SubscriptionHandlers<TData>,
    variables?: TVariables,
  ): () => void;
}

export interface SubscriptionHandlers<TData> {
  /** Called for every data event received from the server. */
  next: (data: TData) => void;
  /** Called when the subscription terminates with an error. */
  error: (error: Error) => void;
  /** Called when the subscription completes cleanly. */
  complete: () => void;
}
