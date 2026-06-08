import type { IGQLClient } from "../../../account/domain/interface/graphql-client.interface.ts";
import type { IWebSocketClient } from "../../../account/domain/interface/websocket-client.interface.ts";
import type { CopilotApiResultJs, OpaqueSchemaGraph } from "../../../shared/domain/interface/type-system.ts";
import type {
	CopilotEventsList,
} from "../entity/copilot-job.entity.ts";
import type { CopilotInputMessage } from "../schema/project.schema.ts";

export interface ICopilotNetworkService
{
  runCopilotToolCalls ( toolCalls: {
    name: string;
    args: unknown;
    toolCallId: string;
  }[], schemaGraph: OpaqueSchemaGraph ): CopilotApiResultJs;

  subscribeToSessionUpdates (
    sessionExId: string,
    wsClient: IWebSocketClient,
		publish: (event: CopilotEventsList[keyof CopilotEventsList]) => void,
	): () => void;

	sendMessageToSession<T extends keyof CopilotInputMessage>(
		sessionExId: string,
		gqlClient: IGQLClient,
		type: T,
		message: CopilotInputMessage[T],
  ): Promise<void>;

  createCopilotSession(projectExId: string, gqlClient: IGQLClient): Promise<string>;
}
