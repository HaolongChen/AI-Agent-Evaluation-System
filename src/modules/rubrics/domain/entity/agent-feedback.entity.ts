import type z from "zod";
import { Entity } from "../../../shared/domain/entity/entity.ts";
import { AgentFeedbackSchema } from "../schema/agent-feedback.schema.ts";

export class AgentFeedbackEntity extends Entity<typeof AgentFeedbackSchema> {
  constructor(data: z.infer<typeof AgentFeedbackSchema>, id?: string) {
    super(data, AgentFeedbackSchema, id);
  }
}
