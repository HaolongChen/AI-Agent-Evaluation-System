import type { DomainEvent } from "./domain-event.interface.ts";

export interface IDomainEventHandler<Event extends DomainEvent
  >
{
  handler ( event: Event ): Promise<void> | void;
  isActive: boolean;
}

export interface IDomainEventConsumer<T extends DomainEvent> extends IDomainEventHandler<T> {
  readonly eventName: T['name'];
}


export class DomainEventConsumer<T extends DomainEvent = DomainEvent> implements IDomainEventConsumer<T>
{
  constructor(
    readonly eventName: T[ 'name' ],
    readonly handler: IDomainEventHandler<T>[ 'handler' ],
    public isActive: boolean = true
  )
  {

  }

}