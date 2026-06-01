import type z from "zod";
import { Entity } from "../../../shared/domain/entity/entity.ts";
import { goldenSetSchema } from "../schema/golden-set.schema.js";

export class GoldenSetEntity extends Entity<typeof goldenSetSchema> {
  constructor(data: z.infer<typeof goldenSetSchema>, id?: string) {
    super(data, goldenSetSchema, {id});
  }
}
