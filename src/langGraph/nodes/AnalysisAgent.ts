/*

1. implement tools
2. import tools
3. implement the model node: analysisAgentNode
4. implement the tool node
5. define end logic

*/

import { type RunnableConfig } from '@langchain/core/runnables';
import { rubricAnnotation } from '../state/index.ts';
import { getLLM } from '../llm/index.ts';
import { schemaDownloader } from '../tools/SchemaDownloader.ts';

export async function analysisAgentNode(
  state: typeof rubricAnnotation.State,
  config?: RunnableConfig
): Promise<Partial<typeof rubricAnnotation.State>> {
  // You can pass the model configuration via config.configurable
  const provider = config?.configurable?.['provider'] || 'azure';
  const modelName = config?.configurable?.['model'] || 'gpt-4o';

  const llm = getLLM({ provider, model: modelName });

  // Check if the model supports tool binding
  if (!llm.bindTools) {
    throw new Error(
      `Model ${provider}:${modelName} does not support tool binding`
    );
  }

  const llmWithTools = llm.bindTools([schemaDownloader]);

  const prompt = `
  You are an analysis agent and schema checker that helps to analyze the request of user's query and user's context if applicable and download the schema graph if needed. And finally generate a comprehensive report.
  Follow these steps:
  1. Analyze the user's query and context if applicable to determine if schema information is required.
  2. If schema information is needed, use the 'schema_downloader' tool to fetch the schema graph using the provided projectExId.
  3. Review the downloaded schema graph for assuming user's intentions.
  4. Provide a detailed analysis of the user's query and context if applicable, incorporating insights from the schema graph if applicable.

  User's Query: """${state.query}"""

  User's Context: """${state.context || 'No additional context provided.'}"""

  Use the following Project External ID to download the schema graph if needed:

  ${
    config?.configurable?.['projectExId']
      ? `Project External ID: """${config.configurable['projectExId']}"""`
      : 'No Project External ID provided.'
  }

  Respond with your analysis and any relevant schema information.
  `

  const response = await llmWithTools.invoke(prompt, config);

  return {
    messages: [response],
  };
}
