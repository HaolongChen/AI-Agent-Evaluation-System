import z from "zod";
import {
  Entity,
  type EntityMetadata,
  type OneOrMany,
} from "../entity/entity.js";
import { logger } from "../../infrastructure/logger.ts";

export class AggregateRoot<
  T extends z.ZodObject,
  M extends EntityMetadata = EntityMetadata,
  E extends Record<string, OneOrMany<Entity>> = Record<
    string,
    OneOrMany<Entity>
  >,
> extends Entity<T, M> {
  private _entities: { [ K in keyof E ]: E[ K ] };
  constructor(entity: Entity<T, M>, aggregatedEntities: E) {
    super(entity);
    this._entities = aggregatedEntities;
  }

  getEntity(): typeof this._entities;
  getEntity<K extends keyof E>(name: K): E[K];
  getEntity<K extends keyof E>(name?: K): unknown {
    return name ? this._entities[name] : this._entities;
  }

  pushEntity<K extends keyof Extract<E, Record<string, Entity[]>>>(
    name: K,
    entity: E[K & keyof E] extends Array<infer U extends Entity>
      ? OneOrMany<U>
      : never,
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
