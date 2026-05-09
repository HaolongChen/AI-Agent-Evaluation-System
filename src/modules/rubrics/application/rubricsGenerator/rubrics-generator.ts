import {
  // createSubAgentMiddleware,
  createDeepAgent,
  StateBackend,
} from "@HaolongChen/deepagents";
import * as z from "zod";
import { HumanMessage } from "langchain";
import { MemorySaver } from "@langchain/langgraph";
import type { agentFeedbacks } from "../../../../prisma/build/generated/prisma/client.ts";
import { responseSchema } from "../../domain/schema/deep-agents.schema.ts";
import { documentationsLookupAgent } from "./subagents/documentations-lookup-agent.ts";
import { schemaLookupAgent } from "./subagents/schema-lookup-agent.ts";
import { setupEnvironment } from "./service/environment-setup.ts";
import { gemini } from "../../../shared/infrastructure/llm-providers.ts";
import { rubricsGeneratorAgentConfig } from "../../domain/config/agent-environment.ts";

const checkpointer = new MemorySaver();

export const generateRubrics = async (
  schemaId: string,
  query: string,
): Promise<
  {
    criterion: z.infer<typeof responseSchema>;
  } & {
    feedbacks?: (rubricId: string) => Promise<agentFeedbacks | undefined>[];
  }
> => {
  await setupEnvironment(schemaId);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { subagents: _, ...agentConfig } =
    rubricsGeneratorAgentConfig.agents[0];

  const rubrics_generator_agent = createDeepAgent({
    model: gemini,
    backend: () => new StateBackend(),
    subagents: [schemaLookupAgent, documentationsLookupAgent],
    checkpointer,
    ...agentConfig,
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
