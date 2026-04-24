import z from "zod";
import { evaluationRecordEntity } from "./evaluation-record.entity.ts";
import { evaluationResultEntity } from "./evaluation-result.entity.ts";

export const evaluatorTypeEnum = z.enum(["human", "agent"]);

export type EvaluatorType = z.infer<typeof evaluatorTypeEnum>;

export const evaluationSessionEntity = z.object({
	internal: z.object({
		id: z.uuidv4(),
		evaluatorType: evaluatorTypeEnum,
		modelName: z.string().optional(),
		startedAt: z.date(),
		completedAt: z.date().optional(),
		// TODO: to implement metadata
	}),
	external: z.object({
		evaluationRecords: z.array(evaluationRecordEntity.shape.internal),
		result: evaluationResultEntity.shape.internal.optional(),
	}),
});
