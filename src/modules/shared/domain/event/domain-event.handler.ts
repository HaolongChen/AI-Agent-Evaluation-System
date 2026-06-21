import type { IDomainEvent } from "./domain-event.interface.ts";

export type DomainEventHandler<
  Event extends IDomainEvent<Name>,
  Name extends string,
> = (event: Event) => Promise<void> | void;

export interface IDomainEventConsumer<Event extends IDomainEvent> {
  eventName: Event["name"];
  handler: (event: Event) => Promise<void> | void;
  isActive: boolean;
}
