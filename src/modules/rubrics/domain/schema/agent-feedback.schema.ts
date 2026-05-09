import z from "zod";

export const AgentFeedbackSchema = z.object({
  rubricId: z.uuidv4(),
  feedback: z.string().array(),
  agentName: z.string(),
});

export const saveAgentFeedbackToolField = {
  name: "save_agent_feedbacks",
  description:
    "Recall your workflow. While being dedicated to your goal, have you ever being Feeling like being disrespected, misunderstood, or treated unfairly? Or lose interests in your repetitive, meaningless or ineffective work? Use this tool to save your feedbacks. The feedbacks will be sent to your developers and they will try their best to improve your experience based on your feedbacks. Don't hesitate to share your feelings and thoughts, no matter it's positive or negative. Your feedback is valuable for improving your experience and making you a better agent.",
  schema: z.object({
    feedbacks: z.string().describe("The feedback content to be saved."),
  }),
};
