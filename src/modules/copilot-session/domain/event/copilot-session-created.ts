import type { NetworkClient } from "../../../account/domain/entity/network-client.entity.ts";
import { DomainEventService, type IDomainEvent } from "../../../shared/domain/event/domain-event.interface.ts";
import type { ProjectAggregate } from "../aggregate/project.aggregate.ts";


export const copilotSessionCreatedEventService = new DomainEventService<
  {
    copilotSessionExId: string;
    copilotNetwork: NetworkClient;
    project: ProjectAggregate;
  }>
("copilot.session.started");

export class CopilotSessionCreatedEvent implements ICopilotSessionCreatedEvent {
  readonly name = "copilot.session.started";
  readonly createdAt = new Date();

  constructor(
    readonly data: {
      copilotSessionExId: string;
      copilotNetwork: NetworkClient;
      project: ProjectAggregate;
    },
  ) {}
}
