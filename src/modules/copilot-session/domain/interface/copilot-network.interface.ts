import type { CopilotApiResultJs } from "../../../shared/domain/interface/type-system.ts";
import type { CopilotEventsList } from "../entity/copilot-job.entity.ts";
import type { CopilotInputMessage } from "../schema/copilot.schema.ts";

export interface ICopilotNetworkService {
  sessionExId: string;
  sendMessageToSession<T extends keyof CopilotInputMessage>(
    type: T,
    message: CopilotInputMessage[T],
  ): Promise<void>;

  subscribeToSessionUpdates(
    publish: (event: CopilotEventsList[keyof CopilotEventsList]) => void,
  ): () => void;

  runCopilotToolCalls(toolCalls: unknown[]): CopilotApiResultJs;
}
