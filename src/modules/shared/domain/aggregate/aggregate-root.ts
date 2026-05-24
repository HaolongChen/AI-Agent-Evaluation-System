import z from "zod";
import {
  Entity,
  type EntityMetadata,
  type OneOrMany,
} from "../entity/entity.js";

export class AggregateRoot<
  T extends z.ZodObject,
  M extends EntityMetadata = EntityMetadata,
  E extends Record<string, Entity> = Record<string, Entity>,
> extends Entity<T, M> {
  private _entities: { [K in keyof E]: E[K][] } = {} as {
    [K in keyof E]: E[K][];
  };
  constructor(entity: Entity<T, M>) {
    super(entity);
  }

  getEntity<K extends keyof E>(name: K): E[K][] {
    return this._entities[name];
  }

  pushEntity<K extends keyof E>(name: K, entity: OneOrMany<E[K]>): void {
    if (this._entities[name]) {
      this._entities[name].push(...(Array.isArray(entity) ? entity : [entity]));
    } else {
      this._entities[name] = Array.isArray(entity) ? entity : [entity];
    }
  }
}
