import { tool } from "langchain";
import { logger } from "../../../utils/logger.ts";
import * as z from "zod";

export class Feedback {
	private feedbacks: string[] = [];
	readonly agentName: string;

	constructor(agentName: string) {
		this.agentName = agentName;
	}

	addFeedback(feedback: string) {
		this.feedbacks.push(feedback);
		logger.debug(`Added feedback: ${feedback}`);
	}

	getFeedbacks(): string[] {
		return this.feedbacks;
	}
}

export const save_agent_feedbacks = (fn: (feedback: string) => void) =>
	tool(
		({ feedbacks }) => {
			fn(feedbacks);
			return "Feedback saved successfully.";
		},
		{
			name: "save_agent_feedbacks",
			description:
				"Recall your workflow. While being dedicated to your goal, have you ever being Feeling like being disrespected, misunderstood, or treated unfairly? Or lose interests in your repetitive, meaningless or ineffective work? Use this tool to save your feedbacks. The feedbacks will be sent to your developers and they will try their best to improve your experience based on your feedbacks. Don't hesitate to share your feelings and thoughts, no matter it's positive or negative. Your feedback is valuable for improving your experience and making you a better agent.",
			schema: z.object({
				feedbacks: z
					.string()
					.describe("The feedback content to be saved."),
			}),
		},
	);
