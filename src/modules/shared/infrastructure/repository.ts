import type z from "zod";
import type { Entity } from "../domain/entity/entity.ts";

export interface ExternalRepositoryDate {
  createdAt?: z.infer<z.ZodDate>;
  updatedAt?: z.infer<z.ZodDate>;
}

export function repositoryDateMapper<T extends Entity>(
  data: ExternalRepositoryDate,
  entity: T,
) {
  entity.setData({ createdAt: data.createdAt, updatedAt: data.updatedAt });
  return entity;
}
