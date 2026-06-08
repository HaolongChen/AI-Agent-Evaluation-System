import { z } from "zod";
import { ProjectContentCategory, ProjectSpaceType, ProjectType } from "../../../../graphql/generated/types.ts";

export const crdtSchemaSchema = z.object( {
  projectExId: z.string(),
  zeroUrl: z.url().nullable(),
  zeroSubscriptionUrl: z.url().nullable(),
  projectName: z.string(),
  category: z.enum( ProjectContentCategory ).default("OTHERS"),
  type: z.enum( ProjectType ).default("SINGLE_CLIENT"),
  projectSpace: z.enum( ProjectSpaceType ).default("PERSONAL"),
  crdtModelUrl: z.url(),
})