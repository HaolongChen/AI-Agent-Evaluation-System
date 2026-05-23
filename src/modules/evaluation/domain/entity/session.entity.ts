import type z from "zod";
import { Entity } from "../../../shared/domain/entity/entity.ts";
import {
  evaluationSessionSchema,
  type sessionIdentifierSchema,
} from "../schema/session.schema.ts";
import type { evaluationRecordSchema } from "../schema/record.schema.ts";
import type { evaluationResultSchema } from "../schema/result.schema.ts";

export class BaseSessionEntity<
  T extends
    | typeof evaluationSessionSchema
    | typeof evaluationRecordSchema
    | typeof evaluationResultSchema
    | typeof sessionIdentifierSchema,
> extends Entity<T> {
  public get identifier(): z.infer<typeof sessionIdentifierSchema> {
    return this.getData() as z.infer<typeof sessionIdentifierSchema>;
  }
}

export class EvaluationSessionEntity extends BaseSessionEntity<
  typeof evaluationSessionSchema
> {
  constructor(data: z.infer<typeof evaluationSessionSchema>, id?: string) {
    super(data, evaluationSessionSchema, id);
  }
}
