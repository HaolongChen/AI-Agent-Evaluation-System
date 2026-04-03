import { tool } from "langchain";
import { logger } from "../../../utils/logger.ts";
import * as z from "zod";

const FEEDBACK_MAX_LENGTH = 900;

const sanitizeFeedback = (value: string): string => {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (!normalized) {
    return "";
  }

  const looksRawJson =
    (normalized.startsWith("{") && normalized.endsWith("}")) ||
    (normalized.startsWith("[") && normalized.endsWith("]"));

  const markdownHeadingCount = (normalized.match(/(^|\s)#{1,6}\s/g) || [])
    .length;
  const codeFenceCount = (normalized.match(/```/g) || []).length;
  const pathTokenCount = (
    normalized.match(/[A-Za-z0-9_./\[\]#-]{8,}/g) || []
  ).filter((token) => /[./\[\]#]/.test(token)).length;
  const looksRawLargePayload =
    normalized.length > 500 ||
    markdownHeadingCount >= 2 ||
    codeFenceCount >= 2 ||
    pathTokenCount >= 8;

  const sanitized =
    looksRawJson || looksRawLargePayload
      ? `Processed feedback summary: raw payload-like content detected (${normalized.length} chars). Provide distilled findings with evidence targets and decision impacts only.`
      : normalized;

  if (sanitized.length <= FEEDBACK_MAX_LENGTH) {
    return sanitized;
  }

  return `${sanitized.slice(0, FEEDBACK_MAX_LENGTH)}...`;
};

export class Feedback {
  private feedbacks: string[] = [];
  readonly agentName: string;

  constructor(agentName: string) {
    this.agentName = agentName;
  }

  addFeedback = (feedback: string) => {
    const normalizedFeedback = sanitizeFeedback(feedback);
    if (!normalizedFeedback) {
      return;
    }

    const previousFeedback = this.feedbacks[this.feedbacks.length - 1];
    if (previousFeedback === normalizedFeedback) {
      return;
    }

    this.feedbacks.push(normalizedFeedback);
    logger.debug(`Added feedback: ${normalizedFeedback}`);
  };

  getFeedbacks = (): string[] => {
    return this.feedbacks;
  };

  clearFeedbacks = (): void => {
    this.feedbacks = [];
  };
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
        feedbacks: z.string().describe("The feedback content to be saved."),
      }),
    },
  );
