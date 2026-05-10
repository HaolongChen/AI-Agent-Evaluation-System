import z from "zod";

export const copilotJobSchema = z.object({
  projectExId: z.string(),
  wsUrl: z.url(),
  query: z.string(),
  schemaGraph: z.any(),
});
