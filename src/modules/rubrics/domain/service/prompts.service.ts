import type { SubAgent } from "@HaolongChen/deepagents";
import { Feedback } from "./feedback.service.ts";
import { read_markdown_documentations } from "../../../../deep-agents/rubricsGenerator/tools/markdown-reader.ts";
import { read_json_schema } from "../../../../deep-agents/rubricsGenerator/tools/schema-reader.ts";
import fs from "node:fs/promises";

const promptsBasePath = new URL("prompts/", import.meta.url);
const feedbackPrompt = await fs.readFile(
  new URL("feedbackPrompt.md", promptsBasePath),
  "utf8",
);
const schemaLookupPromptTemplate = await fs.readFile(
  new URL("schemaLookupPrompt.md", promptsBasePath),
  "utf8",
);
const rubricsGeneratorPromptTemplate = await fs.readFile(
  new URL("rubricsGeneratorPrompt.md", promptsBasePath),
  "utf8",
);

const documentationsLookupPromptTemplate = await fs.readFile(
  new URL("documentationsLookupPrompt.md", promptsBasePath),
  "utf8",
);
export const schemaLookupPromptText = schemaLookupPromptTemplate.replace(
  "${feedbackPrompt}",
  feedbackPrompt,
);
export const rubricsGeneratorPromptText =
  rubricsGeneratorPromptTemplate.replace("${feedbackPrompt}", feedbackPrompt);
export const documentationsLookupPromptText =
  documentationsLookupPromptTemplate.replace(
    "${feedbackPrompt}",
    feedbackPrompt,
  );

export const rubricsGeneratorFeedback = new Feedback("rubrics-generator-agent");
export const schemaLookupAgentFeedback = new Feedback("schema-lookup-agent");
export const documentationsLookupAgentFeedback = new Feedback(
  "documentations-lookup-agent",
);

export const schemaQueryWorker: SubAgent = {
  name: "schema-query-worker",
  description:
    "Specialized worker for focused jq-based schema lookups on small, explicit targets.",
  systemPrompt:
    "You are schema-query-worker. Split complex schema investigations into small jq lookups and return concise structured findings only.",
  tools: [read_json_schema],
};

export const documentationsExcerptWorker: SubAgent = {
  name: "documentations-excerpt-worker",
  description:
    "Specialized worker for focused markdown evidence extraction by heading/keyword.",
  systemPrompt:
    "You are documentations-excerpt-worker. Split complex documentation requests into small heading/keyword extraction tasks and return concise evidence only.",
  tools: [read_markdown_documentations],
};
