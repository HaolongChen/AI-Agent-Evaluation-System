import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { AzureChatOpenAI } from "@langchain/openai";
import { GeminiChatModel } from "./GeminiChatModel.ts";
import { GEMINI_API_KEY, OPENAI_API_KEY } from "../../config/env.ts";

export type LLMProvider = "azure" | "gemini";

export interface LLMConfig {
  provider: LLMProvider;
  model: string;
  temperature?: number;
}

export function getLLM(config: LLMConfig): BaseChatModel {
  switch (config.provider) {
    case "azure": {
      const apiKey = OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error("OPENAI_API_KEY is not set");
      }
      // Extract instance name from URL if possible, or use a default/env var
      // URL: https://functorz-sweden-central.openai.azure.com/
      const instanceName = "functorz-sweden-central";

      return new AzureChatOpenAI({
        azureOpenAIApiKey: apiKey,
        azureOpenAIApiInstanceName: instanceName,
        azureOpenAIApiDeploymentName: config.model,
        azureOpenAIApiVersion: "2025-04-01-preview",
        temperature: config.temperature ?? 1,
      });
    }
    case "gemini": {
      const apiKey = GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not set");
      }
      return new GeminiChatModel({
        apiKey: apiKey,
        model: config.model,
        temperature: config.temperature ?? 0,
      });
    }
    default:
      throw new Error(`Unsupported provider: ${config.provider}`);
  }
}
