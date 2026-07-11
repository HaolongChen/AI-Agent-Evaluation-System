import { z } from "zod";
import {
  Platform,
  ProjectContentCategory,
  ProjectSpaceType,
} from "../../../../graphql/generated/types.ts";
import type { EntityMetadata } from "../../../shared/domain/entity/entity.ts";

export const projectConfigSchema = z.object({
  useNewType: z.boolean().default(true),
  useRefactoredComponent: z.boolean().default(true),
  projectSpaceType: z.enum(ProjectSpaceType).default("PERSONAL"),
  category: z.enum(ProjectContentCategory).default("OTHERS"),
  platform: z.enum(Platform).default("WEB"),
});
export const zionProjectSchema = z
  .object({
    projectName: z.string(),
    schemaId: z.string().optional(),
  })
  .extend(projectConfigSchema.shape);

export const projectSchema = z.object({
  copilotInputId: z.string(),
  projectName: z.string(),
  projectExId: z.string().optional(),
});

type DiscriminatedProject =
  | { status: "pending" }
  | { status: "creating" }
  | { status: "deleted" }
  | {
      status: "active" | "busy";
      projectExId: string;
    }
  | {
      status: "failed";
      projectExId?: string;
    };

export type ProjectMetadata = EntityMetadata & { state: DiscriminatedProject };
