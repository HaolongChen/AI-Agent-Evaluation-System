import z from "zod";

export const evaluationRecordEntity = z.object({
  internal: z.object({
    id: z.uuidv4(),
    evaluation: z.boolean(),
    feedback: z.string().optional(),
    createdAt: z.date(),
  }),
  external: z.object({}),
});
