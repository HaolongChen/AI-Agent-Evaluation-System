import z from "zod";
import { Entity } from "../../../shared/domain/entity/entity.ts";
import { evaluationSessionSchema } from "../schema/session.schema.ts";
export class EvaluationSessionEntity extends Entity<
  typeof evaluationSessionSchema
> {
  constructor(data: z.infer<typeof evaluationSessionSchema>, id?: string) {
    super(data, evaluationSessionSchema, id);
  }
}
