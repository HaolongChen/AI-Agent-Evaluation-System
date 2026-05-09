import type { SubAgent } from "@HaolongChen/deepagents";
import { rubricsGeneratorAgentConfig } from "../../../domain/config/agent-environment.ts";
import { read_json_schema } from "../tools/schema-reader.ts";

const config = rubricsGeneratorAgentConfig.agents[0].subagents[1];

export const schemaLookupAgent: SubAgent = {
  ...config,
  tools: [read_json_schema],
};
