import z from "zod";

export const evaluatorTypeEnum = z.enum(["human", "agent"]);

export const evaluationSessionSchema = z.object({
  evaluatorType: evaluatorTypeEnum,
  copilotOutputId: z.uuidv4(),
  rubricId: z.uuidv4(),
  evaluatorId: z.string(),
  modelName: z.string().nullish(),
});

export const sessionIdentifierSchema = evaluationSessionSchema.omit({
  modelName: true,
});
