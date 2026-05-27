import type { CopilotSessionAggregate } from "../../../copilot-session/domain/aggregate/copilot-session.aggregate.ts";
import { AggregateRoot } from "../../../shared/domain/aggregate/aggregate-root.ts";
import type { EntityMetadata } from "../../../shared/domain/entity/entity.ts";
import { RubricEntity, type CriteriaEntity } from "../entity/rubric.entity.ts";
import type { rubricSchema } from "../schema/rubric.schema.ts";

export class RubricAggregate extends AggregateRoot<
  typeof rubricSchema,
  EntityMetadata,
  { criterion: CriteriaEntity; copilotSession: CopilotSessionAggregate }
> {

  constructor(copilotSessionAggregate: CopilotSessionAggregate, id?: string) {
    super(new RubricEntity(id));
    this.setEntity("copilotSession", copilotSessionAggregate);
  }
}
