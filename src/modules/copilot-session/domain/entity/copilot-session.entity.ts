import { Entity } from "../../../shared/domain/entity/entity.ts";
import { copilotSessionSchema } from "../schema/copilot-session.schema.ts";

export class CopilotSessionEntity extends Entity<typeof copilotSessionSchema> {
  constructor(id?: string) {
    super({}, copilotSessionSchema, id);
  }
}
