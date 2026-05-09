import { tool } from "langchain";
import { saveAgentFeedbackToolField } from "../../../domain/schema/agent-feedback.schema.ts";

export const save_agent_feedbacks = (function_: (feedback: string) => void) =>
  tool(({ feedbacks }) => {
    function_(feedbacks);
    return "Feedback saved successfully.";
  }, saveAgentFeedbackToolField);
