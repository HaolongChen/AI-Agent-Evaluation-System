import type z from "zod";
import { Entity } from "../../../shared/domain/entity/entity.ts";
import { copilotJobSchema } from "../schema/copilot.schema.ts";

export class CopilotJobEntity extends Entity<typeof copilotJobSchema> {
  constructor(data: z.infer<typeof copilotJobSchema>, id?: string) {
    super(data, copilotJobSchema, id);
  }
}
