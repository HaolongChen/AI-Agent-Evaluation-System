import type { CopilotInputAggregate } from "../../../dataset/domain/aggregate/copilot-input.aggregate.ts";
import { AggregateRoot } from "../../../shared/domain/aggregate/aggregate-root.ts";
import { Entity } from "../../../shared/domain/entity/entity.ts";
import {
  projectConfigSchema,
  projectSchema,
  type ProjectMetadata,
} from "../schema/project.schema.ts";
import { NetworkClient } from "../../../account/domain/entity/network-client.entity.ts";
import { ProjectCreatedEvent } from "../event/project-created.event.ts";
import type { Account } from "../../../account/domain/entity/account.entity.ts";
import { ProjectDeletedEvent } from "../event/project-deleted.event.ts";
import { ZionProject } from "../entity/zion-project.entity.ts";
import type { z } from "zod";

// pending -> creating zion project -> importing schema if applicable -> active
export class ProjectAggregate extends AggregateRoot<
  typeof projectSchema,
  ProjectMetadata,
  { copilotInput: CopilotInputAggregate }
> {
  constructor(copilotInput: CopilotInputAggregate, id?: string) {
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
  }

  projectCreated(
    projectExId: string,
    account: Account,
    projectNetwork: NetworkClient,
  ) {
    this.setData({ projectExId });
    this.addEvent(
      new ProjectCreatedEvent({
        projectExId,
        copilotInputId: this.getData("copilotInputId"),
        projectNetwork,
        account,
      }),
    );
  }

  configureZionProject(
    config: z.input<typeof projectConfigSchema>,
  ): ZionProject {
    return new ZionProject({
      ...config,
      schemaId: this.getEntity("copilotInput")
        .getEntity("goldenSet")
        .getData("schemaId"),
      projectName: this.getEntity("copilotInput").projectName,
    });
  }

  get state() {
    return this.getData("state");
  }

  delete(account: Account): boolean {
    const network = NetworkClient.createDefault();
    account.acquireNetwork(network);
    if (this.state.status === "active") {
      const projectExId = this.state.projectExId;
      this.setData({ state: { status: "deleted" } });
      this.addEvent(new ProjectDeletedEvent({ projectExId, network }));
      return true;
    }
    return false;
  }
}
