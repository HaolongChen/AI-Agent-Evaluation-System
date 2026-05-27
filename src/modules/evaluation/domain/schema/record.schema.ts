import z from "zod";

export const evaluationRecordSchema = z.object({
  evaluation: z.boolean(),
  feedback: z.string().nullish(),
});
