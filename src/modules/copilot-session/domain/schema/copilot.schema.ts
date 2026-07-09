import { z } from "zod";

export type CopilotExecutionStatus =
	| "pending"
	| "initializing"
	| "running"
	| "completed"
	| "failed";
export const copilotExecutionSchema = z.object( {
	projectExId: z.string(),
	copilotSessionExId: z.string().optional(),
	status: z
		.enum(["pending", "initializing", "running", "completed", "failed"])
		.default("pending"),
});