import type { AccountEntity } from "../../../account/domain/entity/account.entity.ts";
import type { CopilotInputAggregate } from "../../../dataset/domain/aggregate/copilot-input.aggregate.ts";
import type { CopilotServerEntity } from "../../../dataset/domain/entity/copilot-server.entity.ts";
import { AggregateRoot } from "../../../shared/domain/aggregate/aggregate-root.ts";
import {
	Entity,
	type EntityMetadata,
} from "../../../shared/domain/entity/entity.ts";
import type { ProjectEntity } from "../entity/project.entity.ts";
import { SchemaImportedEvent } from "../event/schema-imported.event.ts";
import { copilotExecutionSchema } from "../schema/copilot.schema.ts";
import type { CopilotExecutionLogs } from "../schema/project.schema.ts";

export class CopilotExecutionAggregate extends AggregateRoot<
	typeof copilotExecutionSchema,
	EntityMetadata & {
		copilotSessionExId?: string;
		projectId?: string;
		wsUrl: string;
		gqlUrl: string;
		userInput: string;
		schemaId: string;
	},
	{ owner: AccountEntity }
> {
	public executionLogs: CopilotExecutionLogs = {} as CopilotExecutionLogs;

	constructor(
		copilotInput: CopilotInputAggregate,
		copilotServer: CopilotServerEntity,
		owner: AccountEntity,
	) {
		const entity = new Entity<
			typeof copilotExecutionSchema,
			EntityMetadata & {
				wsUrl: string;
				gqlUrl: string;
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
				wsUrl: copilotServer.getData("wsEndpoint"),
				gqlUrl: copilotServer.getData("gqlEndpoint"),
				userInput: copilotInput.getEntity("userInput").getData("content"),
				schemaId: copilotInput.getEntity("goldenSet").getData("schemaId"),
			},
		);
		super(entity, { owner });
	}

	linkProject(project: ProjectEntity) {
		const projectId = project.getData("id");
		this.setData({ projectId: projectId });
		this.addEvent(new SchemaImportedEvent(this.getData("schemaId"), projectId));
	}
}
