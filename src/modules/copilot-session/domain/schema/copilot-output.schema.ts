import z from "zod";

export const copilotOutputSchema = z.object({
  copilotSessionExId: z.string(),
  editableText: z.string().optional(),
  aiResponse: z.string().optional(),
  tasks: z.any().array(),
});
