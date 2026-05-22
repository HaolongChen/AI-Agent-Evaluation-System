import { GraphQLClient, ClientError } from "graphql-request";
import {
  SubscriptionClient,
  type Observable,
} from "subscriptions-transport-ws";
import type { ExecutionResult } from "graphql";
import { logger } from "../infrastructure/logger.ts";
export class NetworkClient {
  private _headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Zed-Version": "2.0.7",
  };
  constructor(
    private readonly _url: string = process.env.BACKEND_GRAPHQL_URL,
    headers?: Record<string, string>,
  ) {
    if (headers) {
      this._headers = { ...this._headers, ...headers };
    }
  }

  setHeader(key: string, value: string) {
    this._headers[key] = value;
  }

  buildGQLClient(newUrl?: string): GQLClient {
    return new GQLClient(
      new GraphQLClient(newUrl || this._url, {
        headers: this._headers,
      }),
    );
  }

  buildWsClient(
    wsUrl: string = process.env.SUBSCRIPTION_GRAPHQL_URL,
  ): WebSocketClient {
    return new WebSocketClient(
      new SubscriptionClient(wsUrl, {
        reconnect: true,
        reconnectionAttempts: 10,
        connectionParams: {
          authToken: this._headers["Authorization"].split(" ")?.[1] || "",
          "X-ZED-VERSION": this._headers["X-Zed-Version"] || "",
          "X-SESSION-ID": this._headers["X-Session-Id"] || "",
        },
        lazy: true,
      }),
    );
  }
}

export const publicNetworkClient = new NetworkClient();
export class WebSocketClient {
  constructor(private client: SubscriptionClient) {}

  close() {
    this.client.unsubscribeAll();
    this.client.close();
  }

  gqlSubscribe<TData, TVariables extends Record<string, unknown>>(
    document: string,
    variables?: TVariables,
  ) {
    const observer = this.client.request({
      query: document,
      variables,
      operationName:
        document.match(/subscription \w.*?\(/)?.[0]?.slice(13, -1) || "ERROR",
    }) as Observable<ExecutionResult<TData>>;
    return this.subscribe(observer);
  }

  private subscribe<TData>(observer: Observable<ExecutionResult<TData>>) {
    return (handlers: SubscriptionHandlers<TData>): (() => void) => {
      const { unsubscribe } = observer.subscribe({
        next: (data) => {
          if (handlers.next && data.data) {
            handlers.next(data.data);
          }
        },
        error: (error) => {
          if (handlers.error) {
            handlers.error(error);
          }
        },
        complete: () => {
          if (handlers.complete) {
            handlers.complete();
          }
        },
      });
      return unsubscribe;
    };
  }
}

export class GQLClient {
  constructor(private client: GraphQLClient) {}

  async gqlRequest<TData>(document: string): Promise<TData>;
  async gqlRequest<TData, TVariables extends object>(
    document: string,
    variables: TVariables,
  ): Promise<TData>;
  async gqlRequest<TData>(
    document: string,
    variables?: unknown,
  ): Promise<TData> {
    try {
      if (variables !== undefined) {
        return await this.client.request<TData>(
          document,
          variables as Record<string, unknown>,
        );
      }
      return await this.client.request<TData>(document);
    } catch (error) {
      if (error instanceof ClientError) {
        logger.error("GraphQL error:", { errors: error.response.errors });
      } else {
        logger.error("GraphQL request failed:", error);
      }
      throw error;
    }
  }
}
// ---------------------------------------------------------------------------
// Subscription event callbacks
// ---------------------------------------------------------------------------

export interface SubscriptionHandlers<TData> {
  /** Called for every data event received from the server. */
  next: (data: TData) => void;
  /** Called when the subscription terminates with an error. */
  error: (error: Error) => void;
  /** Called when the subscription completes cleanly. */
  complete: () => void;
}

// ---------------------------------------------------------------------------
// gqlSubscribe — typed subscription helper
//
// Returns a cleanup function. Call it to unsubscribe and free resources.
//
// @example
//   const unsubscribe = gqlSubscribe<MyData, MyVars>(
//     MY_SUBSCRIPTION,
//     { id: '123' },
//     {
//       next:     (data)  => logger.info('event', data),
//       error:    (err)   => logger.error('sub error', err),
//       complete: ()      => logger.info('done'),
//     },
//   );
//
//   // Later, to stop listening:
//   unsubscribe();
// ---------------------------------------------------------------------------
