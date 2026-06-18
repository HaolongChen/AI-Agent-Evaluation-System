import type { Account } from "../../../account/domain/entity/account.entity.ts";
import type { NetworkClient } from "../../../account/domain/entity/network-client.entity.ts";
import type { IDomainEvent } from "../../../shared/domain/event/domain-event.interface.ts";
import type { ZionProject } from "../entity/zion-project.entity.ts";

export class ProjectCreatedEvent implements IDomainEvent {
  readonly name = "zionProject.created";
  readonly createdAt: Date = new Date();

  constructor(
    public readonly zionProject: ZionProject,
    public readonly account: Account,
    public readonly projectNetwork: NetworkClient,
  ) {}
}
