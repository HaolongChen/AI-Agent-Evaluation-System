import type z from "zod";
import type { Entity } from "../domain/entity/entity.ts";

export interface ExternalRepositoryDate {
  createdAt?: z.infer<z.ZodDate>;
  updatedAt?: z.infer<z.ZodDate>;
}

export function repositoryDateMapper<T extends z.ZodObject>(
  data: ExternalRepositoryDate,
  entity: Entity<T>,
) {
  if (data.createdAt) {
    entity.createdAt = data.createdAt;
  }
  if (data.updatedAt) {
    entity.updatedAt = data.updatedAt;
  }
  return entity;
}
