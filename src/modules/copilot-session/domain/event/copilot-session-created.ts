import type { IDomainEvent } from "../../../shared/domain/event/domain-event.interface.ts";

export class CopilotSessionCreatedEvent implements IDomainEvent {
  readonly name = "copilot.session.created";
  readonly createdAt = new Date();

  constructor(public readonly copilotSessionExId: string) {}
}
