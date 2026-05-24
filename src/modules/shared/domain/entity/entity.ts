import * as z from "zod";
import { logger } from "../../infrastructure/logger.ts";
export type EntityMetadata = {
  createdAt: z.infer<z.ZodDate> | undefined;
  updatedAt: z.infer<z.ZodDate> | undefined;
  id: string;
};

type EntityKey<
  T extends z.ZodObject = z.ZodObject,
  M extends EntityMetadata = EntityMetadata,
> = keyof (z.infer<T> & M);

export type OneOrMany<T> = T | T[];

type OneOrMoreEntityKey<
  T extends z.ZodObject = z.ZodObject,
  M extends EntityMetadata = EntityMetadata,
> = OneOrMany<EntityKey<T, M>>;
type RawEntityValue<
  T extends z.ZodObject,
  M extends EntityMetadata,
  K extends EntityKey<T, M>,
> = K extends keyof M
  ? M[K]
  : K extends keyof z.infer<T>
    ? z.infer<T>[K & keyof z.infer<T>]
    : never;

type EntityValue<
  T extends z.ZodObject,
  M extends EntityMetadata,
  K extends OneOrMoreEntityKey<T, M>,
> =
  K extends EntityKey<T, M>
    ? RawEntityValue<T, M, K>
    : { [Key in keyof K]: RawEntityValue<T, M, K[Key] & EntityKey<T, M>> };

export class Entity<
  T extends z.ZodObject = z.ZodObject,
  M extends EntityMetadata = EntityMetadata,
> {
  private _data: z.infer<T>;
  private _metadata: M;
  public schema: T;
  constructor(entity: Entity<T, M>);
  constructor(data: z.infer<T>, schema: T, id?: string);
  constructor(
    argument1: Entity<T, M> | z.infer<T>,
    argument2?: T,
    argument3?: string,
  ) {
    if (argument1 instanceof Entity) {
      this._data = argument1._data;
      this._metadata = argument1._metadata;
      this.schema = argument1.schema;
    } else {
      if (!argument2) {
        throw new Error("Schema must be provided when constructing with data.");
      }
      this.schema = argument2;
      this._data = this.schema.parse(argument1);
      this._metadata = {
        id: argument3 ? z.uuidv4().parse(argument3) : crypto.randomUUID(),
      } as M;
    }
  }

  getData<K extends OneOrMoreEntityKey<T, M>>(keys: K): EntityValue<T, M, K>;
  getData(): z.infer<T> & M;
  getData<K extends OneOrMoreEntityKey<T, M>>(
    keys?: K,
  ): EntityValue<T, M, K> | (z.infer<T> & M) {
    if (keys) {
      if (Array.isArray(keys)) {
        if (keys.length === 0) {
          return this.getData();
        }
        return keys.map((key) => this.getData(key)) as EntityValue<T, M, K>;
      } else {
        if (Object.keys(this._data).includes(keys as string)) {
          return this._data[keys as keyof z.infer<T>] as EntityValue<T, M, K>;
        }
        return this._metadata[keys as keyof M] as EntityValue<T, M, K>;
      }
    }
    return { ...this._data, ...this._metadata } as z.infer<T> & M;
  }

  setData<E extends EntityKey<T, M>>(pairs: {
    [Key in E]: RawEntityValue<T, M, Key>;
  }): void {
    for (const [key, value] of Object.entries(pairs) as [
      E,
      RawEntityValue<T, M, E>,
    ][]) {
      if (key in this._data) {
        this._data[key as keyof z.infer<T>] =
          this.schema.shape[key as keyof typeof this.schema.shape].parse(value);
      } else if (key in this._metadata) {
        this._metadata[key as keyof M] = value as M[keyof M];
      } else {
        logger.error(
          `Attempted to set invalid key "${key.toString()}" on entity. Valid keys are: ${[...Object.keys(this._data), ...Object.keys(this._metadata)].join(", ")}`,
        );
      }
    }
  }
}
