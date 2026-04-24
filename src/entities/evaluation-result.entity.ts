import z, { object } from "zod";

export const evaluationResultEntity = z.object({
  internal: object({
    id: z.uuidv4(),
    evaluatorId: z.string(),
    overallScore: z.float32().min(0).max(100),
    analysis: z.string(),
    auditTrace: z.array(z.string()),
    generatedAt: z.date(),
  }),
  external: object({}),
});
