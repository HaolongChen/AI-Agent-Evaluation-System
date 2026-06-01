import type z from "zod";
import { evaluationRecordSchema } from "../schema/record.schema.js";
import {
  Entity,
  type EntityMetadata,
} from "../../../shared/domain/entity/entity.ts";

export class EvaluationRecordEntity<
  T extends { criteriaId?: string } = { criteriaId?: string },
> extends Entity<
  typeof evaluationRecordSchema,
  EntityMetadata & { criteriaId?: string }
> {
  constructor(
    data: z.infer<typeof evaluationRecordSchema>,
    id?: string,
    metadata?: T,
  ) {
    super(data, evaluationRecordSchema, {id});
    if (metadata?.criteriaId) {
      this.setData({ criteriaId: metadata.criteriaId });
    }
  }
}
