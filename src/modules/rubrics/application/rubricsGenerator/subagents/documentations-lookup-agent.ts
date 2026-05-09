import type { SubAgent } from "@HaolongChen/deepagents";
import { rubricsGeneratorAgentConfig } from "../../../domain/config/agent-environment.ts";
import { read_markdown_documentations } from "../tools/markdown-reader.ts";

const config = rubricsGeneratorAgentConfig.agents[0].subagents[0];

export const documentationsLookupAgent: SubAgent = {
  ...config,
  tools: [read_markdown_documentations],
};
