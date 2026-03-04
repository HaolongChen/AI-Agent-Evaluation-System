import { GraphQLClient, ClientError } from 'graphql-request';
import { createClient as createWsClient } from 'graphql-ws';
import { WebSocket } from 'ws';
import { URL, BACKEND_GRAPHQL_URL, SUBSCRIPTION_GRAPHQL_URL } from '../config/env.ts';
import { logger } from './logger.ts';

// ---------------------------------------------------------------------------
// Auth state — token with 1-hour TTL
// ---------------------------------------------------------------------------

class AuthState {
  private token: string | null = null;
  private expiry: number | null = null;
  private readonly TTL_MS = 3_600_000; // 1 hour

  setToken(token: string): void {
    this.token = token;
    this.expiry = Date.now() + this.TTL_MS;
    logger.info('Access token set, expires in', this.TTL_MS / 1000, 'seconds');
  }

  clearToken(): void {
    this.token = null;
    this.expiry = null;
  }

  isValid(): boolean {
    return !!(this.token && this.expiry && Date.now() < this.expiry);
  }

  getToken(): string | null {
    return this.isValid() ? this.token : null;
  }
}

export const authState = new AuthState();

// ---------------------------------------------------------------------------
// Header factory — evaluated per-request so new tokens are always picked up
// ---------------------------------------------------------------------------

function makeHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Zed-Version': '2.1.0',
  };
  const token = authState.getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// ---------------------------------------------------------------------------
// HTTP clients
//   localClient   → our own Apollo Server (no auth required)
//   backendClient → Functorz backend (requires Bearer token)
// ---------------------------------------------------------------------------

export const localClient = new GraphQLClient(`${URL}/graphql`, {
  headers: makeHeaders,
});

export const backendClient = new GraphQLClient(BACKEND_GRAPHQL_URL, {
  headers: makeHeaders,
});

// ---------------------------------------------------------------------------
// Typed HTTP request wrapper
// ---------------------------------------------------------------------------

export async function gqlRequest<TData>(
  client: GraphQLClient,
  document: string,
): Promise<TData>;
export async function gqlRequest<TData, TVariables extends object>(
  client: GraphQLClient,
  document: string,
  variables: TVariables,
): Promise<TData>;
// Implementation signature — uses `unknown` to bypass the VariablesAndRequestHeadersArgs
// conditional-type constraint that TypeScript cannot resolve for generic TVariables.
// The two public overloads above enforce correct typing for all callers.
export async function gqlRequest<TData>(
  client: GraphQLClient,
  document: string,
  variables?: unknown,
): Promise<TData> {
  try {
    if (variables !== undefined) {
      return await (client as GraphQLClient).request<TData>(
        document,
        variables as Record<string, unknown>,
      );
    }
    return await client.request<TData>(document);
  } catch (error) {
    if (error instanceof ClientError) {
      logger.error('GraphQL error:', { errors: error.response.errors });
    } else {
      logger.error('GraphQL request failed:', error);
    }
    throw error;
  }
}

// ---------------------------------------------------------------------------
// WebSocket subscription client (graphql-ws protocol)
//
// Lazily created on first use so the WS connection isn't opened until needed.
// Auth token is injected via connectionParams on every reconnect so it stays
// fresh even after a token refresh.
// ---------------------------------------------------------------------------

type WsClient = ReturnType<typeof createWsClient>;

let _wsClient: WsClient | null = null;

function getWsClient(): WsClient {
  if (_wsClient) {
    return _wsClient;
  }

  _wsClient = createWsClient({
    url: SUBSCRIPTION_GRAPHQL_URL,
    webSocketImpl: WebSocket,
    connectionParams: () => {
      const token = authState.getToken();
      return token ? { Authorization: `Bearer ${token}` } : {};
    },
    on: {
      connected: () => logger.info('GraphQL subscription WS connected'),
      closed: () => logger.info('GraphQL subscription WS closed'),
      error: (err) => logger.error('GraphQL subscription WS error:', err),
    },
  });

  return _wsClient;
}

// ---------------------------------------------------------------------------
// Subscription event callbacks
// ---------------------------------------------------------------------------

export interface SubscriptionHandlers<TData> {
  /** Called for every data event received from the server. */
  next: (data: TData) => void;
  /** Called when the subscription terminates with an error. */
  error: (err: unknown) => void;
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
  variablesOrHandlers: Record<string, unknown> | SubscriptionHandlers<TData>,
  maybeHandlers?: SubscriptionHandlers<TData>,
): () => void {
  let variables: Record<string, unknown> | undefined;
  let handlers: SubscriptionHandlers<TData>;

  if (maybeHandlers !== undefined) {
    variables = variablesOrHandlers as Record<string, unknown>;
    handlers = maybeHandlers;
  } else {
    variables = undefined;
    handlers = variablesOrHandlers as SubscriptionHandlers<TData>;
  }

  const client = getWsClient();

  const unsubscribe = client.subscribe<TData>(
    { query: document, variables },
    {
      next: (result) => {
        if (result.data !== undefined && result.data !== null) {
          handlers.next(result.data);
        }
      },
      error: (err) => {
        logger.error('GraphQL subscription error:', err);
        handlers.error(err);
      },
      complete: () => {
        handlers.complete();
      },
    },
  );

  return unsubscribe;
}
