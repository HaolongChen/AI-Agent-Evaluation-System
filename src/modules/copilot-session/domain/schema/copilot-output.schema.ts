import z from "zod";

export const copilotOutputSchema = z.object({
  copilotSessionExId: z.string(),
  editableText: z.string(),
  aiResponse: z.string(),
  tasks: z.any().array(),
});
