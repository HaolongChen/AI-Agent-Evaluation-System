import z from "zod";
import { Entity } from "../entity/entity.js";

export class AggregateRoot<
  T extends z.ZodObject,
  K extends Entity<T> = Entity<T>,
> extends Entity<T> {
  private _entity: K;
  constructor(entity: K) {
    super(entity.data, entity.schema, entity.id);
    this._entity = entity;
  }
  get entity(): K {
    return this._entity;
  }
}
