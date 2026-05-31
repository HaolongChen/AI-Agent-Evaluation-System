import { AggregateRoot } from "../../../shared/domain/aggregate/aggregate-root.ts";
import type { EntityMetadata } from "../../../shared/domain/entity/entity.ts";
import type { CopilotOutputEntity } from "../entity/copilot-output.entity.ts";
import { CopilotSessionEntity } from "../entity/copilot-session.entity.ts";
import type { ICrdtSchemaLifecycle } from "../interface/crdt-schema-lifecycle.interface.ts";
import { copilotSessionSchema } from "../schema/copilot-session.schema.ts";
import type { CopilotExecutionMetadata } from "../schema/copilot.schema.ts";
import type { ProjectAggregate } from "./project.aggregate.ts";

export class CopilotSessionAggregate extends AggregateRoot<
  typeof copilotSessionSchema,
  EntityMetadata & CopilotExecutionMetadata,
  {
    project: ProjectAggregate;
    copilotOutput: CopilotOutputEntity;
    // copilotJob: CopilotJobEntity;
  }
> {
  constructor(
    projectAggregate: ProjectAggregate,
    public crdtSchemaLifecycle: ICrdtSchemaLifecycle,
    id?: string | CopilotSessionEntity,
  ) {
    super(
      id instanceof CopilotSessionEntity ? id : new CopilotSessionEntity(id),
    );
    this.setEntity("project", projectAggregate);
  }
}
