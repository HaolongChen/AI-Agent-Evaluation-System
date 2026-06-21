import type { NetworkClient } from "../../../account/domain/entity/network-client.entity.ts";
import type { IDomainEvent } from "../../../shared/domain/event/domain-event.interface.ts";

export class ProjectDeletedEvent implements IDomainEvent {
  readonly name = "zionProject.deleted";
  readonly createdAt: Date = new Date();

  constructor(
    readonly data: {
      projectExId: string;
      network: NetworkClient;
    },
  ) {}
}
