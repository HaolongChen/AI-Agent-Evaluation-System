import { NetworkClient } from "../../../account/domain/entity/network-client.entity.ts";
import type { CopilotServerEntity } from "../../../dataset/domain/entity/copilot-server.entity.ts";
import { AggregateRoot } from "../../../shared/domain/aggregate/aggregate-root.ts";
import { Entity } from "../../../shared/domain/entity/entity.ts";
import { CopilotExecutionTaskCreatedEvent } from "../event/copilot-execution-task-created.event.ts";
import { CopilotSessionCreatedEvent } from "../event/copilot-session-created.ts";
import {
  copilotExecutionSchema,
  type CopilotExecutionMetadata,
  type CopilotExecutionStatus,
} from "../schema/copilot.schema.ts";
import type { ProjectAggregate } from "./project.aggregate.ts";

// TODO: should be divided into two aggregates: CopilotExecutionAggregate and CopilotSessionAggregate
// pending -> add project -> create session -> running -> complete
export class CopilotExecutionAggregate extends AggregateRoot<
  typeof copilotExecutionSchema,
  CopilotExecutionMetadata
> {
  public readonly network: NetworkClient = NetworkClient.createDefault();
  public project: ProjectAggregate | undefined;

  constructor(
    copilotServer: CopilotServerEntity,
    readonly copilotInputId: string,
  ) {
    const entity = new Entity<
      typeof copilotExecutionSchema,
      CopilotExecutionMetadata
    >(
      {
        copilotServerId: copilotServer.getData("id"),
      },
      copilotExecutionSchema,
      { state: { status: "pending" } },
    );
    super(entity, {});
    this.network.setWebSocketUrl(copilotServer.getData("wsEndpoint"));
    this.network.setGraphQLUrl(copilotServer.getData("gqlEndpoint"));
  }

  get state() {
    return this.getData("state");
  }

  static reconcile(
    copilotServer: CopilotServerEntity,
    project: ProjectAggregate,
  ) {
    const copilotExecution = new CopilotExecutionAggregate(
      copilotServer,
      project.getData("copilotInputId"),
    );
    copilotExecution.importProject(project);
    return copilotExecution;
  }

  static createExecutionTask(
    copilotServer: CopilotServerEntity,
    copilotInputId: string,
  ): CopilotExecutionAggregate {
    const copilotExecution = new CopilotExecutionAggregate(
      copilotServer,
      copilotInputId,
    );
    copilotExecution.addEvent(
      new CopilotExecutionTaskCreatedEvent({
        copilotExecution,
        copilotInputId,
      }),
    );
    return copilotExecution;
  }

  protected importProject(project: ProjectAggregate) {
    if (project.getData("copilotInputId") !== this.copilotInputId) {
      throw new Error("Project ID mismatch.");
    }
    this.project = project;
  }

  verifyActivatedProject(project: ProjectAggregate): string {
    if (
      project.getData("copilotInputId") !== this.copilotInputId &&
      project.state.status === "active"
    ) {
      throw new Error(
        "Project ID mismatch between CopilotExecutionAggregate and ProjectAggregate.",
      );
    }
    const projectExId = project.acquire();
    this.project = project;
    return projectExId;
  }

  start(copilotSessionExId: string) {
    const project = this.project;
    if (!project) {
      throw new Error(
        "Project must be set before starting CopilotExecutionAggregate.",
      );
    }
    this.setData({
      state: { status: "running", copilotSessionExId },
    });
    project.account.acquireNetwork(this.network);
    this.addEvent(
      new CopilotSessionCreatedEvent({
        copilotSessionExId,
        copilotNetwork: this.network,
        project,
      }),
    );
    // this.project = undefined;
  }
}


export class CopilotExecutionAggregateV2 extends AggregateRoot<
	typeof copilotExecutionSchema,
	CopilotExecutionMetadata<"pending">
> {
	public readonly network: NetworkClient = NetworkClient.createDefault();

	constructor(
		copilotServer: CopilotServerEntity,
		readonly copilotInputId: string,
	) {
		const entity = new Entity<
			typeof copilotExecutionSchema,
			CopilotExecutionMetadata<"pending">
		>(
			{
				copilotServerId: copilotServer.getData("id"),
			},
			copilotExecutionSchema,
			{  status: "pending", state: undefined } ,
		);
		super(entity, {});
		this.network.setWebSocketUrl(copilotServer.getData("wsEndpoint"));
		this.network.setGraphQLUrl(copilotServer.getData("gqlEndpoint"));
	}

	get state() {
		return this.getData("state");
	}

	static reconcile(
		copilotServer: CopilotServerEntity,
		project: ProjectAggregate,
	) {
		const copilotExecution = new CopilotExecutionAggregate(
			copilotServer,
			project.getData("copilotInputId"),
		);
		copilotExecution.importProject(project);
		return copilotExecution;
	}

	static createExecutionTask(
		copilotServer: CopilotServerEntity,
		copilotInputId: string,
	): CopilotExecutionAggregate {
		const copilotExecution = new CopilotExecutionAggregate(
			copilotServer,
			copilotInputId,
		);
		copilotExecution.addEvent(
			new CopilotExecutionTaskCreatedEvent({
				copilotExecution,
				copilotInputId,
			}),
		);
		return copilotExecution;
	}

	protected importProject(project: ProjectAggregate) {
		if (project.getData("copilotInputId") !== this.copilotInputId) {
			throw new Error("Project ID mismatch.");
		}
		this.project = project;
	}

	verifyActivatedProject(project: ProjectAggregate): string {
		if (
			project.getData("copilotInputId") !== this.copilotInputId &&
			project.state.status === "active"
		) {
			throw new Error(
				"Project ID mismatch between CopilotExecutionAggregate and ProjectAggregate.",
			);
		}
		const projectExId = project.acquire();
		this.project = project;
		return projectExId;
	}

	start(copilotSessionExId: string) {
		const project = this.project;
		if (!project) {
			throw new Error(
				"Project must be set before starting CopilotExecutionAggregate.",
			);
		}
		this.setData({
			state: { status: "running", copilotSessionExId },
		});
		project.account.acquireNetwork(this.network);
		this.addEvent(
			new CopilotSessionCreatedEvent({
				copilotSessionExId,
				copilotNetwork: this.network,
				project,
			}),
		);
		// this.project = undefined;
	}
}
