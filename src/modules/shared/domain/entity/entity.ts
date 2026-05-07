import z from "zod";

export class Entity<T extends z.ZodObject = z.ZodObject> {
  private readonly _data: z.infer<T>;
  private _id: string;

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

  public updateId(newId: string): void {
    this._id = z.uuidv4().parse(newId);
  }

  public toJSON(): z.infer<T> & { id: string } {
    return { ...this.data, id: this.id };
  }

  public equals(otherEntityId: string): boolean {
    return this.id === otherEntityId;
  }
}
