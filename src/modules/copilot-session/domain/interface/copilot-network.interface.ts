import type { OpaqueSchemaGraph } from "../../../shared/domain/interface/type-system.ts";
import type { CopilotEventsList } from "../entity/copilot-job.entity.ts";
import type { CopilotInputMessage } from "../schema/copilot.schema.ts";

export interface ICopilotNetworkService {
  createNewSession(projectExId: string): Promise<string>;

  getLatestSession(projectExId: string): Promise<string | null>;

  getSubscriptionCount(projectExId: string): Promise<number>;

  sendMessageToSession<T extends keyof CopilotInputMessage>(
    sessionExId: string,
    type: T,
    message: CopilotInputMessage[T],
  ): Promise<void>;

  subscribeToSessionUpdates(
    sessionExId: string,
    schemaGraph: OpaqueSchemaGraph,
    publish: (event: CopilotEventsList[keyof CopilotEventsList]) => void,
  ): () => void;
}
