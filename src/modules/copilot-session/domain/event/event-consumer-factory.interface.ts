import type { NetworkClient } from "../../../account/domain/entity/network-client.entity.ts";
import type { CopilotSessionEventBus, CopilotSessionEventConsumer } from "./event-map.ts";

export interface IEventConsumerFactory
{
  buildCopilotExecutionTaskCreatedEventConsumer ( eventBus: CopilotSessionEventBus ): CopilotSessionEventConsumer<"copilot.executionTask.created">;

  buildProjectCreationTaskCreatedEventConsumer ( dangerousNetworkClient: NetworkClient ): CopilotSessionEventConsumer<"zionProject.creationTask.created">;

  buildCopilotSessionCreatedEventConsumer (): CopilotSessionEventConsumer<"copilot.session.started">;
}