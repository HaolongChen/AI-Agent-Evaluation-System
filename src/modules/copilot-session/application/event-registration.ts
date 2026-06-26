import type { Account } from "../../account/domain/entity/account.entity.ts";
import { NetworkClient } from "../../account/domain/entity/network-client.entity.ts";
import type { IEventConsumerFactory } from "../domain/event/event-consumer-factory.interface.ts";
import type { CopilotSessionEventBus } from "../domain/event/event-map.ts";

export class CopilotSessionEventRegistrationService {
	constructor(
		private readonly eventConsumerFactory: IEventConsumerFactory,
	) {}
	registerEventBus(eventBus: CopilotSessionEventBus, dangerousAccount: Account): void {
		const networkClient = NetworkClient.createDefault();
		dangerousAccount.acquireNetwork(networkClient);
		const copilotExecutionTaskCreatedEventConsumer =
			this.eventConsumerFactory.buildCopilotExecutionTaskCreatedEventConsumer(
				eventBus,
			);
		eventBus.subscribe(copilotExecutionTaskCreatedEventConsumer);
		const projectCreationTaskCreatedEventConsumer =
			this.eventConsumerFactory.buildProjectCreationTaskCreatedEventConsumer(
				networkClient,
			);
		eventBus.subscribe(projectCreationTaskCreatedEventConsumer);
		const copilotSessionCreatedEventConsumer =
			this.eventConsumerFactory.buildCopilotSessionCreatedEventConsumer();
		eventBus.subscribe(copilotSessionCreatedEventConsumer);
	}
}
