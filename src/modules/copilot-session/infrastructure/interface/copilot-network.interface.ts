import type { NetworkClient } from "../../../account/domain/entity/network-client.entity.ts";
import type { CopilotEventsList } from "../copilot/copilot-event.schema.ts";
import type { CopilotInputMessage } from "../copilot/copilot.schema.ts";

export interface ICopilotNetworkService {
  subscribeToSessionUpdates(
    sessionExId: string,
    networkClient: NetworkClient,
    publish: (event: CopilotEventsList[keyof CopilotEventsList]) => void,
  ): () => void;

  sendMessageToSession<T extends keyof CopilotInputMessage>(
    sessionExId: string,
    networkClient: NetworkClient,
    type: T,
    message: CopilotInputMessage[T],
  ): Promise<void>;
}
