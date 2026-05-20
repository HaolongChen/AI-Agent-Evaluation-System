import { GraphQLClient, ClientError } from "graphql-request";
import WebSocket from "ws";
import {
	SubscriptionClient,
	type Observable,
} from "subscriptions-transport-ws";
import type { ExecutionResult } from "graphql";
import { gql } from "graphql-tag";

class WS extends WebSocket {
	constructor(address: string | URL | null, protocal?: any, options?) {
		super(address!, "graphql-ws", options);
		this.on("open", () => {
			console.info("WebSocket connection opened.");
		});
		this.on("close", (code, reason) => {
			console.info("WebSocket connection closed.", { code, reason });
		});
		this.on("error", (error) => {
			console.error("WebSocket error:", error);
		});

		this.on("message", (data) => {
			console.debug("Received data from WebSocket:", data.toString());
		});

		this.on("upgrade", (request) => {
			console.info("WebSocket connection upgraded:", request);
		});

		this.on("unexpected-response", (request, response) => {
			console.warn("WebSocket unexpected response:", { request, response });
		});

		this.on("redirect", (url, request) => {
			console.info("WebSocket redirect:", { url, request });
    } );
	}
}

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
		wsImpl: typeof WebSocket = WS,
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

					lazy: false,
        },
        wsImpl
			),
		);
	}
}

export const publicNetworkClient = new NetworkClient();
export class WebSocketClient {
  constructor ( private websocket: SubscriptionClient )
  {
    this.websocket.onError( ( ...args ) => {console.error("WebSocket error", args)})
    this.websocket.onReconnecting( ( ...args ) => {console.log("reconnecting", args)})
    this.websocket.onConnected( ( ...args ) => {console.log("connected", args)})
    this.websocket.onConnecting( ( ...args ) => {console.log("connecting", args)})
	}

	gqlSubscribe<TData, TVariables extends Record<string, unknown>>(
		document: string,
		variables?: TVariables,
	) {
		const observer = this.websocket.request({
			query: gql`${document}`,
      variables,
      // variables: { ...variables },
			// operationName: document.split(" ")[1], // crude way to extract operation name from query string
		});
		console.log(
			"Initiating GraphQL subscription with document:",
			document,
			"and variables:",
			variables,
			"Extracted operation name:",
			document.split(" ")[1],
		);
		return this.subscribe(observer);
	}

	private subscribe<TData>(observer: Observable<ExecutionResult<TData>>) {
		return (handlers: SubscriptionHandlers<TData>): (() => void) => {
			const { unsubscribe } = observer.subscribe({
				next: (data) => {
					console.debug("Received data from subscription:", data);
					if (handlers.next && data.data) {
						console.log(
							"🚀 ---------------------------------------------------------------------🚀",
						);
						console.log(
							"🚀 ~ graphql-client.ts:97 ~ WebSocketClient ~ subscribe ~ data:",
							data,
						);
						console.log(
							"🚀 ---------------------------------------------------------------------🚀",
						);
						handlers.next(data.data);
					}
				},
				error: (error) => {
					console.error("Subscription error:", error);
					if (handlers.error) {
						handlers.error(error);
					}
				},
				complete: () => {
					console.info("Subscription completed");
					if (handlers.complete) {
						handlers.complete();
					}
				},
			});

      return () =>
      {
				unsubscribe();
			};
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
	next?: (data: TData) => void;
	/** Called when the subscription terminates with an error. */
	error?: (error: Error) => void;
	/** Called when the subscription completes cleanly. */
	complete?: () => void;
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
