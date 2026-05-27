import z from "zod";

export const rubricSchema = z.object({
});

export const criteriaSchema = z.object({
  content: z.string(),
  expectedAnswer: z.boolean(),
  weight: z.number().max(1).positive().multipleOf(0.01),
  reasoning: z.string().optional(),
});
