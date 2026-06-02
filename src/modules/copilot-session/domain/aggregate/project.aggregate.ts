import { AggregateRoot } from "../../../shared/domain/aggregate/aggregate-root.ts";
import { ProjectEntity } from "../entity/project.entity.ts";
import { projectSchema, type ProjectEntityMetadata } from "../schema/project.schema.ts";
import type { CopilotInputAggregate } from "../../../dataset/domain/aggregate/copilot-input.aggregate.ts";
import type { CopilotServerEntity } from "../../../dataset/domain/entity/copilot-server.entity.ts";

export class ProjectAggregate extends AggregateRoot<
  typeof projectSchema,
  ProjectEntityMetadata,
  {
    copilotInput: CopilotInputAggregate;
  }
> {
  public copilotServerId: string;
  constructor(data: ProjectAggregate, copilotServer: CopilotServerEntity); // TODO: should configure network service here
  constructor(
    copilotInputAggregate: CopilotInputAggregate,
    copilotServer: CopilotServerEntity,
    projectEntity: ProjectEntity,
  );
  constructor(
    argument1: ProjectAggregate | CopilotInputAggregate,
    copilotServer: CopilotServerEntity,
    argument3?: ProjectEntity,
  ) {
    if (argument1 instanceof ProjectAggregate) {
      super(argument1, { copilotInput: argument1.getEntity("copilotInput") });
      this.setEntity("copilotInput", argument1.getEntity("copilotInput"));
    } else {
      super(argument3!, { copilotInput: argument1 });
      this.setEntity("copilotInput", argument1);
    }
    this.copilotServerId = copilotServer.getData("id");
  }
}
