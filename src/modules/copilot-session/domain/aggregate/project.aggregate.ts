import { AggregateRoot } from "../../../shared/domain/aggregate/aggregate-root.ts";
import type { EntityMetadata } from "../../../shared/domain/entity/entity.ts";
import type { ProjectEntity } from "../entity/project.entity.ts";
import { ProjectCreatedEvent } from "../event/project-created.event.ts";
import { projectSchema } from "../schema/project.schema.ts";

export class Project extends AggregateRoot<
	typeof projectSchema,
	EntityMetadata & { projectExId: string }
> {
	constructor(project: ProjectEntity, projectExId: string) {
		super(project.clone({ projectExId }), {});
		this.addEvent(
			new ProjectCreatedEvent({
				name: project.getData("projectName"),
				exId: projectExId,
				id: project.getData("id"),
			}),
		);
	}
}
