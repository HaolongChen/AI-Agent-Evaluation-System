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
import type { CopilotExecutionLogType } from "../schema/copilot-output.schema.ts";
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
	{ copilotInput: CopilotInputAggregate; projectNetwork: NetworkClient; copilotNetwork: NetworkClient }
> {
	public executionLogs: CopilotExecutionLogs = {} as CopilotExecutionLogs;

	constructor(
		copilotInput: CopilotInputAggregate,
    copilotServer: CopilotServerEntity,
    projectNetwork: NetworkClient,
    copilotNetwork: NetworkClient,
  )
  {

		copilotNetwork.setGraphQLUrl(copilotServer.getData("gqlEndpoint"));
		copilotNetwork.setWebSocketUrl(copilotServer.getData("wsEndpoint"));
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
		super(entity, { copilotInput, projectNetwork, copilotNetwork });
	}

	private getSchemaId(): string {
		return this.getEntity("copilotInput")
			.getEntity("goldenSet")
			.getData("schemaId");
  }

  private getUserInput (): string
  {
    return this.getEntity("copilotInput").getEntity("userInput").getData("content");
  }

	start(project: ZionProject, account: Account) {
		const projectId = project.getData("id");
		this.setData({ projectId });
		project.setData({ schemaId: this.getSchemaId() });
		this.addEvent(new ProjectCreatedEvent(project, account, this.getEntity("projectNetwork")));
	}

	resume(projectExId: string) {
		const projectIdToUse = this.getData("projectId");
		if (!projectIdToUse) {
			throw new Error("Project ID is required to start copilot execution.");
		}
		const copilotSessionExIdToUse = this.getData("copilotSessionExId");
		if (copilotSessionExIdToUse) {
			const executionLog: CopilotExecutionLogType = {
				copilotSessionExId: copilotSessionExIdToUse,
				projectExId,
				userInput: this.getUserInput(),
				...this.executionLogs,
			};
			this.addEvent(
				new CopilotExecutionStarted(
					executionLog,
					this.getEntity("copilotNetwork"),
          this.getEntity("projectNetwork"),
				),
			);
		} else {
			this.addEvent(
				new CopilotSessionCreatedEvent(
					this.getData("id"),
          projectIdToUse,
          this.getUserInput(),
					projectExId,
					this.getEntity("copilotNetwork"),
          this.getEntity("projectNetwork"),
				),
			);
		}
	}
}
