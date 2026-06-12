import { AggregateRoot } from "../../../shared/domain/aggregate/aggregate-root.ts";
import {
  Entity,
  type EntityMetadata,
} from "../../../shared/domain/entity/entity.ts";
import type { ProjectEntity } from "../entity/project.entity.ts";
import { projectSchema } from "../schema/project.schema.ts";

export class ProjectAggregate extends AggregateRoot<
  typeof projectSchema,
  EntityMetadata & { copilotInputId: string; copilotServerId: string }
> {
  constructor(
    project: ProjectEntity,
    copilotInputId: string,
    copilotServerId: string,
  ) {
    super(
      new Entity(project.getData(), projectSchema, {
        id: project.getData("id"),
        copilotInputId,
        copilotServerId,
      }),
      {},
    );
  }
}
