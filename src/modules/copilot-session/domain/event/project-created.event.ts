import type { z } from "zod";
import type { IDomainEvent } from "../../../shared/domain/event/domain-event.interface.ts";
import { projectSchema } from "../schema/project.schema.ts";

export class ProjectCreatedEvent implements IDomainEvent {
	readonly name = "zionProject.created";
	readonly createdAt: Date = new Date();

	constructor(
		public readonly project: z.infer<typeof projectSchema>,
		public readonly copilotInputId: string,
		public copilotServerId: string,
	) {}
}
