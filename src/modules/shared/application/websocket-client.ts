import {
  SubscriptionClient,
  type Observable,
} from "subscriptions-transport-ws";
import type { NetworkClientEntity } from "../domain/entity/network-client.entity.ts";
import type {
  IWebSocketClient,
  SubscriptionHandlers,
} from "../domain/interface/websocket-client.interface.ts";
import type { DocumentNode, ExecutionResult } from "graphql";
import { logger } from "../infrastructure/logger.ts";

export class WebSocketClient implements IWebSocketClient {
  private context: ReturnType<NetworkClientEntity["getHeaderForWebSocket"]> & {
    wsUrl: string;
  };
  private subscriptionClient: SubscriptionClient;
  constructor(private networkClient: NetworkClientEntity) {
    this.context = {
      ...this.networkClient.getHeaderForWebSocket(),
      wsUrl: this.networkClient.getData("wsUrl"),
    };
    const { wsUrl, ...headers } = this.context;
    this.subscriptionClient = new SubscriptionClient(wsUrl, {
      reconnect: true,
      reconnectionAttempts: 10,
      connectionParams: headers,
      lazy: true,
    });
  }

  private update() {
    const state = {
      ...this.networkClient.getHeaderForWebSocket(),
      wsUrl: this.networkClient.getData("wsUrl"),
    };
    if (JSON.stringify(state) !== JSON.stringify(this.context)) {
      this.context = state;
      const { wsUrl, ...headers } = this.context;
      this.close();
      this.subscriptionClient = new SubscriptionClient(wsUrl, {
        reconnect: true,
        reconnectionAttempts: 10,
        connectionParams: headers,
        lazy: true,
      });
    }
    return this.subscriptionClient;
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
    this.subscriptionClient.unsubscribeAll();
    this.subscriptionClient.close();
  }

  subscribe<TData, TVariables extends Record<string, unknown>>(
    document: DocumentNode,
    handlers: SubscriptionHandlers<TData>,
    variables?: TVariables,
  ): () => void {
    const client = this.update();
    const observer = client.request({
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
