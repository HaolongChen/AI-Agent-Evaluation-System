import type { DomainEventHandler } from "./domain-event.handler.ts";
import type { IDomainEvent } from "./domain-event.interface.ts";

export interface IDomainEventBus {
	publish<T extends IDomainEvent>(event: T): Promise<void>;
	subscribe<T extends IDomainEvent>(
		eventName: string,
		handler: DomainEventHandler<T>,
	): void;
}
