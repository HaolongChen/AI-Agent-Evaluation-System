import { z } from "zod";

export const copilotExecutionTaskSchema = z.object({
  copilotInputId: z.string(),
  copilotServerId: z.string(),
});
