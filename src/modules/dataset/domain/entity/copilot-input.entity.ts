import { Entity } from "../../../shared/domain/entity/entity.ts";
import { copilotInputSchema } from "../schema/copilot-input.schema.ts";

export class CopilotInputEntity extends Entity<typeof copilotInputSchema> {
	constructor(
		id?: string,
	) {
		super({}, copilotInputSchema, id);
	}
}
