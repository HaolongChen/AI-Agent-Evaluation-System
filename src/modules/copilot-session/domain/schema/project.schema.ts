import { z } from "zod";
import {
  Platform,
  ProjectContentCategory,
  ProjectSpaceType,
} from "../../../../graphql/generated/types.ts";
import type { EntityMetadata } from "../../../shared/domain/entity/entity.ts";
import type { TypeSystemStore } from "../../../dataset/infrastructure/crdt-schema-manager.ts";

export const projectCreationRequiredSchema = z.object({
  projectName: z.string(),
  useNewType: z.boolean().default(true),
  useRefactoredComponent: z.boolean().default(true),
  projectSpaceType: z.enum(ProjectSpaceType).default("PERSONAL"),
  category: z.enum(ProjectContentCategory).default("OTHERS"),
  platform: z.enum(Platform).default("WEB"),
});

export const projectSchema = z.object({
  projectExId: z.string(),
});

export type ProjectMetadata = {
  typeSystemStore?: TypeSystemStore;
} & EntityMetadata;
