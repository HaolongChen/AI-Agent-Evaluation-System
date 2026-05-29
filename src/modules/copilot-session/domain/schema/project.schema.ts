import { z } from "zod";
import {
  Platform,
  ProjectContentCategory,
  ProjectSpaceType,
} from "../../../../graphql/generated/types.ts";
import type { EntityMetadata } from "../../../shared/domain/entity/entity.ts";
import type { TypeSystemStore } from "../../../dataset/infrastructure/crdt-schema-manager.ts";

export const projectSchema = z.object({
  name: z.string(),
  useNewType: z.boolean().default(true),
  useRefactoredComponent: z.boolean().default(true),
  projectScopeType: z.enum(ProjectSpaceType).default("PERSONAL"),
  category: z.enum(ProjectContentCategory).default("OTHERS"),
  platform: z.enum(Platform).default("WEB"),
});

export type ProjectMetadata = {
  projectExId?: string;
  schemaId?: string;
  typeSystemStore?: TypeSystemStore;
} & EntityMetadata;
