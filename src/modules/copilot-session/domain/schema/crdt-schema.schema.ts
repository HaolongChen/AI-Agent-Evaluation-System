import { z } from "zod";
import { zionProjectSchema } from "./project.schema.ts";

export const projectSchema = z.object({
  projectExId: z.string(),
  projectName: z.string(),
});