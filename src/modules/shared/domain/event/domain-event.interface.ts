import { DomainEventConsumer, type IDomainEventHandler } from "./domain-event.handler.ts";

export interface IDomainEvent<D = unknown> {
  readonly name: string;
  readonly createdAt: Date;
  readonly data: D;
}

export class DomainEventService<T = unknown>
{
  constructor ( readonly name: string ) {}

  raise ( data: T ): DomainEvent<T>
  {
    return new DomainEvent<T>( this.name, data );
  }

  handle ( handler: IDomainEventHandler<DomainEvent<T>> ): DomainEventConsumer<DomainEvent<T>>
  {
    return new DomainEventConsumer<DomainEvent<T>>( this.name, handler.handler, handler.isActive );
  }
}

export class DomainEvent<D = unknown> implements IDomainEvent<D>
{
  readonly createdAt: Date = new Date();
  constructor(readonly name: string, readonly data: D) {
  }
}