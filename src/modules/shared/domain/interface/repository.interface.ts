import type { Entity } from "../entity/entity.ts";

export interface IRepository<T extends Entity> {
  save(entity: T): Promise<void>;
  findById(id: string, options?: unknown): Promise<unknown>;
}

export type BaseOptionsName<T extends string = string> = {
  name: T;
};

export type BaseOptions<
  T extends string = string,
  E extends string = string,
  U extends string = string,
> = {
  options: Exclude<U, E | T> extends never
    ? Record<string, never>
    : {
        [Name in Exclude<U, E | T>]: BaseOptions<
          Name,
          T | E
        >["options"] extends Record<string, never>
          ? true
          : BaseOptions<Name, T | E> | boolean;
      };
} & BaseOptionsName<T>;

export type ExcludeOptions<
  T extends BaseOptionsName & { options: { [key: string]: unknown } },
  E extends string,
> = {
  options: Omit<T["options"], E>;
  name: T["name"];
};

export type BaseOptionsReturnType<
  A extends string = string,
  B extends string = string,
  C extends string = string,
  T extends BaseOptions<A, B, C> = BaseOptions<A, B, C>,
> = {
  [Key in A]: Exclude<C, B> extends string
    ? {
        include: {
          [Name in Exclude<
            keyof T["options"],
            B | A
          >]: T["options"][Name] extends boolean
            ? { [P in Name]: T["options"][Name] }
            : T["options"][Name] extends BaseOptions
              ? T["options"][Name]["options"] extends never
                ? { [P in Name]: true }
                : keyof T["options"][Name]["options"] extends string
                  ? BaseOptionsReturnType<
                      T["options"][Name]["name"],
                      A | B,
                      keyof T["options"][Name]["options"]
                    >
                  : never
              : Record<string, never>;
        };
      }
    : true;
};
