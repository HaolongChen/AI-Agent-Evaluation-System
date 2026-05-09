import { tool } from "langchain";
import {
  saveAgentFeedbackToolField,
  type AgentName,
} from "../../../domain/schema/agent-feedback.schema.ts";

export const save_agent_feedbacks = (
  function_: (agentName: AgentName, feedback: string) => void,
) =>
  tool(({ feedbacks }, config) => {
    function_(config.metadata.lc_agent_name as AgentName, feedbacks);
  }, saveAgentFeedbackToolField);
