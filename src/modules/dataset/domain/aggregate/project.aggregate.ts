import type { CopilotServerEntity } from "../../../copilot-session/domain/entity/copilot-server.entity.ts";
import { AggregateRoot } from "../../../shared/domain/aggregate/aggregate-root.ts";
import type { EntityMetadata } from "../../../shared/domain/entity/entity.ts";
import type { GoldenSetEntity } from "../entity/golden-set.entity.ts";
import { ProjectEntity } from "../entity/project.entity.ts";
import { projectSchema } from "../schema/project.schema.ts";

export class ProjectAggregate extends AggregateRoot<
	typeof projectSchema,
	EntityMetadata,
	{ goldenSet: GoldenSetEntity; copilotServer: CopilotServerEntity }
> {
	constructor(data: ProjectAggregate);
	constructor(
		goldenSetEntity: GoldenSetEntity,
		copilotServerEntity: CopilotServerEntity,
		id?: string,
	);
	constructor(
		argument1: ProjectAggregate | GoldenSetEntity,
		argument2?: CopilotServerEntity,
		argument3?: string,
	) {
		if (argument1 instanceof ProjectAggregate) {
			super(argument1);
			this.setEntity("goldenSet", argument1.getEntity("goldenSet"));
			this.setEntity("copilotServer", argument1.getEntity("copilotServer"));
		} else {
			super(
				new ProjectEntity(
					{
						name: `Project-${Date.now()}`,
						projectExId: `project-${Date.now()}`,
					},
					argument3,
				),
			);
			this.setEntity("goldenSet", argument1);
			this.setEntity("copilotServer", argument2!);
		}
	}
}
