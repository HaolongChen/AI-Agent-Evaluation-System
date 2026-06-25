import type { IDomainEventBus } from "../domain/event/domain-event.bus.ts";
import type { IDomainEventConsumer } from "../domain/event/domain-event.handler.ts";
import type { EventMap } from "../domain/event/domain-event.interface.ts";

// export class EventBus<T extends [...string[]]> implements IDomainEventBus<T> {
//   protected consumerMap: {
//     [K in T[number]]: Map<K, IDomainEventConsumer<IDomainEvent<K>>[]>;
//   }[T[number]];

//   constructor(...eventNameList: T) {
//     this.consumerMap = new Map(
//       eventNameList.map((eventName) => [eventName, []]),
//     );
//   }

//   publishAll = async <E extends IDomainEvent<T[number]>>(
//     events: E[],
//   ): Promise<void[]> => {
//     return Promise.all(events.map((event) => this.publish(event)));
//   };

//   publish = async <E extends IDomainEvent<T[number]>>(
//     event: E,
//   ): Promise<void> => {
//     const consumers = this.consumerMap.get(event.name);
//     if (!consumers) {
//       return;
//     }
//     const persistentConsumers = [];
//     for (const consumer of consumers) {
//       await consumer.handler(event);
//       if (consumer.isActive) {
//         persistentConsumers.push(consumer);
//       }
//     }
//     this.consumerMap.set(event.name, persistentConsumers);
//   };
//   subscribe = (
//     consumer: {
//       [Key in T[number]]: IDomainEventConsumer<IDomainEvent<Key>>;
//     }[T[number]],
//   ): void => {
//     const oldConsumers = this.consumerMap.get(consumer.eventName) || [];
//     this.consumerMap.set(consumer.eventName, [...oldConsumers, consumer]);
//   };
// }

export class EventBus<Em extends EventMap> implements IDomainEventBus<Em> {
  async publish(event: Em[keyof Em]): Promise<void> {
    const consumers = this.consumerMap.get(event.name as keyof Em) || [];
    const persistentConsumers: IDomainEventConsumer<Em, keyof Em>[] = [];
    for (const consumer of consumers) {
      await consumer.handler(event);
      if (consumer.isActive) {
        persistentConsumers.push(consumer);
      }
    }
    this.consumerMap.set(event.name as keyof Em, persistentConsumers);
  }
  publishAll(events: Em[keyof Em & string][]): Promise<void[]> {
    return Promise.all(events.map((event) => this.publish(event)));
  }
  subscribe<T extends keyof Em>(
    consumer: [T] extends [infer U]
      ? U extends keyof Em
        ? IDomainEventConsumer<Em, U>
        : never
      : never,
  ): void {
    const existingConsumers = this.consumerMap.get(consumer.eventName) ?? [];
    this.consumerMap.set(consumer.eventName, [...existingConsumers, consumer]);
  }
  protected consumerMap: Map<keyof Em, IDomainEventConsumer<Em, keyof Em>[]> =
    new Map();
}
