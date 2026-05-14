import { GraphQLClient, ClientError } from "graphql-request";
import { createClient as createWsClient } from "graphql-ws";
import { WebSocket } from "ws";

export class NetworkClient {
  // private account: Account | undefined;
  private _defaultWsHandler = {
    connected: () => console.info("GraphQL subscription WS connected"),
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
    // accountArguments?: z.infer<typeof accountSchema>,
    headers?: Record<string, string>,
  ) {
    // if( accountArguments )
    // {
    //   this.account = new Account( accountArguments.phoneNumber, accountArguments.password );
    // }
    if (headers) {
      this._headers = { ...this._headers, ...headers };
    }
  }

  buildGQLClient(newUrl?: string): GraphQLClient {
    // await this.ensureLoggedIn();
    // this._headers["Authorization"] = `Bearer ${this.accessToken}`;
    return new GraphQLClient(newUrl || this._url, {
      headers: this._headers,
    });
  }

  buildWsClient(
    wsUrl: string = process.env.SUBSCRIPTION_GRAPHQL_URL,
    on?: {
      connected?: () => void;
      closed?: () => void;
      error?: (error: unknown) => void;
    },
    ws?: typeof WebSocket,
  ): ReturnType<typeof createWsClient> {
    // await this.ensureLoggedIn();
    // this._headers["Authorization"] = `Bearer ${this.accessToken}`;
    return createWsClient({
      url: wsUrl,
      webSocketImpl: ws || WebSocket,
      connectionParams: this._headers,
      on: {
        ...this._defaultWsHandler,
        ...on,
      },
      lazy: true, // Only connect when the first subscription is made
    });
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
          console.error("GraphQL subscription error:", error);
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

export const publicWsClient = new WebSocketClient(
  publicNetworkClient.buildWsClient(),
);
export const publicGQLClient = new GQLClient(
  publicNetworkClient.buildGQLClient(),
);

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


// ---------------------------------------------------------------------------
// Shared auth and request helpers
// ---------------------------------------------------------------------------

export class AuthState {
  private token: string | undefined;
  private expiresAt: number | undefined;
  private readonly ttlMs = 60 * 60 * 1000;

  setToken(token: string): void {
    this.token = token;
    this.expiresAt = Date.now() + this.ttlMs;
  }

  clearToken(): void {
    this.token = undefined;
    this.expiresAt = undefined;
  }

  getToken(): string | undefined {
    if (!this.isValid()) {
      return undefined;
    }
    return this.token;
  }

  isValid(): boolean {
    return Boolean(this.token && this.expiresAt && Date.now() < this.expiresAt);
  }
}

export const authState = new AuthState();

export interface GraphQLRequestClient {
  gqlRequest<TData>(document: string): Promise<TData>;
  gqlRequest<TData, TVariables extends object>(
    document: string,
    variables: TVariables,
  ): Promise<TData>;
}

const buildAuthHeaders = (): Record<string, string> => {
  const token = authState.getToken();
  if (!token) {
    return {};
  }

  return {
    Authorization: 'Bearer ' + token,
  };
};

class AuthenticatedGQLClient implements GraphQLRequestClient {
  async gqlRequest<TData>(document: string): Promise<TData>;
  async gqlRequest<TData, TVariables extends object>(
    document: string,
    variables: TVariables,
  ): Promise<TData>;
  async gqlRequest<TData>(
    document: string,
    variables?: unknown,
  ): Promise<TData> {
    const headers = buildAuthHeaders();
    if (!headers.Authorization) {
      throw new Error('No access token available');
    }

    const client = new GraphQLClient(process.env.BACKEND_GRAPHQL_URL, {
      headers: {
        'Content-Type': 'application/json',
        'X-Zed-Version': '2.1.0',
        ...headers,
      },
    });

    try {
      if (variables !== undefined) {
        return await client.request<TData>(
          document,
          variables as Record<string, unknown>,
        );
      }

      return await client.request<TData>(document);
    } catch (error) {
      if (error instanceof ClientError) {
        console.error('GraphQL error:', { errors: error.response.errors });
      } else {
        console.error('GraphQL request failed:', error);
      }
      throw error;
    }
  }
}

export const localClient = publicGQLClient;
export const localWsClient = publicWsClient;
export const backendClient = new AuthenticatedGQLClient();
export const dangerousBackendClient = backendClient;

export async function gqlRequest<TData, TVariables extends object>(
  client: GraphQLRequestClient,
  document: string,
  variables: TVariables,
): Promise<TData>;
export async function gqlRequest<TData>(
  client: GraphQLRequestClient,
  document: string,
): Promise<TData>;
export async function gqlRequest<TData>(
  client: GraphQLRequestClient,
  document: string,
  variables?: unknown,
): Promise<TData> {
  if (variables !== undefined) {
    return await client.gqlRequest<TData, Record<string, unknown>>(
      document,
      variables as Record<string, unknown>,
    );
  }

  return await client.gqlRequest<TData>(document);
}

export function gqlSubscribe<TData>(
  document: string,
  handlers: SubscriptionHandlers<TData>,
): () => void;
export function gqlSubscribe<TData, TVariables extends Record<string, unknown>>(
  document: string,
  variables: TVariables,
  handlers: SubscriptionHandlers<TData>,
): () => void;
export function gqlSubscribe<TData>(
  document: string,
  variablesOrHandlers:
    | Record<string, unknown>
    | SubscriptionHandlers<TData>,
  maybeHandlers?: SubscriptionHandlers<TData>,
): () => void {
  const headers = buildAuthHeaders();
  const client = headers.Authorization
    ? new WebSocketClient(
        new NetworkClient(undefined, headers).buildWsClient(),
      )
    : publicWsClient;

  if (maybeHandlers === undefined) {
    return client.gqlSubscribe<TData>(
      document,
      variablesOrHandlers as SubscriptionHandlers<TData>,
    );
  }

  return client.gqlSubscribe<TData, Record<string, unknown>>(
    document,
    variablesOrHandlers as Record<string, unknown>,
    maybeHandlers,
  );
}
