import type z from "zod";
import { Entity, type EntityMetadata } from "../../../shared/domain/entity/entity.ts";
import { rubricSchema, criteriaSchema } from "../schema/rubric.schema.ts";

export class RubricEntity extends Entity<typeof rubricSchema> {
  constructor(id?: string) {
    super({}, rubricSchema, {id});
  }
}

export class CriteriaEntity extends Entity<typeof criteriaSchema, EntityMetadata & { isSaved: boolean}> {
  constructor(data: z.infer<typeof criteriaSchema>, id?: string) {
    super(data, criteriaSchema, {id, isSaved: false});
  }
}
