import z from "zod";

export const copilotOutputSchema = z.object({
  goldenSetId: z.uuidv4(),
  userInputId: z.uuidv4(),
  content: z.string(),
  copilotSessionExId: z.string(),
});
