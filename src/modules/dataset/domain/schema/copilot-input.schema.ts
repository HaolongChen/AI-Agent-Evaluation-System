import { z } from "zod";

export const copilotInputSchema = z.object({
  goldenSetId: z.string(),
  userInputId: z.string()
})