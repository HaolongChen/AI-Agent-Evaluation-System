import type { IDomainEventBus } from "../modules/shared/domain/event/domain-event.bus.ts";
import type { DomainEventHandler } from "../modules/shared/domain/event/domain-event.handler.ts";
import type { IDomainEvent } from "../modules/shared/domain/event/domain-event.interface.ts";

export class EventBus implements IDomainEventBus {
	private handlerMap: Map<string, DomainEventHandler<IDomainEvent>[]> =
		new Map();

	async publishAll<T extends IDomainEvent>(
		events: T[],
	): Promise<PromiseSettledResult<void>[][]> {
		return Promise.all(events.map((event) => this.publish(event)));
	}

	async publish<T extends IDomainEvent>(
		event: T,
	): Promise<PromiseSettledResult<void>[]> {
		const handlers = this.handlerMap.get(event.name);
		if (!handlers) {
			return [];
		}
		return Promise.allSettled(handlers.map((handler) => handler(event)));
	}
	subscribe<T extends IDomainEvent>(
		eventName: T["name"],
		handler: DomainEventHandler<T>,
	): void {
		const oldHandlers = this.handlerMap.get(eventName) || [];
		this.handlerMap.set(eventName, [
			...oldHandlers,
			handler as DomainEventHandler<IDomainEvent>,
		]);
	}
}