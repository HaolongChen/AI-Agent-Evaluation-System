import z from "zod";

export const evaluatorTypeEnum = z.enum(["human", "agent"]);

export const evaluationSessionSchema = z.object({
  evaluatorType: evaluatorTypeEnum,

  evaluatorId: z.string(),
});
