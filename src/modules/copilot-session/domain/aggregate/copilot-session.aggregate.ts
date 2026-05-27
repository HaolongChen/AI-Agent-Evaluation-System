import type { CopilotInputAggregate } from "../../../dataset/domain/aggregate/copilot-input.aggregate.ts";
import { AggregateRoot } from "../../../shared/domain/aggregate/aggregate-root.ts";
import type { EntityMetadata } from "../../../shared/domain/entity/entity.ts";
import type { CopilotJobEntity } from "../entity/copilot-job.entity.ts";
import type { CopilotOutputEntity } from "../entity/copilot-output.entity.ts";
import type { CopilotServerEntity } from "../entity/copilot-server.entity.ts";
import { CopilotSessionEntity } from "../entity/copilot-session.entity.ts";
import { copilotSessionSchema } from "../schema/copilot-session.schema.ts";

export class CopilotSessionAggregate extends AggregateRoot<
  typeof copilotSessionSchema,
  EntityMetadata,
  {
    copilotInput: CopilotInputAggregate;
    copilotServer: CopilotServerEntity;
    copilotOutput: CopilotOutputEntity;
    copilotJob: CopilotJobEntity;
  }
> {
  constructor(
    copilotInputAggregate: CopilotInputAggregate,
    copilotServerEntity: CopilotServerEntity,
    id?: string,
  ) {
    super(new CopilotSessionEntity(id));
    this.setEntity("copilotInput", copilotInputAggregate);
    this.setEntity("copilotServer", copilotServerEntity);
  }
}
