import { z } from "zod";
import type { EntityMetadata } from "../../../shared/domain/entity/entity.ts";
export const copilotExecutionSchema = z.object({
  copilotServerId: z.string(),
  status: z
    .enum(["pending", "running", "completed", "failed"])
    .default("pending"),
});
type DiscriminatedCopilotExecution =
  | { status: "pending" }
  | {
      status: "running" | "completed" | "failed";
      copilotSessionExId: string;
    };

export type CopilotExecutionMetadata = EntityMetadata & {
  state: DiscriminatedCopilotExecution;
};
