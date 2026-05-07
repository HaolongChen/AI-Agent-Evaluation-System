import z from "zod";

export const copilotJobSchema = z.object({
  projectExId: z.uuidv4(),
  wsUrl: z.url(),
  query: z.string(),
  schemaGraph: z.object({
    z614s35s6cfl: z.string(),
  }),
});
