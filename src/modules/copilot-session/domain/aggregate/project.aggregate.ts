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
import { ProjectCreatedEvent } from "../event/project-created.event.ts";
import type { Account } from "../../../account/domain/entity/account.entity.ts";
import { ProjectActivatedEvent } from "../event/project-activated.event.ts";
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
    this.addEvent(new ProjectActivatedEvent(this));
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
      new ProjectCreatedEvent(
        zionProject,
        this.account,
        this.network,
        this.getEntity("copilotInput"),
      ),
    );
  }

  delete() {
    if (this.state.status === "active") {
      const projectExId = this.state.projectExId;
      this.setData({ state: { status: "deleted" } });
      this.addEvent(new ProjectDeletedEvent(projectExId, this.network));
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

    return projectAggregate;
  }
}
