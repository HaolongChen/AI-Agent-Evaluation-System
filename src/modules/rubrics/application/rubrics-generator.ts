import {
  createSubAgentMiddleware,
  createDeepAgent,
  StateBackend,
  type SubAgent,
} from "@HaolongChen/deepagents";
import * as z from "zod";
import { createMiddleware, HumanMessage, toolStrategy } from "langchain";
//
import { getSchemaModel } from "../../../external/ali-oss.ts";
import { fromUint8Array } from "js-base64";
import { Crdt } from "@functorz/crdt-helper";
import fs from "node:fs/promises";
import { MemorySaver } from "@langchain/langgraph";
import { save_agent_feedbacks } from "../../../deep-agents/rubricsGenerator/tools/feedback.ts";
import type { agentFeedbacks } from "../../../prisma/build/generated/prisma/client.ts";
import { gemini } from "../../../deep-agents/llm/index.ts";
import { fetchSideBar } from "../../../deep-agents/rubricsGenerator/tools/documentation-reader.ts";

import { inspectMiddleware } from "../../../deep-agents/rubricsGenerator/middleware/inspect.ts";
import { read_json_schema } from "../../../deep-agents/rubricsGenerator/tools/schema-reader.ts";
import { read_markdown_documentations } from "../../../deep-agents/rubricsGenerator/tools/markdown-reader.ts";
import {
  documentationsLookupAgentFeedback,
  documentationsExcerptWorker,
  documentationsLookupPromptText,
  schemaLookupAgentFeedback,
  schemaQueryWorker,
  schemaLookupPromptText,
  rubricsGeneratorPromptText,
  rubricsGeneratorFeedback,
} from "../domain/service/prompts.service.ts";
import {
  contextSchema,
  responseSchema,
} from "../domain/schema/deep-agents.schema.ts";

const documentationsLookupAgent: SubAgent = {
  name: "documentations-lookup-agent",
  middleware: [
    createMiddleware({
      name: "documentationsLookupFeedbackMiddleware",
      tools: [
        save_agent_feedbacks(documentationsLookupAgentFeedback.addFeedback),
      ],
    }),
    createSubAgentMiddleware({
      defaultModel: gemini(process.env.GOOGLE_API_KEY),
      defaultTools: [read_markdown_documentations],
      subagents: [documentationsExcerptWorker],
      generalPurposeAgent: false,
      taskDescription:
        "Delegate complicated documentations lookup into smaller evidence extraction subtasks.",
    }),
    inspectMiddleware,
  ],
  tools: [read_markdown_documentations],
  systemPrompt: documentationsLookupPromptText,
  description:
    "This sub-agent is responsible for looking up and explaining the Momen official documentation to assist the main agent in generating accurate and relevant rubrics for evaluating copilot's performance based on the provided crdt schema model and user input.",
};

const schemaLookupAgent: SubAgent = {
  name: "schema-lookup-agent",
  middleware: [
    createMiddleware({
      name: "schemaLookupFeedbackMiddleware",
      tools: [save_agent_feedbacks(schemaLookupAgentFeedback.addFeedback)],
    }),
    createSubAgentMiddleware({
      defaultModel: gemini(process.env.GOOGLE_API_KEY),
      defaultTools: [read_json_schema],
      subagents: [schemaQueryWorker],
      generalPurposeAgent: false,
      taskDescription:
        "Delegate complicated schema analysis into smaller jq-based subtasks.",
    }),
    inspectMiddleware,
  ],
  tools: [read_json_schema],
  systemPrompt: schemaLookupPromptText,
  description:
    "This sub-agent is responsible for explaining crdt schema models that rubrics-generator-agent owns by looking up its own reference schema of crdt schema models with jq queries.",
};

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
  await Promise.all([
    fs.mkdir(`${process.cwd()}/local_shell/zion/${schemaId}`, {
      recursive: true,
    }),
    fs.mkdir(`${process.cwd()}/local_shell/schemas`, { recursive: true }),
  ]);
  const result = await Promise.allSettled([
    getSchemaModel(schemaId).then((arrayBuffer) => {
      const modelBinary = new Uint8Array(arrayBuffer);
      const binaryBase64 = fromUint8Array(modelBinary);
      const model = Crdt.initModel(binaryBase64);
      const schemaJson = model.view();
      return fs.writeFile(
        `${process.cwd()}/local_shell/zion/${schemaId}/crdt_schema.json`,
        JSON.stringify(schemaJson),
      );
    }),
    fetchSideBar(),
    fs
      .readFile(`${process.cwd()}/ZSchema_Flattened.json`, "utf8")
      .then((content) =>
        fs.writeFile(
          `${process.cwd()}/local_shell/schemas/zschema.json`,
          content,
        ),
      ),
  ]);

  if (result.some((r) => r.status === "rejected")) {
    console.error("Error preparing context data:", result);
    throw new Error(
      "Failed to prepare context data. Please check the logs for more details.",
    );
  }

  const rubrics_generator_agent = createDeepAgent({
    // model: `azure_openai:${OPENAI_MODEL}`,
    name: "rubrics_generator_agent",
    responseFormat: toolStrategy(responseSchema),
    // model: `google-genai:${GEMINI_MODEL}`,
    model: gemini(process.env.GOOGLE_API_KEY),
    backend: (rt) => new StateBackend(rt),
    contextSchema: contextSchema,
    subagents: [schemaLookupAgent, documentationsLookupAgent],
    systemPrompt: rubricsGeneratorPromptText,
    checkpointer,
    middleware: [
      createMiddleware({
        name: "feedbackMiddleware",
        tools: [save_agent_feedbacks(rubricsGeneratorFeedback.addFeedback)],
      }),
      inspectMiddleware,
    ],
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
