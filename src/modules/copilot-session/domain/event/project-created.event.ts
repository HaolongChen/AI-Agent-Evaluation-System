import type { Account } from "../../../account/domain/entity/account.entity.ts";
import type { NetworkClient } from "../../../account/domain/entity/network-client.entity.ts";
import type { CopilotInputAggregate } from "../../../dataset/domain/aggregate/copilot-input.aggregate.ts";
import type { IDomainEvent } from "../../../shared/domain/event/domain-event.interface.ts";
import type { ZionProject } from "../entity/zion-project.entity.ts";
import type { ProjectTypeOfCopilotExecution } from "../schema/copilot.schema.ts";

export class ProjectCreationTaskCreated implements IDomainEvent {
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

export class ProjectCreatedEvent implements IDomainEvent {
  readonly name = "zionProject.created";
  readonly createdAt: Date = new Date();

  constructor(readonly data: ProjectTypeOfCopilotExecution) {}
}
