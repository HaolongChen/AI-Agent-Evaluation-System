import z from "zod";
import {
  Entity,
  type EntityMetadata,
  type OneOrMany,
} from "../entity/entity.js";
import { logger } from "../../infrastructure/logger.ts";
import type { IDomainEvent } from "../event/domain-event.interface.ts";

export class AggregateRoot<
  T extends z.ZodObject,
  M extends EntityMetadata = EntityMetadata,
  E extends Record<string, OneOrMany<Entity>> = Record<
    string,
    OneOrMany<Entity>
  >,
> extends Entity<T, M> {
  private _events: IDomainEvent[] = [];

  private _entities: E;
  constructor(entity: Entity<T, M>, aggregatedEntities: E) {
    super(entity);
    this._entities = aggregatedEntities;
  }

  protected addEvent<Event extends IDomainEvent>(event: Event): void {
    this._events.push(event);
  }

  get events(): IDomainEvent[] {
    const events = [...this._events];
    this.clearEvents();
    return events;
  }

  clearEvents(): void {
    this._events = [];
  }

  getEntity(): typeof this._entities;
  getEntity<K extends keyof E>(name: K): E[K];
  getEntity<K extends keyof E>(name?: K): unknown {
    return name ? this._entities[name] : this._entities;
  }

  pushEntity<
    K extends Extract<
      keyof E,
      keyof {
        [Key in keyof E as E[Key] extends Entity[] ? Key : never]: E[Key];
      }
    >,
  >(
    name: K,
    entity: E[K] extends Array<infer U extends Entity> ? OneOrMany<U> : never,
  ): void {
    if (Array.isArray(this._entities[name])) {
      this._entities[name].push(...(Array.isArray(entity) ? entity : [entity]));
    } else {
      logger.warn(
        "Trying to push an entity into a non-array entity slot. Overwriting the existing entity.",
      );
    }
  }

  setEntity<K extends keyof E>(name: K, entity: E[K]): void {
    this._entities[name] = entity;
  }

  getAllData(): {
    aggregator: ReturnType<Entity<T, M>["getData"]>;
    entities: { [K in keyof E]: E[K] };
  } {
    return {
      aggregator: super.getData(),
      entities: this.getEntity(),
    };
  }
}
