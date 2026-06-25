import type { IDomainEventConsumer } from "./domain-event.handler.ts";
import type { EventMap } from "./domain-event.interface.ts";

export interface IDomainEventBus<Em extends EventMap> {
  publish(event: Em[keyof Em]): Promise<void>;

  publishAll(events: Em[keyof Em][]): Promise<void[]>;
  subscribe<T extends keyof Em>(
    consumer: [T] extends [infer U]
      ? U extends keyof Em
        ? IDomainEventConsumer<Em, U>
        : never
      : never,
  ): void;
}
