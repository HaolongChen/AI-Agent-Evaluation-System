import z from "zod";
import { Entity } from "../../../shared/domain/entity/entity.ts";
import { accountSchema } from "../schema/account.schema.ts";

export class AccountEntity extends Entity<typeof accountSchema> {
  constructor(data: z.infer<typeof accountSchema>, id?: string) {
    super(data, accountSchema, { id });
  }
}
