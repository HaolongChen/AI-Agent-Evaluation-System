import type { Entity } from "../entity/entity.ts";

export interface IRepository<T extends Entity> {
  save(entity: T): Promise<void>;
  findById(id: string, options: object): Promise<T>;
}
