import type { IDomainEvent } from "../../../shared/domain/event/domain-event.interface.ts";

export class SchemaImportedEvent implements IDomainEvent {
	readonly name = "SchemaImportedEvent";
	readonly createdAt: Date = new Date();

	constructor(
		public readonly schemaId: string,
		public readonly projectExId: string,
	) {}
}
