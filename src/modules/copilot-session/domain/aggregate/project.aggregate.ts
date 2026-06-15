import { projectSchema } from "../schema/crdt-schema.schema.ts";
import { AggregateRoot } from "../../../shared/domain/aggregate/aggregate-root.ts";
import { ZionProject } from "../entity/zion-project.entity.ts";
import { Entity } from "../../../shared/domain/entity/entity.ts";
import { ProjectCreatedEvent } from "../event/project-created.event.ts";

export class ProjectAggregate extends AggregateRoot<typeof projectSchema> {
	constructor(
		projectExId: string,
		project: { projectName: string; id: string },
	) {
		if (project instanceof ZionProject) {
			super(
				new Entity(
					{ projectExId, projectName: project.getData("projectName") },
					projectSchema,
					{ id: project.getData("id") },
				),
				{},
			);
			this.addEvent(
				new ProjectCreatedEvent({
					name: this.getData("projectName"),
					exId: projectExId,
					id: this.getData("id"),
				}),
			);
		} else {
			super(
				new Entity({ projectExId, ...project }, projectSchema, {
					id: project.id,
				}),
				{},
			);
		}
	}
}
