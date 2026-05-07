import type z from "zod";
import { evaluationRecordSchema } from "../schema/record.schema.js";
import { BaseSessionEntity } from "./session.entity.ts";

export class EvaluationRecordEntity extends BaseSessionEntity<
  typeof evaluationRecordSchema
> {
  constructor(data: z.infer<typeof evaluationRecordSchema>, id?: string) {
    super(data, evaluationRecordSchema, id);
  }
}
