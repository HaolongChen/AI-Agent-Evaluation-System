import type { z } from "zod";
import { Entity } from "../../../shared/domain/entity/entity.ts";
import { projectSchema, type ProjectEntityMetadata } from "../schema/project.schema.ts";

export class ProjectEntity extends Entity<typeof projectSchema, ProjectEntityMetadata> {
	constructor(data: z.infer<typeof projectSchema>, id?: string) {
		super(data, projectSchema, {id});
	}
}
