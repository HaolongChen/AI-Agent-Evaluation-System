import * as z from "zod";

export class Entity<T extends z.ZodObject = z.ZodObject> {
  protected _data: z.infer<T>;
  protected _id: string;
  private _createdAt?: z.infer<z.ZodDate>;
  private _updatedAt?: z.infer<z.ZodDate>;

  constructor(
    data: z.infer<T>,
    public readonly schema: T,
    id?: string,
  ) {
    this._data = this.schema.parse(data);
    this._id = id ? z.uuidv4().parse(id) : crypto.randomUUID();
  }

  get data(): z.infer<T> {
    return this._data;
  }

  get id(): string {
    return this._id;
  }

  public set data(newData: z.infer<T>) {
    this._data = this.schema.parse(newData);
  }

  public set createdAt(date: z.infer<z.ZodDate>) {
    this._createdAt = date;
  }

  public get createdAt(): z.infer<z.ZodDate> | undefined {
    return this._createdAt;
  }

  public set updatedAt(date: z.infer<z.ZodDate>) {
    this._updatedAt = date;
  }

  public get updatedAt(): z.infer<z.ZodDate> | undefined {
    return this._updatedAt;
  }

  public toJSON(): z.infer<T> & {
    id: string;
    createdAt?: z.infer<z.ZodDate>;
    updatedAt?: z.infer<z.ZodDate>;
  } {
    return {
      ...this.data,
      id: this.id,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }

  public equals(otherEntityId: string): boolean {
    return this.id === otherEntityId;
  }
}
