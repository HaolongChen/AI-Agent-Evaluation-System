import type { IDomainEvent } from "../../../shared/domain/event/domain-event.interface.ts";

export class ProjectCreatedEvent implements IDomainEvent {
	readonly name = "zionProject.created";
	readonly createdAt: Date = new Date();

	constructor(
		public readonly project: {
			name: string;
			exId: string;
			id: string;
		}) {}
}

export class ProjectLinkedEvent implements IDomainEvent
{
	readonly name = "zionProject.linked";
	readonly createdAt: Date = new Date();

	constructor(
		public readonly projectId: string,
		public readonly copilotInputId: string,
		public readonly copilotServerId: string,
	) {}
}