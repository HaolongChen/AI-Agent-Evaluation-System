import type { IDomainEvent } from "../../../shared/domain/event/domain-event.interface.ts";
import type { CopilotInputMessage } from "../schema/copilot.schema.ts";

export class CopilotResponseMessageBuiltEvent<
  MessageType extends keyof CopilotInputMessage,
> implements IDomainEvent {
  readonly name = "copilot.execution.responseMessageBuilt";
  readonly createdAt = new Date();

  constructor(public readonly data: CopilotInputMessage[MessageType]) {}
}
