/* eslint-disable unicorn/no-null */
import { CopilotSessionCreatedEvent } from "../../domain/event/copilot-session-created.ts";
import type { ICopilotNetworkService } from "../interface/copilot-network.interface.ts";
import type { IZionProjectService } from "../../domain/interface/project-service.interface.ts";
import { CopilotInputEvent } from "../copilot/copilot-event.ts";
import { CopilotExecutionLog } from "../../domain/value-object/copilot-execution-log.ts";
import type { ICopilotRepositoryService } from "../interface/copilot-repository-service.interface.ts";
import type { NetworkClient } from "../../../account/domain/entity/network-client.entity.ts";
import { CopilotMessageHandler } from "../copilot/copilot-message-handler.ts";
import { CopilotExecutionEventBus } from "../copilot/copilot-execution-event-bus.ts";
import type { CopilotToolCallHandler } from "../copilot/copilot-tool-call-handler.ts";
import type { CopilotExecutionTaskCreatedEvent } from "../../domain/event/copilot-execution-task-created.event.ts";
import type { ProjectCreatedEvent } from "../../domain/event/project-created.event.ts";
import type {
	IDomainEventConsumer,
} from "../../../shared/domain/event/domain-event.handler.ts";
import type { ICopilotRepository } from "../../domain/interface/copilot-repository.interface.ts";

export class CopilotSessionCreatedEventConsumer implements IDomainEventConsumer<CopilotSessionCreatedEvent> {
	constructor(
		private readonly copilotNetwork: ICopilotNetworkService,
		private readonly projectService: IZionProjectService,
		private readonly copilotRepositoryService: ICopilotRepositoryService,
		private readonly copilotToolCallHandler: CopilotToolCallHandler,
	) {}
	eventName = "copilot.session.started" as const;
	isActive: boolean = true;

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

	handler = async (event: CopilotSessionCreatedEvent) => {
		const copilotExecutionEventBus = new CopilotExecutionEventBus();
		copilotExecutionEventBus.subscribeToMessageSentEvent(
			this.onMessageSent(event.copilotSessionExId, event.copilotNetwork),
		);
		copilotExecutionEventBus.subscribeToExecutionLogUpdatedEvent(
			this.onExecutionLogUpdated(event.copilotSessionExId),
		);
		const copilotToolCallRunner = this.copilotToolCallHandler.setStaticProject(
			event.project,
		);
		const humanInputMessageEvent = new CopilotInputEvent(
			"CopilotHumanInputMessage",
			{
				content: event.project.getEntity("copilotInput").userInput,
				context: null,
			},
		);
		const handler = new CopilotMessageHandler(
			humanInputMessageEvent,
			copilotToolCallRunner,
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
	};
}

export class CopilotExecutionTaskCreatedEventConsumer implements IDomainEventConsumer<CopilotExecutionTaskCreatedEvent> {
	isActive: boolean = true;
	eventName = "copilot.executionTask.created" as const;
	constructor(
		private readonly subscribe: (
			eventConsumer: IDomainEventConsumer<ProjectCreatedEvent>,
		) => void,
		private readonly projectService: IZionProjectService,
		private readonly copilotNetwork: ICopilotNetworkService,
		private readonly copilotRepository: ICopilotRepository,
	) {}
	handler: IDomainEventConsumer<CopilotExecutionTaskCreatedEvent>["handler"] =
		async (event: CopilotExecutionTaskCreatedEvent) => {
			this.subscribe(
				new ProjectCreatedEventConsumer(
					event,
					this.projectService,
					this.copilotNetwork,
					this.copilotRepository,
				),
			);
		};
}

export class ProjectCreatedEventConsumer implements IDomainEventConsumer<ProjectCreatedEvent> {
	isActive: boolean = true;
	eventName = "zionProject.created" as const;
	constructor(
		private readonly context: CopilotExecutionTaskCreatedEvent,
		private readonly projectService: IZionProjectService,
		private readonly copilotNetwork: ICopilotNetworkService,
		private readonly copilotRepository: ICopilotRepository,
	) {}
	handler = async (event: ProjectCreatedEvent) => {
		if (this.context.projectId !== event.project.getData("id")) {
			return;
		}
		await this.projectService.createSafeCopilotSession(
			event.project,
			this.context.copilotExecution,
		);
		await this.copilotRepository.save(this.context.copilotExecution);
		this.isActive = false;
	};
}
