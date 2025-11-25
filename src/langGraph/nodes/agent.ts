import { type RunnableConfig } from "@langchain/core/runnables";
import { rubricAnnotation } from "../state/index.ts";
import { getLLM } from "../llm/index.ts";

export async function agentNode(
  state: typeof rubricAnnotation.State,
  config?: RunnableConfig
): Promise<Partial<typeof rubricAnnotation.State>> {
  // You can pass the model configuration via config.configurable
  const provider = config?.configurable?.['provider'] || 'azure';
  const modelName = config?.configurable?.['model'] || 'gpt-4o';

  const llm = getLLM({ provider, model: modelName });
  
  // If you have tools, you would bind them here:
  // const llmWithTools = llm.bindTools(tools);
  
  const response = await llm.invoke(state.messages, config);
  
  return {
    messages: [response],
  };
}
