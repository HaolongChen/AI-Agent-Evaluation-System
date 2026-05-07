import z from "zod";
import { evaluatorTypeEnum } from "./session.schema.ts";

export const evaluationRecordSchema = z.object({
  copilotOutputId: z.uuidv4(),
  evaluatorType: evaluatorTypeEnum,
  rubricId: z.uuidv4(),
  criteriaId: z.uuidv4(),
  evaluatorId: z.string(),
  evaluation: z.boolean(),
  feedback: z.string().nullish(),
});
