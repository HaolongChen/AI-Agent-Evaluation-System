import * as z from "zod";
type EntityMetadata = {
  createdAt?: z.infer<z.ZodDate>;
  updatedAt?: z.infer<z.ZodDate>;
  id: string;
};

type EntityKey<E extends Entity> =
  E extends Entity<infer T, infer M> ? keyof (z.infer<T> & M) : never;
type EntityValue<K extends EntityKey<E>, E extends Entity> =
  E extends Entity<infer T, infer M>
    ? K extends keyof z.infer<T>
      ? z.infer<T>[K]
      : K extends keyof M
        ? M[K]
        : never
    : never;

export class Entity<
  T extends z.ZodObject = z.ZodObject,
  M extends EntityMetadata = EntityMetadata,
> {
  protected _data: z.infer<T>;
  private _metadata: M;
  constructor(
    data: z.infer<T>,
    public readonly schema: T,
    id?: string,
  ) {
    this._data = this.schema.parse(data);
    this._metadata = {
      id: id ? z.uuidv4().parse(id) : crypto.randomUUID(),
    } as M;
  }

  getData(key: EntityKey<this>): EntityValue<EntityKey<this>, this>;
  getData(): z.infer<T> & M;
  getData(
    key?: EntityKey<this>,
  ): z.infer<T> | EntityValue<EntityKey<this>, this> {
    if (key) {
      return key in this._data
        ? (this._data[key as keyof z.infer<T>] as EntityValue<
            EntityKey<this>,
            this
          >)
        : (this._metadata[key as keyof M] as EntityValue<
            EntityKey<this>,
            this
          >);
    }
    return this._data;
  }

  setData(
    key: EntityKey<this>,
    value: EntityValue<EntityKey<this>, this>,
  ): void {
    if (key in this._data) {
      this._data[key as keyof z.infer<T>] =
        value as z.infer<T>[keyof z.infer<T>];
    } else {
      this._metadata[key as keyof M] = value as M[keyof M];
    }
  }
}
