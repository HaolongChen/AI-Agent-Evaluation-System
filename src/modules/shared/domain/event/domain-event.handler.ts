import type { IDomainEvent } from "./domain-event.interface.ts";

export type DomainEventHandler<Event extends IDomainEvent = IDomainEvent> = (
  event: Event,
) => Promise<void> | void;

export interface IDomainEventConsumer<
  Event extends IDomainEvent = IDomainEvent,
> {
  handler: DomainEventHandler<Event>;
  isActive: boolean;
}
