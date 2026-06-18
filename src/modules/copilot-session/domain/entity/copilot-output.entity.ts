import type z from "zod";
import { Entity } from "../../../shared/domain/entity/entity.ts";
import { copilotOutputSchema } from "../schema/copilot-output.schema.ts";

export class CopilotOutputEntity extends Entity<typeof copilotOutputSchema> {
  constructor(data: z.infer<typeof copilotOutputSchema>, id?: string) {
    super(data, copilotOutputSchema, { id });
  }
}
