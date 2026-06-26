import { z } from "zod";
import type { EntityMetadata } from "../../../shared/domain/entity/entity.ts";

export type CopilotExecutionStatus =
	| "pending"
	| "initializing"
	| "running"
	| "completed"
	| "failed";
export const copilotExecutionSchema = z.object({
	copilotServerId: z.string(),
	status: z
		.enum(["pending", "initializing", "running", "completed", "failed"])
		.default("pending"),
});
type DiscriminatedCopilotExecution<
	T extends CopilotExecutionStatus = CopilotExecutionStatus,
> =
	[T] extends [infer U] ?
		U extends "initializing" | "failed" ? { projectExId: string }
		: U extends "running" | "completed" ?
			{ projectExId: string; copilotSessionExId: string }
		:	undefined
	:	never;

export type CopilotExecutionMetadata<Status extends CopilotExecutionStatus = CopilotExecutionStatus> = EntityMetadata & {
  status: Status;
	state: DiscriminatedCopilotExecution<Status>;
};
