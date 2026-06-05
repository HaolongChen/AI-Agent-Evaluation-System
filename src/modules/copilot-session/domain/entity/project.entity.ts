import type { z } from "zod";
import {
  Entity,
  type EntityMetadata,
} from "../../../shared/domain/entity/entity.ts";
import { projectSchema } from "../schema/project.schema.ts";

export class ProjectEntity<
  T extends EntityMetadata = EntityMetadata,
> extends Entity<typeof projectSchema, T> {
  constructor(
    data: z.infer<typeof projectSchema>,
    metadata: Omit<T, keyof EntityMetadata>,
    id?: string,
  ) {
    super(data, projectSchema, { ...metadata, id });
  }
}
