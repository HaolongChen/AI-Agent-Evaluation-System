import { AggregateRoot } from "../../../shared/domain/aggregate/aggregate-root.ts";
import type { EntityMetadata } from "../../../shared/domain/entity/entity.ts";
import type { CopilotJobEntity } from "../entity/copilot-job.entity.ts";
import type { CopilotOutputEntity } from "../entity/copilot-output.entity.ts";
import { CopilotSessionEntity } from "../entity/copilot-session.entity.ts";
import { copilotSessionSchema } from "../schema/copilot-session.schema.ts";
import type { ProjectAggregate } from "./project.aggregate.ts";

export class CopilotSessionAggregate extends AggregateRoot<
  typeof copilotSessionSchema,
  EntityMetadata,
  {
    project: ProjectAggregate;
    copilotOutput: CopilotOutputEntity;
    copilotJob: CopilotJobEntity;
  }
> {
  constructor(projectAggregate: ProjectAggregate, id?: string) {
    super(new CopilotSessionEntity(id));
    this.setEntity("project", projectAggregate);
  }
}
