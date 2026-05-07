import type z from "zod";
import { evaluationResultSchema } from "../schema/result.schema.js";
import { BaseSessionEntity } from "./session.entity.ts";

export class EvaluationResultEntity extends BaseSessionEntity<
  typeof evaluationResultSchema
> {
  constructor(data: z.infer<typeof evaluationResultSchema>, id?: string) {
    super(data, evaluationResultSchema, id);
  }
}
