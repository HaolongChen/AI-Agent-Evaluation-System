import type { IDomainEvent } from "../../../shared/domain/event/domain-event.interface.ts";

export class ProjectCreatedEvent implements IDomainEvent {
	readonly name = "zionProject.created";
	readonly createdAt: Date = new Date();

	constructor(
		public readonly project: {
			name: string;
			exId: string;
			id: string;
		},
	) {}
}
