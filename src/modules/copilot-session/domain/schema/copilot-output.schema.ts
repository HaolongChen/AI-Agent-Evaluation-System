import z from "zod";

export const copilotOutputSchema = z.object({
	copilotSessionExId: z.string(),
	userInput: z.string(),
	projectExId: z.string(),
	editableText: z.string(),
	aiResponse: z.string(),
	tasks: z.any().array(),
});

export type CopilotExecutionLogType = z.infer<typeof copilotOutputSchema>;
