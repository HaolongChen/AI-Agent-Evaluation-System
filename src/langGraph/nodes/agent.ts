import { type RunnableConfig } from "@langchain/core/runnables";
import { AgentState } from "../state/index.ts";
import { getLLM } from "../llm/index.ts";
// import { AIMessage } from "@langchain/core/messages";

export async function agentNode(
  state: typeof AgentState.State,
  config?: RunnableConfig
): Promise<Partial<typeof AgentState.State>> {
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
