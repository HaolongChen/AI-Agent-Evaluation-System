import { logger } from "../../../shared/infrastructure/logger.ts";
import { AgentFeedbackEntity } from "../entity/agent-feedback.entity.ts";
import type { AgentName } from "../schema/agent-feedback.schema.ts";

const sanitizeFeedback = (value: string): string => {
  return value.replaceAll(/\s+/g, " ").trim();
};

export class Feedback<
  T extends AgentName = AgentName,
> extends AgentFeedbackEntity {
  constructor(
    public agentName: T,
    rubricId: string,
  ) {
    super({ agentName, feedback: [], rubricId });
  }

  addFeedback = (feedback: string) => {
    const normalizedFeedback = sanitizeFeedback(feedback);

    const previousFeedback = this.data.feedback.at(-1);
    if (previousFeedback === normalizedFeedback) {
      return;
    }

    this.data.feedback.push(feedback);
    logger.debug(`Added feedback: ${normalizedFeedback}`);
  };

  getFeedbacks = (): string[] => {
    return this.data.feedback;
  };

  clearFeedbacks = (): void => {
    this.data.feedback = [];
  };
}

export type Feedbacks = {
  [key in AgentName]: Feedback<key>;
};

export type FeedbacksJSON = {
  [key in AgentName]: ReturnType<Feedback<key>["getData"]>;
};

export const feedbackDistributor = (feedbacks: Feedbacks) => {
  return (agentName: AgentName, feedback: string) => {
    const agentFeedback = feedbacks[agentName];
    if (!agentFeedback) {
      logger.warn(`No feedback instance found for agent: ${agentName}`);
      return;
    }
    agentFeedback.addFeedback(feedback);
  };
};

export const feedbacksgetData = (feedbacks: Feedbacks): FeedbacksJSON => {
  const feedbacksJSON = {} as FeedbacksJSON;
  for (const agentName in feedbacks) {
    feedbacksJSON[agentName as AgentName] =
      feedbacks[agentName as AgentName].getData();
  }
  return feedbacksJSON;
};
