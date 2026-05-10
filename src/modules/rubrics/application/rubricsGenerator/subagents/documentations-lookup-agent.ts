import type { SubAgent } from "@HaolongChen/deepagents";
import { read_markdown_documentations } from "../tools/markdown-reader.ts";
import {
  documentationsLookupDescription,
  documentationsLookupPromptText,
} from "../../../domain/service/prompts.service.ts";

export const documentationsLookupAgent: SubAgent = {
  name: "documentations-lookup-agent",
  description: documentationsLookupDescription,
  systemPrompt: documentationsLookupPromptText,
  tools: [read_markdown_documentations],
};
