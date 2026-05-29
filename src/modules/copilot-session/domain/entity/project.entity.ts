import type { z } from "zod";
import { Entity } from "../../../shared/domain/entity/entity.ts";
import {
  projectSchema,
  type ProjectMetadata,
} from "../schema/project.schema.ts";

export class ProjectEntity extends Entity<
  typeof projectSchema,
  ProjectMetadata
> {
  constructor(data: z.infer<typeof projectSchema>, id?: string) {
    super(data, projectSchema, id);
  }
}
