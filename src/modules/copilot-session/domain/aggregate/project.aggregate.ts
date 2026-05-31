import { AggregateRoot } from "../../../shared/domain/aggregate/aggregate-root.ts";
import { ProjectEntity } from "../entity/project.entity.ts";
import { projectSchema } from "../schema/project.schema.ts";
import type { CopilotInputAggregate } from "../../../dataset/domain/aggregate/copilot-input.aggregate.ts";
import type { EntityMetadata } from "../../../shared/domain/entity/entity.ts";

export class ProjectAggregate extends AggregateRoot<
  typeof projectSchema,
  EntityMetadata,
  { copilotInput: CopilotInputAggregate }
> {
  public copilotServerId: string;
  constructor(data: ProjectAggregate, copilotServerId: string);
  constructor(
    copilotInputAggregate: CopilotInputAggregate,
    copilotServerId: string,
    projectEntity: ProjectEntity,
  );
  constructor(
    argument1: ProjectAggregate | CopilotInputAggregate,
    copilotServerId: string,
    argument3?: ProjectEntity,
  ) {
    if (argument1 instanceof ProjectAggregate) {
      super(argument1);
      this.setEntity("copilotInput", argument1.getEntity("copilotInput"));
    } else {
      super(argument3!);
      this.setEntity("copilotInput", argument1);
    }
    this.copilotServerId = copilotServerId;
  }
}
