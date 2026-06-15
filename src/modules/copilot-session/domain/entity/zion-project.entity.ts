import type { z } from "zod";
import { Entity } from "../../../shared/domain/entity/entity.ts";
import { zionProjectSchema } from "../schema/project.schema.ts";

export class ZionProject extends Entity<
  typeof zionProjectSchema
> {
  constructor(
    data: z.input<typeof zionProjectSchema>,
    id?: string,
  ) {
    super(data, zionProjectSchema, { id });
  }
}
