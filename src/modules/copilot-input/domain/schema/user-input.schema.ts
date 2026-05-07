import z from "zod";

export const userInputSchema = z.object({
  content: z.string(),
  createdBy: z.string().default("unknown"),
});
