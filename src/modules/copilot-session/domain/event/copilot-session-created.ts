import type { NetworkClient } from "../../../account/domain/entity/network-client.entity.ts";
import type { IDomainEvent } from "../../../shared/domain/event/domain-event.interface.ts";
import type { CopilotExecutionLogType } from "../schema/copilot-output.schema.ts";

export class CopilotSessionCreatedEvent implements IDomainEvent {
  readonly name = "copilot.session.started";
  readonly createdAt = new Date();

  constructor (
    public readonly copilotExecutionId: string,
    public readonly projectId: string,
    public readonly projectExId: string,
    public readonly userInput: string,
    public readonly copilotNetwork: NetworkClient,
    public readonly projectNetwork: NetworkClient,
  ) {}
}

export class CopilotExecutionStarted implements IDomainEvent {
  readonly name = "copilot.execution.started";
  readonly createdAt = new Date();

  constructor (
    public readonly executionLog: CopilotExecutionLogType,
    public readonly copilotNetwork: NetworkClient,
    public readonly projectNetwork: NetworkClient,
  ) {}
}