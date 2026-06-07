import type { IDomainEvent } from "./domain-event.interface.ts";

export type DomainEventHandler<T extends IDomainEvent> = (
	event: T,
) => Promise<void> | void;
