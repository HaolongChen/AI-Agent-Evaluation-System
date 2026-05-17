import { GraphQLClient, ClientError } from "graphql-request";
import { createClient as createWsClient, type Message } from "graphql-ws";
import { WebSocket } from "ws";

export class NetworkClient {
  private _defaultWsHandler = {
    connected: () => console.info("GraphQL subscription WS connected"),
    message: (message: Message) => {
      console.info("GraphQL subscription received message:", message);
    },
    closed: () => console.info("GraphQL subscription WS closed"),
    error: (error: unknown) =>
      console.error("GraphQL subscription WS error:", error),
  };
  private _headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Zed-Version": "2.1.0",
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
    on?: {
      connected?: () => void;
      closed?: () => void;
      error?: (error: unknown) => void;
    },
    ws?: typeof WebSocket,
  ): WebSocketClient {
    return new WebSocketClient(
      createWsClient({
        url: wsUrl,
        webSocketImpl: ws || WebSocket,
        connectionParams: {
          "X-SESSION-ID": this._headers["X-Session-Id"] || "",
          "X-ZED-VERSION": this._headers["X-Zed-Version"] || "",
          authToken: this._headers["Authorization"] || "",
        },
        on: {
          ...this._defaultWsHandler,
          ...on,
        },
        lazy: true, // Only connect when the first subscription is made
      }),
    );
  }
}

export const publicNetworkClient = new NetworkClient();
export class WebSocketClient {
  constructor(private websocket: ReturnType<typeof createWsClient>) {}

  gqlSubscribe<TData>(
    document: string,
    handlers: SubscriptionHandlers<TData>,
  ): () => void;
  gqlSubscribe<TData, TVariables extends Record<string, unknown>>(
    document: string,
    variables: TVariables,
    handlers: SubscriptionHandlers<TData>,
  ): () => void;
  gqlSubscribe<TData>(
    document: string,
    variablesOrHandlers: Record<string, unknown> | SubscriptionHandlers<TData>,
    maybeHandlers?: SubscriptionHandlers<TData>,
  ): () => void {
    let variables: Record<string, unknown> | undefined;
    let handlers: SubscriptionHandlers<TData>;

    if (maybeHandlers === undefined) {
      variables = undefined;
      handlers = variablesOrHandlers as SubscriptionHandlers<TData>;
    } else {
      variables = variablesOrHandlers as Record<string, unknown>;
      handlers = maybeHandlers;
    }

    const unsubscribe = this.websocket.subscribe<TData>(
      { query: document, variables },
      {
        next: (result) => {
          if (result.data !== undefined && result.data !== null) {
            handlers.next(result.data);
          }
        },
        error: (error) => {
          handlers.error(error);
        },
        complete: () => {
          handlers.complete();
        },
      },
    );

    return unsubscribe;
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
        return await (this.client as GraphQLClient).request<TData>(
          document,
          variables as Record<string, unknown>,
        );
      }
      return await this.client.request<TData>(document);
    } catch (error) {
      if (error instanceof ClientError) {
        console.error("GraphQL error:", { errors: error.response.errors });
      } else {
        console.error("GraphQL request failed:", error);
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
  error: (error: unknown) => void;
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
