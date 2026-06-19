import { CopilotSessionCreatedEvent } from "../../domain/event/copilot-session-created.ts";
import type { ICopilotNetworkService } from "../interface/copilot-network.interface.ts";
import type { IZionProjectService } from "../../domain/interface/project-service.interface.ts";
import { CopilotInputEvent } from "../copilot/copilot-event.ts";
import { CopilotExecutionLog } from "../../domain/value-object/copilot-execution-log.ts";
import type { ICopilotRepositoryService } from "../interface/copilot-repository-service.interface.ts";
import type { NetworkClient } from "../../../account/domain/entity/network-client.entity.ts";
import { CopilotMessageHandler } from "../copilot/copilot-message-handler.ts";
import { CopilotExecutionEventBus } from "../copilot/copilot-execution-event-bus.ts";

export class CopilotExecutionHandler {
	constructor(
		private readonly copilotNetwork: ICopilotNetworkService,
		private readonly projectService: IZionProjectService,
		private readonly copilotRepositoryService: ICopilotRepositoryService,
	) {}

	private onMessageSent = (
		copilotSessionExId: string,
		copilotNetwork: NetworkClient,
	) => {
		return async (event: CopilotInputEvent) => {
			return this.copilotNetwork.sendMessageToSession(
				copilotSessionExId,
				copilotNetwork,
				event,
			);
		};
	};

	private onExecutionLogUpdated = (copilotSessionExId: string) => {
		return async (log: CopilotExecutionLog) => {
			return this.copilotRepositoryService.saveLog(copilotSessionExId, log);
		};
	};

	async onCopilotSessionCreated(event: CopilotSessionCreatedEvent) {
		const copilotExecutionEventBus = new CopilotExecutionEventBus();
		copilotExecutionEventBus.subscribeToMessageSentEvent(
			this.onMessageSent(event.copilotSessionExId, event.copilotNetwork),
		);
		copilotExecutionEventBus.subscribeToExecutionLogUpdatedEvent(
			this.onExecutionLogUpdated(event.copilotSessionExId),
		);
		const handler = new CopilotMessageHandler(
			this.projectService,
			event.project,
			copilotExecutionEventBus.publishMessageSentEvent,
			copilotExecutionEventBus.publishExecutionLogUpdatedEvent,
		);
		const unsubscribe = this.copilotNetwork.subscribeToSessionUpdates(
			event.copilotSessionExId,
			event.copilotNetwork,
			handler.publish,
		);
		copilotExecutionEventBus.subscribeToMessageSentEvent(
			async (event: CopilotInputEvent) => {
				if (event.message.copilotMessageType === "TERMINATE") {
					unsubscribe();
				}
			},
		);
	}
}
