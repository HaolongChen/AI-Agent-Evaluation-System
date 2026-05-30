import type { NetworkClientEntity } from "../entity/network-client.entity.ts";

export class WebsocketClientService {
  private context: ReturnType<NetworkClientEntity["getHeaderForWebSocket"]> & {
    wsUrl: string;
  };
  constructor(private client: NetworkClientEntity) {
    this.context = {
      ...this.client.getHeaderForWebSocket(),
      wsUrl: this.client.getData("wsUrl"),
    };
  }

  update(callback: () => void) {
    const state = {
      ...this.client.getHeaderForWebSocket(),
      wsUrl: this.client.getData("wsUrl"),
    };
    if (JSON.stringify(state) !== JSON.stringify(this.context)) {
      this.context = state;
      callback();
    }
  }
}
