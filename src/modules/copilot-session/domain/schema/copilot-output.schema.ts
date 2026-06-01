import z from "zod";

export const copilotOutputSchema = z.object({
  editableText: z.string(),
  aiResponse: z.string(),
});
