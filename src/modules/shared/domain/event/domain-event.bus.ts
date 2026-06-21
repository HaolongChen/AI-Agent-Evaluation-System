import type { DomainEventHandler } from "./domain-event.handler.ts";
import type { IDomainEvent } from "./domain-event.interface.ts";

export interface IDomainEventBus {
  publish<T extends IDomainEvent>(
    event: T,
  ): Promise<PromiseSettledResult<void>[]>;

  publishAll<T extends IDomainEvent>(
    events: T[],
  ): Promise<PromiseSettledResult<void>[][]>;
  subscribe<T extends IDomainEvent>(
    eventName: T["name"],
    handler: DomainEventHandler<T>,
  ): void;
}


