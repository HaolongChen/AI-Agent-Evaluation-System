import type { IDomainEventConsumer } from "./domain-event.handler.ts";
import type { IDomainEvent } from "./domain-event.interface.ts";

export interface IDomainEventBus<Name extends [...string[]]> {
  publish<T extends IDomainEvent<Name[number]>>(event: T): Promise<void>;

  publishAll<T extends IDomainEvent<Name[number]>>(
    events: T[],
  ): Promise<void[]>;
  subscribe(consumer: IDomainEventConsumer<IDomainEvent<Name[number]>>): void;
}
