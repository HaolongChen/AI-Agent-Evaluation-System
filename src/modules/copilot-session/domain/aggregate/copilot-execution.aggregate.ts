import type { CopilotInputAggregate } from "../../../dataset/domain/aggregate/copilot-input.aggregate.ts";
import type { CopilotServerEntity } from "../../../dataset/domain/entity/copilot-server.entity.ts";
import { AggregateRoot } from "../../../shared/domain/aggregate/aggregate-root.ts";
import {
	Entity,
	type EntityMetadata,
} from "../../../shared/domain/entity/entity.ts";
import { CopilotSessionCreatedEvent } from "../event/copilot-session-created.ts";
import { ProjectLinkedEvent } from "../event/project-created.event.ts";
import { SchemaImportedEvent } from "../event/schema-imported.event.ts";
import {
	copilotExecutionSchema,
	type CopilotExecutionLogs,
} from "../schema/copilot.schema.ts";

export class CopilotExecutionAggregate extends AggregateRoot<
	typeof copilotExecutionSchema,
	EntityMetadata & {
		copilotSessionExId?: string;
		projectId?: string;
		userInput: string;
		schemaId: string;
	}
> {
	public executionLogs: CopilotExecutionLogs = {} as CopilotExecutionLogs;

	constructor(
		copilotInput: CopilotInputAggregate,
		copilotServer: CopilotServerEntity,
	) {
		const entity = new Entity<
			typeof copilotExecutionSchema,
			EntityMetadata & {
				userInput: string;
				schemaId: string;
			}
		>(
			{
				copilotInputId: copilotInput.getData("id"),
				copilotServerId: copilotServer.getData("id"),
			},
			copilotExecutionSchema,
			{
				userInput: copilotInput.getEntity("userInput").getData("content"),
				schemaId: copilotInput.getEntity("goldenSet").getData("schemaId"),
			},
		);
		super(entity, {});
	}

	linkProject(projectId: string) {
		this.setData({ projectId });
		this.addEvent(
			new ProjectLinkedEvent(
				projectId,
				this.getData("copilotInputId"),
				this.getData("copilotServerId"),
			),
		);
		this.addEvent(new SchemaImportedEvent(this.getData("schemaId"), projectId));
	}

	startExecution(copilotSessionExId: string) {
		const projectId = this.getData("projectId");
		if (!projectId) {
			throw new Error("Project must be linked before starting execution.");
		}
		this.setData({ copilotSessionExId });
		this.addEvent(
			new CopilotSessionCreatedEvent(
				copilotSessionExId,
				this.getData("id"),
				projectId,
			),
		);
	}
}
