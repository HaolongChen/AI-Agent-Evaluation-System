import type { Account } from "../../../account/domain/entity/account.entity.ts";
import type { NetworkClient } from "../../../account/domain/entity/network-client.entity.ts";
import type { CopilotInputAggregate } from "../../../dataset/domain/aggregate/copilot-input.aggregate.ts";
import type { CopilotServerEntity } from "../../../dataset/domain/entity/copilot-server.entity.ts";
import { AggregateRoot } from "../../../shared/domain/aggregate/aggregate-root.ts";
import {
	Entity,
	type EntityMetadata,
} from "../../../shared/domain/entity/entity.ts";
import type { ZionProject } from "../entity/zion-project.entity.ts";
import {
	CopilotExecutionStarted,
	CopilotSessionCreatedEvent,
} from "../event/copilot-session-created.ts";
import { ProjectCreatedEvent } from "../event/project-created.event.ts";
import {
	copilotExecutionSchema,
	type CopilotExecutionLogs,
} from "../schema/copilot.schema.ts";

export class CopilotExecutionAggregate extends AggregateRoot<
	typeof copilotExecutionSchema,
	EntityMetadata & {
		projectId?: string;
		copilotSessionExId?: string;
	},
	{ copilotInput: CopilotInputAggregate; networkClient: NetworkClient }
> {
	public executionLogs: CopilotExecutionLogs = {} as CopilotExecutionLogs;

	constructor(
		copilotInput: CopilotInputAggregate,
		copilotServer: CopilotServerEntity,
		networkClient: NetworkClient,
	) {
		networkClient.setGraphQLUrl(copilotServer.getData("gqlEndpoint"));
		networkClient.setWebSocketUrl(copilotServer.getData("wsEndpoint"));
		const entity = new Entity<
			typeof copilotExecutionSchema,
			EntityMetadata & { projectId?: string }
		>(
			{
				copilotInputId: copilotInput.getData("id"),
				copilotServerId: copilotServer.getData("id"),
			},
			copilotExecutionSchema,
			{},
		);
		super(entity, { copilotInput, networkClient });
	}

	private getSchemaId(): string {
		return this.getEntity("copilotInput")
			.getEntity("goldenSet")
			.getData("schemaId");
	}

	start(project: ZionProject, account: Account, projectNetwork: NetworkClient) {
		const projectId = project.getData("id");
		this.setData({ projectId });
		project.setData({ schemaId: this.getSchemaId() });
		this.addEvent(new ProjectCreatedEvent(project, account, projectNetwork));
	}

	resume(projectExId: string, projectId?: string, copilotSessionExId?: string) {
		const projectIdToUse = projectId || this.getData("projectId");
		if (!projectIdToUse) {
			throw new Error("Project ID is required to start copilot execution.");
		}
		const copilotSessionExIdToUse =
			copilotSessionExId || this.getData("copilotSessionExId");
		if (copilotSessionExIdToUse) {
			this.addEvent(
				new CopilotExecutionStarted(
					copilotSessionExIdToUse,
					projectExId,
					this.getEntity("networkClient"),
				),
			);
		} else {
			this.addEvent(
				new CopilotSessionCreatedEvent(
					this.getData("id"),
					projectIdToUse,
					projectExId,
					this.getEntity("networkClient"),
				),
			);
		}
	}
}
