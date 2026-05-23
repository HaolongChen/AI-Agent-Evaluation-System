import z from "zod";
import { Entity } from "../entity/entity.js";

export class AggregateRoot<
  T extends z.ZodObject,
  K extends Entity<T> = Entity<T>,
> extends Entity<T> {
  constructor(entity: K) {
    super(entity);
  }
}
