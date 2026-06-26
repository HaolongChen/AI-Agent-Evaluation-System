import type { z } from "zod";
import type { CopilotInputAggregate } from "../../../dataset/domain/aggregate/copilot-input.aggregate.ts";
import { AggregateRoot } from "../../../shared/domain/aggregate/aggregate-root.ts";
import { Entity } from "../../../shared/domain/entity/entity.ts";
import {
  projectConfigSchema,
  projectSchema,
  type ProjectMetadata,
} from "../schema/project.schema.ts";
import { ZionProject } from "../entity/zion-project.entity.ts";
import { NetworkClient } from "../../../account/domain/entity/network-client.entity.ts";
import {
  ProjectCreatedEvent,
  ProjectCreationTaskCreated,
} from "../event/project-created.event.ts";
import type { Account } from "../../../account/domain/entity/account.entity.ts";
import { ProjectDeletedEvent } from "../event/project-deleted.event.ts";

export class ProjectAggregate extends AggregateRoot<
  typeof projectSchema,
  ProjectMetadata,
  { copilotInput: CopilotInputAggregate }
> {
  public readonly network: NetworkClient = NetworkClient.createDefault();
  constructor(
    copilotInput: CopilotInputAggregate,
    public readonly account: Account,
    id?: string,
  ) {
    super(
      new Entity<typeof projectSchema, ProjectMetadata>(
        {
          copilotInputId: copilotInput.getData("id"),
          projectName: copilotInput.projectName,
        },
        projectSchema,
        { id, state: { status: "pending" } },
      ),
      { copilotInput },
    );
    account.acquireNetwork(this.network);
  }

  get state() {
    return this.getData("state");
  }

  activate(projectExId: string) {
    this.setData({ state: { status: "active", projectExId } });
  }

  acquire(): string {
    if (this.state.status === "active") {
      this.setData({
        state: { status: "busy", projectExId: this.state.projectExId },
      });
      return this.state.projectExId;
    }
    throw new Error("Project is not active");
  }

  release() {
    if (this.state.status === "busy") {
      this.setData({
        state: { status: "active", projectExId: this.state.projectExId },
      });
    } else {
      throw new Error("Project is not busy");
    }
  }

  createProject(config: z.input<typeof projectConfigSchema>) {
    this.setData({ state: { status: "creating" } });
    const zionProject = new ZionProject({
      ...config,
      projectName: this.getEntity("copilotInput").projectName,
      schemaId: this.getEntity("copilotInput")
        .getEntity("goldenSet")
        .getData("schemaId"),
    });
    this.addEvent(
      new ProjectCreationTaskCreated({
        zionProject,
        account: this.account,
        projectNetwork: this.network,
        copilotInput: this.getEntity("copilotInput"),
      }),
    );
  }

  delete() {
    if (this.state.status === "active") {
      const projectExId = this.state.projectExId;
      this.setData({ state: { status: "deleted" } });
      this.addEvent(
        new ProjectDeletedEvent({ projectExId, network: this.network }),
      );
    }
  }

  static complete(
    projectExId: string,
    projectId: string,
    copilotInput: CopilotInputAggregate,
    account: Account,
  ): ProjectAggregate {
    const projectAggregate = new ProjectAggregate(
      copilotInput,
      account,
      projectId,
    );
    projectAggregate.activate(projectExId);
    projectAggregate.addEvent(
      new ProjectCreatedEvent({ project: projectAggregate }),
    );

    return projectAggregate;
  }
}
