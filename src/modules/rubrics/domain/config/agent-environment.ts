import { toolStrategy } from "langchain";
import { contextSchema, responseSchema } from "../schema/deep-agents.schema.ts";
import {
  documentationsLookupDescription,
  documentationsLookupPromptText,
  rubricsGeneratorPromptText,
  schemaLookupDescription,
  schemaLookupPromptText,
} from "../service/prompts.service.ts";
import { read_markdown_documentations } from "../../application/rubricsGenerator/tools/markdown-reader.ts";
import { read_json_schema } from "../../application/rubricsGenerator/tools/schema-reader.ts";

export const rubricsGeneratorEnvironment = {
  basePath: process.env.RUBRICS_GENERATOR_BASE_PATH,
  promptsPath: process.env.RUBRICS_GENERATOR_PROMPTS_PATH,

  tools: [
    {
      name: "read_markdown_documentations",
      source: read_markdown_documentations,
    },
    {
      name: "read_json_schema",
      source: read_json_schema,
    },
    {
      name: "save_agent_feedbacks",
    },
  ],
};

export const rubricsGeneratorAgentConfig = {
  agents: [
    {
      subagents: [
        {
          name: "documentations-lookup-agent",
          // path: "/zion",
          systemPrompt: documentationsLookupPromptText,
          description: documentationsLookupDescription,
        },
        {
          name: "schema-lookup-agent",
          // path: "/schemas",
          systemPrompt: schemaLookupPromptText,
          description: schemaLookupDescription,
        },
      ],
      name: "rubrics-generator-agent",
      contextSchema: contextSchema,
      systemPrompt: rubricsGeneratorPromptText,
      responseFormat: toolStrategy(responseSchema),
    },
  ],
};
