import type z from "zod";
import { Entity } from "../../../shared/domain/entity/entity.ts";
import { agentFeedbackSchema } from "../schema/agent-feedback.schema.ts";

export class AgentFeedbackEntity extends Entity<typeof agentFeedbackSchema> {
  constructor(data: z.infer<typeof agentFeedbackSchema>, id?: string) {
    super(data, agentFeedbackSchema, { id });
  }
}
