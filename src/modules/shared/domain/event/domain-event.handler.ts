import type { IDomainEvent } from "./domain-event.interface.ts";

export type DomainEventHandler<Event extends IDomainEvent> = (
	event: Event,
) => Promise<void> | void;