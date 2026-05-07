import type z from "zod";

export class ValueObject<T extends z.ZodObject = z.ZodObject> {
  private readonly _value: z.infer<T>;

  constructor(value: z.infer<T>, schema: T) {
    this._value = schema.parse(value);
  }

  get value(): z.infer<T> {
    return this._value;
  }
}
