import { GraphQLClient, ClientError } from 'graphql-request';
import { URL, BACKEND_GRAPHQL_URL } from '../config/env.ts';
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
// Two pre-configured clients
//   localClient  → our own Apollo Server (no auth required)
//   backendClient → Functorz backend (requires Bearer token)
// ---------------------------------------------------------------------------

export const localClient = new GraphQLClient(`${URL}/graphql`, {
  headers: makeHeaders,
});

export const backendClient = new GraphQLClient(BACKEND_GRAPHQL_URL, {
  headers: makeHeaders,
});

// ---------------------------------------------------------------------------
// Typed request wrapper
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
