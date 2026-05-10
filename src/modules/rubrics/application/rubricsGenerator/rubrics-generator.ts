import { createDeepAgent, StateBackend } from "@HaolongChen/deepagents";
import * as z from "zod";
import { HumanMessage, toolStrategy } from "langchain";
import { MemorySaver } from "@langchain/langgraph";
import {
  contextSchema,
  responseSchema,
} from "../../domain/schema/deep-agents.schema.ts";
import { documentationsLookupAgent } from "./subagents/documentations-lookup-agent.ts";
import { schemaLookupAgent } from "./subagents/schema-lookup-agent.ts";
import { setupEnvironment } from "./service/environment-setup.ts";
import { gemini } from "../../../shared/infrastructure/llm-providers.ts";
import { save_agent_feedbacks } from "./tools/feedback.ts";
import {
  feedbackDistributor,
  type Feedbacks,
} from "../../domain/service/feedback.service.js";
import { rubricsGeneratorPromptText } from "../../domain/service/prompts.service.ts";

const checkpointer = new MemorySaver();

export const generateRubrics = async (
  schemaId: string,
  query: string,
  feedbacks: Feedbacks,
): Promise<{
  criterion: z.infer<typeof responseSchema>;
}> => {
  await setupEnvironment(schemaId);

  const saveFeedbacksTool = save_agent_feedbacks(
    feedbackDistributor(feedbacks),
  );

  const rubrics_generator_agent = createDeepAgent({
    model: gemini,
    backend: () => new StateBackend(),
    tools: [saveFeedbacksTool],
    subagents: [
      {
        ...schemaLookupAgent,
        tools: [...(schemaLookupAgent.tools ?? []), saveFeedbacksTool],
      },
      {
        ...documentationsLookupAgent,
        tools: [...(documentationsLookupAgent.tools ?? []), saveFeedbacksTool],
      },
    ],
    checkpointer,
    name: "rubrics-generator-agent",
    systemPrompt: rubricsGeneratorPromptText,
    responseFormat: toolStrategy(responseSchema),
    contextSchema: contextSchema,
  });

  const response = await rubrics_generator_agent.invoke(
    {
      messages: [
        new HumanMessage(
          `You are provided with following user input: \`${query}\`\n
					Now work on generating rubrics based on the user input and the crdt schema model and zion official documentation that you own by looking up with your sub-agents. Prioritize failure detection, bug-catching checks, and edge cases over cosmetic quality criteria.`,
        ),
      ],
    },
    {
      context: {
        schemaId,
      },
      configurable: {
        thread_id: `rubrics-generator-${schemaId}-${Date.now()}`,
      },
      // recursionLimit: 100,
    },
  );
  return { criterion: response.structuredResponse };
};
