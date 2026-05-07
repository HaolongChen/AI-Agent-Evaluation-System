import type z from "zod";
import { CopilotJobEntity } from "../entity/copilot-job.entity.ts";
import type { copilotJobSchema } from "../schema/copilot.schema.ts";

export class CopilotExecutionJobService extends CopilotJobEntity {
  constructor(data: z.infer<typeof copilotJobSchema>, id?: string) {
    super(data, id);
  }
}
