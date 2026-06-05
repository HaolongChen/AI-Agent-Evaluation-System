import type { z } from "zod";
import {
  Entity,
  type EntityMetadata,
} from "../../../shared/domain/entity/entity.ts";
import { projectCreationRequiredSchema } from "../schema/project.schema.ts";

export class ZionProjectEntity extends Entity<
  typeof projectCreationRequiredSchema,
  EntityMetadata & { projectExId?: string }
> {
  constructor(
    data: z.input<typeof projectCreationRequiredSchema>,
    id?: string,
  ) {
    super(data, projectCreationRequiredSchema, { id });
  }
}
