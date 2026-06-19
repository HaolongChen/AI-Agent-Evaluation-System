import type { NetworkClient } from "../../../account/domain/entity/network-client.entity.ts";
import type {
  CopilotInputEvent,
  CopilotMessageEvent,
} from "../copilot/copilot-event.ts";

export interface ICopilotNetworkService {
  subscribeToSessionUpdates(
    sessionExId: string,
    networkClient: NetworkClient,
    publish: (event: CopilotMessageEvent) => void,
  ): () => void;

  sendMessageToSession(
    sessionExId: string,
    networkClient: NetworkClient,
    event: CopilotInputEvent,
  ): Promise<void>;
}
