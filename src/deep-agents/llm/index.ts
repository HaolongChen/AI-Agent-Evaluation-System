import { ChatGoogle } from "@langchain/google";

export const gemini = (GEMINI_API_KEY: string): ChatGoogle => {
  return new ChatGoogle("gemini-2.5-flash-lite", {
    apiKey: GEMINI_API_KEY,
    temperature: 0,
  });
};
