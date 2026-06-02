import { Entity } from "../../../shared/domain/entity/entity.ts";
import { projectSchema, type ProjectEntityMetadata } from "../schema/project.schema.ts";
import type { ZionProjectEntity } from "./zion-project.entity.ts";
export class ProjectEntity extends Entity<typeof projectSchema, ProjectEntityMetadata> {
	constructor(data: ZionProjectEntity, id?: string) {
		const projectExId = data.getData("projectExId");
		if (!projectExId) {
			throw new Error("projectExId is required to create ProjectEntity");
		}
		super({ projectExId, projectName: data.getData("projectName") }, projectSchema, {id});
	}
}
