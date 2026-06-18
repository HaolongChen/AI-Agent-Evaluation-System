import type { NetworkClient } from "../../../account/domain/entity/network-client.entity.ts";
import type {
  CopilotInputEvent,
  CopilotResponseEvent,
} from "../copilot/copilot-event.schema.ts";

export interface ICopilotNetworkService {
  subscribeToSessionUpdates(
    sessionExId: string,
    networkClient: NetworkClient,
    publish: (event: CopilotResponseEvent) => void,
  ): () => void;

  sendMessageToSession(
    sessionExId: string,
    networkClient: NetworkClient,
    event: CopilotInputEvent,
  ): Promise<void>;
}
