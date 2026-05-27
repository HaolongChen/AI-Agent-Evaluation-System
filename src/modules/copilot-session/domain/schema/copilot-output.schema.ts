import z from "zod";

export const copilotOutputSchema = z.object({
  editableText: z.string().nullable(),
  aiResponse: z.string(),
  copilotSessionExId: z.string(),
});
