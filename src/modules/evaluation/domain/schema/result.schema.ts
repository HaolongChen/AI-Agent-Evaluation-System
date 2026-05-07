import z from "zod";
import { evaluatorTypeEnum } from "./session.schema.ts";

export const evaluationResultSchema = z.object({
  evaluatorId: z.string(),
  copilotOutputId: z.uuidv4(),
  rubricId: z.uuidv4(),
  evaluatorType: evaluatorTypeEnum,
  overallScore: z.number(),
  analysis: z.string(),
});
