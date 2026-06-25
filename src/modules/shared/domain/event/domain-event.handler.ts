import type { EventMap, IDomainEvent } from "./domain-event.interface.ts";

export type DomainEventHandler<
  Event extends IDomainEvent<Name>,
  Name extends string,
> = (event: Event) => Promise<void> | void;

export interface IDomainEventConsumer<
  Em extends EventMap,
  N extends keyof Em = keyof Em,
> {
  eventName: N;
  handler: (event: Em[N]) => Promise<void> | void;
  isActive: boolean;
}
