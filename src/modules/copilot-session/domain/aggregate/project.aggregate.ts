import type { CopilotServerEntity } from "../../../dataset/domain/entity/copilot-server.entity.ts";
import { AggregateRoot } from "../../../shared/domain/aggregate/aggregate-root.ts";
import type { EntityMetadata } from "../../../shared/domain/entity/entity.ts";
import { ProjectEntity } from "../entity/project.entity.ts";
import { projectSchema } from "../schema/project.schema.ts";
import type { CopilotInputAggregate } from "../../../dataset/domain/aggregate/copilot-input.aggregate.ts";

export class ProjectAggregate extends AggregateRoot<
  typeof projectSchema,
  EntityMetadata,
  { copilotInput: CopilotInputAggregate; copilotServer: CopilotServerEntity }
> {
  constructor(data: ProjectAggregate);
  constructor(
    copilotInputAggregate: CopilotInputAggregate,
    copilotServerEntity: CopilotServerEntity,
    projectEntity: ProjectEntity,
  );
  constructor(
    argument1: ProjectAggregate | CopilotInputAggregate,
    argument2?: CopilotServerEntity,
    argument3?: ProjectEntity,
  ) {
    if (argument1 instanceof ProjectAggregate) {
      super(argument1);
      this.setEntity("copilotInput", argument1.getEntity("copilotInput"));
      this.setEntity("copilotServer", argument1.getEntity("copilotServer"));
    } else {
      super(argument3!);
      this.setEntity("copilotInput", argument1);
      this.setEntity("copilotServer", argument2!);
    }
  }
}
