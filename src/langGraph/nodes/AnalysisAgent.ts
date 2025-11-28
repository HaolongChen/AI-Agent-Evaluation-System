/*

1. implement tools
2. import tools
3. implement the model node: analysisAgentNode
4. implement the tool node
5. define end logic

*/

import { type RunnableConfig } from "@langchain/core/runnables";
import { HumanMessage } from "@langchain/core/messages";
import { rubricAnnotation } from "../state/index.ts";
import { getLLM } from "../llm/index.ts";
import {
  schemaDownloader,
  SchemaDownloaderForTest,
} from "../tools/SchemaDownloader.ts";
import * as z from "zod";

const analysisSchema = z.object({
  isSchemaNeeded: z
    .boolean()
    .describe("Whether schema information is needed to answer the query"),
  analysisReport: z
    .string()
    .describe("Detailed analysis report of the user query and context"),
});

export async function analysisAgentNode(
  state: typeof rubricAnnotation.State,
  config?: RunnableConfig
): Promise<Partial<typeof rubricAnnotation.State>> {
  // You can pass the model configuration via config.configurable
  const provider = config?.configurable?.["provider"] || "azure";
  const modelName = config?.configurable?.["model"] || "gpt-4o";
  const projectExId = config?.configurable?.["projectExId"] as
    | string
    | undefined;

  const llm = getLLM({ provider, model: modelName });

  // Step 1: Use tool calling to determine if schema is needed
  if (!llm.bindTools) {
    throw new Error(
      `Model ${provider}:${modelName} does not support tool binding`
    );
  }

  const llmWithTools = llm.bindTools([schemaDownloader]);

  const toolCallPrompt = `
  You are an analysis agent. Analyze the user's query and context to determine if you need to download the schema graph.
  If schema information would help answer the query, use the 'schema_downloader' tool with the provided projectExId.

  Description of schema: The schema graph contains the structure of the database, including entities, relationships, and attributes. It is useful for understanding complex data models and answering queries related to data organization.

  Respond with a tool call if schema is needed, otherwise respond with no tool call.

  User's Query: """${state.query}"""

  User's Context: """${state.context || "No additional context provided."}"""

  ${
    projectExId
      ? `Project External ID: """${projectExId}"""`
      : "No Project External ID provided - do not use the schema_downloader tool."
  }
  `;

  const toolCallResponse = await llmWithTools.invoke(
    [new HumanMessage(toolCallPrompt)],
    config
  );

  // Process tool calls if any
  let schemaInfo = "";
  if (toolCallResponse.tool_calls && toolCallResponse.tool_calls.length > 0) {
    for (const toolCall of toolCallResponse.tool_calls) {
      if (toolCall.name === "schema_downloader") {
        try {
          if (projectExId) {
            schemaInfo = await SchemaDownloaderForTest(projectExId);
          }
        } catch (error) {
          console.error("Error downloading schema:", error);
          schemaInfo = `Error downloading schema: ${
            error instanceof Error ? error.message : "Unknown error"
          }`;
        }
      }
    }
  }

  // Step 2: Use structured output for final analysis
  const llmWithStructuredOutput = llm.withStructuredOutput(analysisSchema);

  const analysisPrompt = `
  You are an analysis agent. Based on the user's query, context, and any available schema information, provide a comprehensive analysis.

  User's Query: """${state.query}"""

  User's Context: """${state.context || "No additional context provided."}"""

  ${
    schemaInfo
      ? `Schema Information: """${schemaInfo}"""`
      : "No schema information available."
  }

  Provide your analysis including:
  1. Understanding of the user's intent
  2. Key entities and relationships identified
  3. Relevant schema insights (if schema was downloaded)
  4. Recommendations for the rubric drafter
  `;

  const response = await llmWithStructuredOutput.invoke(
    [new HumanMessage(analysisPrompt)],
    config
  );

  return {
    analysis: response.analysisReport,
  };
}
