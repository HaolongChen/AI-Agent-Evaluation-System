import type { AgentName } from "../schema/agent-feedback.schema.ts";

const sanitizeFeedback = (value: string): string => {
  return value.replaceAll(/\s+/g, " ").trim();
};

export class Feedback<T extends AgentName = AgentName> {
  private feedbacks: string[] = [];

  constructor(public agentName: T) {}

  addFeedback = (feedback: string) => {
    const normalizedFeedback = sanitizeFeedback(feedback);

    const previousFeedback = this.feedbacks.at(-1);
    if (previousFeedback === normalizedFeedback) {
      return;
    }

    this.feedbacks.push(normalizedFeedback);
    console.debug(`Added feedback: ${normalizedFeedback}`);
  };

  getFeedbacks = (): string[] => {
    return this.feedbacks;
  };

  clearFeedbacks = (): void => {
    this.feedbacks = [];
  };
}

export const feedbackDistributor = (Feedbacks: {
  [key in AgentName]: Feedback<key>;
}) => {
  return (agentName: AgentName, feedback: string) => {
    const agentFeedback = Feedbacks[agentName];
    if (!agentFeedback) {
      console.warn(`No feedback instance found for agent: ${agentName}`);
      return;
    }
    agentFeedback.addFeedback(feedback);
  };
};
