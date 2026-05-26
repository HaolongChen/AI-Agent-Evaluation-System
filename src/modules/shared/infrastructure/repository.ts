import type z from "zod";
import type { Entity } from "../domain/entity/entity.ts";
import type {
  BaseOptions,
  BaseOptionsReturnType,
} from "../domain/interface/repository.interface.ts";

export interface ExternalRepositoryDate {
  createdAt?: z.infer<z.ZodDate>;
  updatedAt?: z.infer<z.ZodDate>;
}

export function repositoryDateMapper<T extends z.ZodObject>(
  data: ExternalRepositoryDate,
  entity: Entity<T>,
) {
  entity.setData({ createdAt: data.createdAt, updatedAt: data.updatedAt });
  return entity;
}

export const optionsToInclude = <
  T extends string = string,
  E extends string = string,
  U extends string = string,
>(
  options: BaseOptions<T, E, U>,
) => {
  if (!options.options) {
    return { [options.name]: true } as const;
  }
  const include: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(options.options)) {
    if (typeof value === "boolean") {
      include[key] = value;
    } else {
      const next = optionsToInclude(value);
      include[key] = next[key];
    }
  }
  return { [options.name]: { include: include } } as BaseOptionsReturnType<
    T,
    E,
    U
  >;
};

export type IncludeDataReturnType<
  T extends { name: string; options: Record<string, unknown> } | boolean,
  E extends Entity = Entity,
> = T extends false
  ? never
  : T extends true
    ? { entity: E }
    : T extends { name: string; options: Record<string, unknown> }
      ? {
          foreign: {
            [K in keyof T["options"]]: T["options"][K] extends boolean
              ? true
              : T["options"][K] extends {
                    name: string;
                    options: Record<string, unknown>;
                  }
                ? IncludeDataReturnType<T["options"][K], E>
                : never;
          };
          entity?: E;
        }
      : never;
