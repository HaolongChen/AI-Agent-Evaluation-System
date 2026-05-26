import type z from "zod";
import { Entity } from "../../../shared/domain/entity/entity.ts";
import { userInputSchema } from "../schema/user-input.schema.js";

export class UserInputEntity extends Entity<typeof userInputSchema> {
  constructor(data: z.infer<typeof userInputSchema>, id?: string) {
    super(data, userInputSchema, id);
  }
}
