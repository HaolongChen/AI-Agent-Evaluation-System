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

  const response = await llmWithTools.invoke(state.messages, config);

  return {
    messages: [response],
  };
}
