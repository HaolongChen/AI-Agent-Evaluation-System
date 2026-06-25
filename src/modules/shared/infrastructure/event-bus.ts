import type { IDomainEventBus } from "../domain/event/domain-event.bus.ts";
import type { DomainEventConsumer, IDomainEventConsumer } from "../domain/event/domain-event.handler.ts";
import type { DomainEvent, DomainEventService, IDomainEvent } from "../domain/event/domain-event.interface.ts";

export class EventBus<T extends DomainEventService[] = DomainEventService[]> implements IDomainEventBus<T>
{
  protected consumers: Map<T[ number ][ 'name' ], ReturnType<T[ number ][ 'handle' ]>[]>;
  constructor ( ...eventServices: [...T] )
  {
    this.consumers = new Map<T[number]['name'], ReturnType<T[number]['handle']>[]>( eventServices.map( ( service ) => [ service.name, [] ] ) );
  }
    async publish<E extends { [ K in keyof T ]: ReturnType<T[ K ][ "raise" ]>; }[ keyof T ]> ( event:  E): Promise<void>
    {
      const consumers = this.consumers.get(event.name) as DomainEventConsumer<E>[];
      if ( !consumers )
      {
        return;
      }
      await Promise.all( consumers.map( ( consumer ) => consumer.handler( event ) ) );
    }
    async publishAll<D extends DomainEvent[]> ( events: D ): Promise<void[]>
    {
      for ( const event of events )
      {
        await this.publish( event );
      }
    }
    subscribe<C extends { [ K in keyof T ]: ReturnType<T[ K ][ "handle" ]>; }[ keyof T ] > ( consumer: C ): void
    {
      this.consumers.set( consumer.eventName, [ ...( this.consumers.get( consumer.eventName ) || [] ), consumer ] );
    }
}
