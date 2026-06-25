import type { DomainEventConsumer } from "./domain-event.handler.ts";
import { DomainEventService, type DomainEvent } from "./domain-event.interface.ts";

export interface IDomainEventBus<T extends unknown[]> {
  publish( event: {[K in keyof T]: DomainEvent<T[K]>}[keyof T]): Promise<void>;

  publishAll<D extends DomainEvent[]>(
    events: D
  ): Promise<void[]>;
  subscribe(
    consumer: {[K in keyof T]: DomainEventConsumer<DomainEvent<T[K]>>}[keyof T]
  ): void;
}
