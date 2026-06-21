import { NetworkClient } from "../../../account/domain/entity/network-client.entity.ts";
import type { CopilotServerEntity } from "../../../dataset/domain/entity/copilot-server.entity.ts";
import { AggregateRoot } from "../../../shared/domain/aggregate/aggregate-root.ts";
import { Entity } from "../../../shared/domain/entity/entity.ts";
import { CopilotSessionCreatedEvent } from "../event/copilot-session-created.ts";
import {
  copilotExecutionSchema,
  type CopilotExecutionMetadata,
} from "../schema/copilot.schema.ts";
import type { ProjectAggregate } from "./project.aggregate.ts";

export class CopilotExecutionAggregate extends AggregateRoot<
  typeof copilotExecutionSchema,
  CopilotExecutionMetadata
> {
  public readonly network: NetworkClient = NetworkClient.createDefault();
  public project: ProjectAggregate | undefined;

  constructor(copilotServer: CopilotServerEntity, projectId: string) {
    const entity = new Entity<
      typeof copilotExecutionSchema,
      CopilotExecutionMetadata
    >(
      {
        copilotServerId: copilotServer.getData("id"),
        projectId,
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

  importProject(project: ProjectAggregate) {
    if (project.getData("id") !== this.getData("projectId")) {
      throw new Error("Project ID mismatch.");
    }
    this.project = project;
  }

  verifyActivatedProject(project: ProjectAggregate): string {
    if (project.state.status !== "active") {
      throw new Error(
        "Project must be completed before setting up environment.",
      );
    }
    if (project.getData("id") !== this.getData("projectId")) {
      throw new Error(
        "Project ID mismatch between CopilotExecutionAggregate and ProjectAggregate.",
      );
    }
    this.project = project;
    return project.state.projectExId;
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
      new CopilotSessionCreatedEvent(copilotSessionExId, this.network, project),
    );
    this.project = undefined;
  }

  reconcile;
}
