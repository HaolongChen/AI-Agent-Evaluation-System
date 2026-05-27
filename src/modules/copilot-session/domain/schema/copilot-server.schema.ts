import { z } from "zod";

export const copilotServerSchema = z.object({
  name: z.string(),
  description: z.string().nullish(),
  wsEndpoint: z.string(),
  gqlEndpoint: z.string(),
});
