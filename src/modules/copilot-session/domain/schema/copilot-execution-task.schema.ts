import { z } from "zod";

export const copilotExecutionTaskSchema = z.object( {
  copilotInputId: z.uuidv4(),
  copilotServerId: z.uuidv4(),
})