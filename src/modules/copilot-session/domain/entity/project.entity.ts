import type { z } from "zod";
import { Entity } from "../../../shared/domain/entity/entity.ts";
import {
  projectSchema,
  type ProjectMetadata,
} from "../schema/project.schema.ts";
import type { TypeSystemStore } from "../../../dataset/infrastructure/crdt-schema-manager.ts";

export class ProjectEntity extends Entity<
  typeof projectSchema,
  ProjectMetadata
> {
  constructor(data: z.infer<typeof projectSchema>, id?: string) {
    super(data, projectSchema, id);
  }

  get typeSystemStore(): TypeSystemStore {
    const result = this.getData("typeSystemStore");
    if (!result) {
      throw new Error("Type system store not found");
    }
    return result;
  }
}
