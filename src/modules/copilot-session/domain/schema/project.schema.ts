import { z } from "zod";

export const projectSchema = z.object({
  name: z.string(),
  projectExId: z.string(),
  schemaId: z.string(),
});
