import type { SubAgent } from "@HaolongChen/deepagents";
import { read_json_schema } from "../tools/schema-reader.ts";
import {
  schemaLookupDescription,
  schemaLookupPromptText,
} from "../../../domain/service/prompts.service.ts";

export const schemaLookupAgent: SubAgent = {
  name: "schema-lookup-agent",
  description: schemaLookupDescription,
  systemPrompt: schemaLookupPromptText,
  tools: [read_json_schema],
};
