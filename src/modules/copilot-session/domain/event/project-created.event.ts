import type { Account } from "../../../account/domain/entity/account.entity.ts";
import type { NetworkClient } from "../../../account/domain/entity/network-client.entity.ts";
import type { CopilotInputAggregate } from "../../../dataset/domain/aggregate/copilot-input.aggregate.ts";
import { DomainEventService, type IDomainEvent } from "../../../shared/domain/event/domain-event.interface.ts";
import type { ProjectAggregate } from "../aggregate/project.aggregate.ts";
import type { ZionProject } from "../entity/zion-project.entity.ts";

export const projectCreationTaskCreatedEventService = new DomainEventService<
  {
    zionProject: ZionProject;
    account: Account;
    projectNetwork: NetworkClient;
    copilotInput: CopilotInputAggregate;
  }>("zionProject.creationTask.created");



export class ProjectCreationTaskCreated implements IProjectCreationTaskCreated {
  readonly name = "zionProject.creationTask.created";
  readonly createdAt: Date = new Date();

  constructor(
    readonly data: {
      zionProject: ZionProject;
      account: Account;
      projectNetwork: NetworkClient;
      copilotInput: CopilotInputAggregate;
    },
  ) {}
}

export class ProjectCreatedEvent implements IProjectCreatedEvent {
  readonly name = "zionProject.created";
  readonly createdAt: Date = new Date();

  constructor(readonly data: { project: ProjectAggregate }) {}
}
