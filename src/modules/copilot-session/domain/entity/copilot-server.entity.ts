import type { z } from "zod";
import { Entity } from "../../../shared/domain/entity/entity.ts";
import { copilotServerSchema } from "../schema/copilot-server.schema.ts";

export class CopilotServerEntity extends Entity<typeof copilotServerSchema> {
  constructor(data: z.infer<typeof copilotServerSchema>, id?: string) {
    super(data, copilotServerSchema, id);
  }
}
