import type { NetworkClientEntity } from "../entity/network-client.entity.ts";

export class GraphQLClientService {
  private context: ReturnType<NetworkClientEntity["getHeaderForGraphQL"]> & {
    gqlUrl: string;
  };
  constructor(private network: NetworkClientEntity) {
    this.context = {
      ...this.network.getHeaderForGraphQL(),
      gqlUrl: this.network.getData("gqlUrl"),
    };
  }

  update(callback: () => void) {
    const state = {
      ...this.network.getHeaderForGraphQL(),
      gqlUrl: this.network.getData("gqlUrl"),
    };
    if (JSON.stringify(state) !== JSON.stringify(this.context)) {
      this.context = state;
      callback();
    }
  }
}
