import type z from "zod";
import { Entity } from "../../../shared/domain/entity/entity.ts";
import { rubricSchema, criteriaSchema } from "../schema/rubric.schema.ts";

export class RubricEntity extends Entity<typeof rubricSchema> {
  constructor(id?: string) {
    super( {}, rubricSchema, id);
  }
}

export class CriteriaEntity extends Entity<typeof criteriaSchema> {
  constructor(data: z.infer<typeof criteriaSchema>, id?: string) {
    super(data, criteriaSchema, id);
  }
}
