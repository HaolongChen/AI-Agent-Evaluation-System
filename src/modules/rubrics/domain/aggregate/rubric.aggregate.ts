import type { ProjectAggregate } from "../../../copilot-session/domain/aggregate/project.aggregate.ts";
import { AggregateRoot } from "../../../shared/domain/aggregate/aggregate-root.ts";
import type { EntityMetadata } from "../../../shared/domain/entity/entity.ts";
import { RubricEntity, type CriteriaEntity } from "../entity/rubric.entity.ts";
import type { rubricSchema } from "../schema/rubric.schema.ts";

export class RubricAggregate<
  T extends {
    criterion: CriteriaEntity[];
    project: ProjectAggregate;
  } = { criterion: CriteriaEntity[]; project: ProjectAggregate },
> extends AggregateRoot<typeof rubricSchema, EntityMetadata, T> {
  constructor(projectAggregate: ProjectAggregate, id?: string) {
    super( new RubricEntity( id ), {project: projectAggregate} as T);
    this.setEntity("project", projectAggregate);
  }
}
