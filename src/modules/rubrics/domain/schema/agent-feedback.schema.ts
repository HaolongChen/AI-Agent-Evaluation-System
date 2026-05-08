import z from "zod";

export const AgentFeedbackSchema = z.object({
  rubricId: z.uuidv4(),
  feedback: z.string().array(),
  agentName: z.string(),
});
