import { Entity } from "../../../shared/domain/entity/entity.ts";
import { copilotExecutionTaskSchema } from "../schema/copilot-execution-task.schema.ts";

export class CopilotExecutionTaskEntity extends Entity<
	typeof copilotExecutionTaskSchema
> {
	constructor(data: { copilotInputId: string; copilotServerId: string }) {
		super( data, copilotExecutionTaskSchema, {} );
	}
}
