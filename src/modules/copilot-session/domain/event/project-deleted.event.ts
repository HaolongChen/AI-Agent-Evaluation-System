import type { NetworkClient } from "../../../account/domain/entity/network-client.entity.ts";
import { DomainEvent, DomainEventService, type IDomainEvent } from "../../../shared/domain/event/domain-event.interface.ts";

export const projectDeletedEventService = new DomainEventService< {
    projectExId: string;
    network: NetworkClient;
  }
>("zionProject.deleted");


export class ProjectDeletedEvent extends DomainEvent<"zionProject.deleted", {
  projectExId: string;
  network: NetworkClient;
}> {
  constructor(
    readonly data: {
      projectExId: string;
      network: NetworkClient;
    },
  ) {
    super("zionProject.deleted", data);
  }
}