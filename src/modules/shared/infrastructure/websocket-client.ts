import { SubscriptionClient, type Observable } from "subscriptions-transport-ws";
import type {
	IWebSocketClient,
	SubscriptionHandlers,
} from "../domain/interface/websocket-client.interface.ts";
import type { DocumentNode } from "graphql/language/ast.js";
import { logger } from "./logger.ts";
import type { ExecutionResult } from "graphql";

export class WebSocketClient implements IWebSocketClient {
	private client: SubscriptionClient;
	constructor(url: string, headers: Record<string, string>) {
		this.client = new SubscriptionClient(url, {
			reconnect: true,
			reconnectionAttempts: 10,
			connectionParams: headers,
			lazy: true,
		});
	}

	private getOperationName(document: DocumentNode): string {
		for (const definition of document.definitions) {
			if (definition.kind === "OperationDefinition" && definition.name) {
				return definition.name.value;
			}
		}
		logger.error(
			`Failed to extract operation name from document: ${JSON.stringify(document)}`,
		);
		return "UnnamedSubscription";
	}

	private close() {
		this.client.unsubscribeAll();
		this.client.close();
  }

	subscribe<TData, TVariables extends Record<string, unknown>>(
		document: DocumentNode,
		handlers: SubscriptionHandlers<TData>,
		variables?: TVariables,
	): () => void {
		const observer = this.client.request({
			query: document,
			variables,
			operationName: this.getOperationName(document),
		}) as Observable<ExecutionResult<TData>>;
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
  }
}
