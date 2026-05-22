import { GraphQLClient, ClientError } from "graphql-request";
import WebSocket from "ws";
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
    wsImpl: typeof WebSocket = WebSocket,
  ): WebSocketClient {
    return new WebSocketClient(
      new SubscriptionClient(
        wsUrl,
        {
          reconnect: true,
          reconnectionAttempts: 1,
          connectionParams: {
            // authentication: this._headers[ "Authorization" ],
            // ...this._headers,
            authToken: this._headers["Authorization"].split(" ")?.[1] || "",
            "X-ZED-VERSION": this._headers["X-Zed-Version"] || "",
            "X-SESSION-ID": this._headers["X-Session-Id"] || "",
          },

          lazy: true,
        },
        wsImpl,
      ),
    );
  }
}

export const publicNetworkClient = new NetworkClient();
export class WebSocketClient {
  constructor(private client: SubscriptionClient) {
    logger.debug("WebSocketClient initialized with SubscriptionClient:", client);
  }

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
    logger.debug(
      "Initiating GraphQL subscription with document:",
      document,
      "and variables:",
      variables,
      "Extracted operation name:",
      document.match(/subscription \w.*?\(/)?.[0]?.slice(13, -1) || "ERROR",
    );
    return this.subscribe(observer);
  }

  private subscribe<TData>(observer: Observable<ExecutionResult<TData>>) {
    return (handlers: SubscriptionHandlers<TData>): (() => void) => {
      const { unsubscribe } = observer.subscribe({
        next: (data) => {
          logger.debug("Received data from subscription:", data);
          if (handlers.next && data.data) {
            handlers.next(data.data);
          }
        },
        error: (error) => {
          logger.error("Subscription error:", error);
          if (handlers.error) {
            handlers.error(error);
          }
        },
        complete: () => {
          logger.info("Subscription completed");
          if (handlers.complete) {
            handlers.complete();
          }
        },
      });
      logger.info("Subscription started with handlers:", handlers);
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
  // Implementation signature — uses `unknown` to bypass the VariablesAndRequestHeadersArgs
  // conditional-type constraint that TypeScript cannot resolve for generic TVariables.
  // The two public overloads above enforce correct typing for all callers.
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
//       next:     (data)  => console.info('event', data),
//       error:    (err)   => console.error('sub error', err),
//       complete: ()      => console.info('done'),
//     },
//   );
//
//   // Later, to stop listening:
//   unsubscribe();
// ---------------------------------------------------------------------------
