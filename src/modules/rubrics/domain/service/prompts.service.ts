import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";

dotenvExpand.expand(dotenv.config());
import type { SubAgent } from "@HaolongChen/deepagents";
import { read_markdown_documentations } from "../../application/rubricsGenerator/tools/markdown-reader.ts";
import { read_json_schema } from "../../application/rubricsGenerator/tools/schema-reader.ts";
import fs from "node:fs/promises";
import { pathToFileURL } from "node:url";

const promptsBasePath = pathToFileURL(
  process.env.RUBRICS_GENERATOR_PROMPTS_PATH,
);
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
export const documentationsLookupDescription =
  "This sub-agent is responsible for looking up and explaining the Momen official documentation to assist the main agent in generating accurate and relevant rubrics for evaluating copilot's performance based on the provided crdt schema model and user input.";

export const schemaLookupDescription =
  "This sub-agent is responsible for explaining crdt schema models that rubrics-generator-agent owns by looking up its own reference schema of crdt schema models with jq queries.";

export const rubricsGeneratorPromptText =
  rubricsGeneratorPromptTemplate.replace("${feedbackPrompt}", feedbackPrompt);
export const documentationsLookupPromptText =
  documentationsLookupPromptTemplate.replace(
    "${feedbackPrompt}",
    feedbackPrompt,
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
