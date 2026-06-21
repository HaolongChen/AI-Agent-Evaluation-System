import type { IDomainEventBus } from "../modules/shared/domain/event/domain-event.bus.ts";
import type {
  DomainEventHandler,
  IDomainEventConsumer,
} from "../modules/shared/domain/event/domain-event.handler.ts";
import type { IDomainEvent } from "../modules/shared/domain/event/domain-event.interface.ts";

export class EventBus implements IDomainEventBus {
  protected consumerMap: Map<string, IDomainEventConsumer<IDomainEvent>[]> =
    new Map();

  async publishAll<T extends IDomainEvent>(events: T[]): Promise<void[]> {
    return Promise.all(events.map((event) => this.publish(event)));
  }

  async publish<T extends IDomainEvent>(event: T): Promise<void> {
    const consumers = this.consumerMap.get(event.name);
    if (!consumers) {
      return;
    }
    const persistentConsumers = [];
    for (const consumer of consumers) {
      await consumer.handler(event);
      if (!consumer.once) {
        persistentConsumers.push(consumer);
      }
    }
    this.consumerMap.set(event.name, persistentConsumers);
  }
  subscribe<T extends IDomainEvent>(
    eventName: T["name"],
    handler: DomainEventHandler<T>,
    once: boolean = false,
  ): void {
    const consumer: IDomainEventConsumer<T> = {
      once,
      handler,
    };
    const oldConsumers = this.consumerMap.get(eventName) || [];
    this.consumerMap.set(eventName, [
      ...oldConsumers,
      consumer as IDomainEventConsumer<IDomainEvent>,
    ]);
  }
}
