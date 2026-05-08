const sanitizeFeedback = (value: string): string => {
  const normalized = value.replaceAll(/\s+/g, " ").trim();
  return normalized ?? "";
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
