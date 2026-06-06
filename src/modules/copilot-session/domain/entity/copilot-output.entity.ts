import type z from "zod";
import {
  Entity,
  type EntityMetadata,
} from "../../../shared/domain/entity/entity.ts";
import { copilotOutputSchema } from "../schema/copilot-output.schema.ts";

export class CopilotOutputEntity<
  M extends EntityMetadata = EntityMetadata,
> extends Entity<typeof copilotOutputSchema, M> {
  constructor(
    data: z.infer<typeof copilotOutputSchema>,
    metadata: Omit<M, keyof EntityMetadata>,
    id?: string,
  ) {
    super(data, copilotOutputSchema, { ...metadata, id });
  }
}
