import type { CopilotSessionAggregate } from "../../../copilot-session/domain/aggregate/copilot-session.aggregate.ts";
import type { CopilotOutputEntity } from "../../../copilot-session/domain/entity/copilot-output.entity.ts";
import { AggregateRoot } from "../../../shared/domain/aggregate/aggregate-root.ts";
import type { EntityMetadata } from "../../../shared/domain/entity/entity.ts";
import { RubricEntity, type CriteriaEntity } from "../entity/rubric.entity.ts";
import type { rubricSchema } from "../schema/rubric.schema.ts";

export class RubricAggregate extends AggregateRoot<
  typeof rubricSchema,
  EntityMetadata,
  { criterion: CriteriaEntity; copilotSession: CopilotSessionAggregate }
> {
  private _totalWeight: number = 0;

  constructor(copilotSessionAggregate: CopilotSessionAggregate, id?: string) {
    super( new RubricEntity( id ) );
    this.setEntity("copilotSession", copilotSessionAggregate);
  }

  public getAllData(): ReturnType<
    AggregateRoot<typeof rubricSchema>["getData"]
  > & {
    criterion: ReturnType<CriteriaEntity[ "getData" ]>[];
    copilotSession: ReturnType<CopilotSessionAggregate[ "getData" ]>;
  } {
    return {
      ...super.getData(),
      criterion: super
        .getEntity("criterion")
        .map((criteria) => criteria.getData()),
      copilotSession: super.getEntity("copilotSession").getData(),
    };
  }
}
