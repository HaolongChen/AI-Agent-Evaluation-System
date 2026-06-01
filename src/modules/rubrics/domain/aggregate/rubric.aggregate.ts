import type { z } from "zod";
import type { ProjectAggregate } from "../../../copilot-session/domain/aggregate/project.aggregate.ts";
import { AggregateRoot } from "../../../shared/domain/aggregate/aggregate-root.ts";
import type { EntityMetadata } from "../../../shared/domain/entity/entity.ts";
import { CriteriaEntity, RubricEntity } from "../entity/rubric.entity.ts";
import { criteriaSchema, type rubricSchema } from "../schema/rubric.schema.ts";

export class RubricAggregate extends AggregateRoot<
  typeof rubricSchema,
  EntityMetadata,
  { project: ProjectAggregate; criterion: CriteriaEntity[] }
> {
  constructor(projectAggregate: ProjectAggregate, id?: string) {
    super(new RubricEntity(id), { project: projectAggregate } as {
      project: ProjectAggregate;
      criterion: CriteriaEntity[];
    });
  }

  addCriteria(data: z.infer<typeof criteriaSchema>, id?: string) {
    this.pushEntity("criterion", new CriteriaEntity(data, id));
  }
}
