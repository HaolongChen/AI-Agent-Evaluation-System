import {
  SubscriptionClient,
  type Observable,
} from "subscriptions-transport-ws";
import type { NetworkClientEntity } from "../domain/entity/network-client.entity.ts";
import type {
  IWebSocketClient,
  SubscriptionHandlers,
} from "../domain/interface/websocket-client.interface.ts";
import type { ExecutionResult } from "graphql";

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

  private getOperationName(document: string): string {
    const match = document.match(/subscription \w.*?\(/)?.[0]?.slice(13, -1);
    if (!match) {
      throw new Error("Failed to extract operation name from document");
    }
    return match;
  }

  private close() {
    this.subscriptionClient.unsubscribeAll();
    this.subscriptionClient.close();
  }

  subscribe<TData, TVariables extends Record<string, unknown>>(
    document: string,
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
