import {
  Entity,
  type EntityMetadata,
} from "../../../shared/domain/entity/entity.ts";
import { copilotSessionSchema } from "../schema/copilot-session.schema.ts";
import type { CopilotExecutionMetadata } from "../schema/copilot.schema.ts";

export class CopilotSessionEntity extends Entity<
  typeof copilotSessionSchema,
  EntityMetadata & CopilotExecutionMetadata
> {
  constructor(id?: string) {
    super({}, copilotSessionSchema, id);
  }
}
