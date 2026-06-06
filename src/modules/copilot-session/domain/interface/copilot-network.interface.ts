import type { CopilotApiResultJs } from "../../../shared/domain/interface/type-system.ts";
import type {
  CopilotEvent,
  CopilotEventsList,
} from "../entity/copilot-job.entity.ts";
// import type { CopilotInputMessage } from "../schema/copilot.schema.ts";

export interface ICopilotNetworkService {
  delegateCopilotToolCalls(
    event: CopilotEvent<"CopilotToolCallBatchMessage">,
  ): CopilotApiResultJs;

  sendHumanMessage(): Promise<void>;

  sendHumanOperationMessage(): Promise<void>;

  subscribeToSessionUpdates(
    publish: (event: CopilotEventsList[keyof CopilotEventsList]) => void,
  ): () => void;

  terminateSession(): Promise<void>;

  stopSession(): Promise<void>;
}
