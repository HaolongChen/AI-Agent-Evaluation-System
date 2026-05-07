import z from "zod";

export const rubricSchema = z.object({
  goldenSetId: z.uuidv4(),
  userInputId: z.uuidv4(),
});

export const criteriaSchema = z.object({
  rubricId: z.uuidv4(),
  content: z.string(),
  expectedAnswer: z.boolean(),
  weight: z.number().max(1).positive().multipleOf(0.01),
  reasoning: z.string().nullish(),
});
