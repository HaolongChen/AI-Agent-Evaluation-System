import { Entity } from "../../../shared/domain/entity/entity.ts";
import { copilotInputSchema } from "../schema/copilot-input.schema.ts";
import { GoldenSetEntity } from "./golden-set.entity.ts";
import { UserInputEntity } from "./user-input.entity.ts";

export class CopilotInputEntity extends Entity<typeof copilotInputSchema> {
	constructor(
		public goldenSetEntity: GoldenSetEntity,
		public userInputEntity: UserInputEntity,
		id?: string,
	) {
		super(
			{
				goldenSetId: goldenSetEntity.getData("id"),
				userInputId: userInputEntity.getData("id"),
			},
			copilotInputSchema,
			id,
		);
	}
}
