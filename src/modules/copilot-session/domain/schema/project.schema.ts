import { z } from "zod";
import {
  Platform,
  ProjectContentCategory,
  ProjectSpaceType,
} from "../../../../graphql/generated/types.ts";
export const zionProjectSchema = z.object({
  projectName: z.string(),
  useNewType: z.boolean().default(true),
  useRefactoredComponent: z.boolean().default(true),
  projectSpaceType: z.enum(ProjectSpaceType).default("PERSONAL"),
  category: z.enum(ProjectContentCategory).default("OTHERS"),
  platform: z.enum( Platform ).default( "WEB" ),
  schemaId: z.string().optional(),
});

export const projectSchema = z.object( {
  copilotInputId: z.string(),
  copilotServerId: z.string(),
  projectName: z.string(),
});
