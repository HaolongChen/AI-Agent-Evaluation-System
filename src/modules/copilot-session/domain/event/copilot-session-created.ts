import type { NetworkClient } from "../../../account/domain/entity/network-client.entity.ts";
import type { IDomainEvent } from "../../../shared/domain/event/domain-event.interface.ts";

export class CopilotSessionCreatedEvent implements IDomainEvent {
  readonly name = "copilot.session.started";
  readonly createdAt = new Date();

  constructor(
    readonly data: {
      copilotSessionExId: string;
      copilotNetwork: NetworkClient;
      projectExId: string;
      projectNetwork: NetworkClient;
      userInputContent: string;
    },
  ) {}
}
