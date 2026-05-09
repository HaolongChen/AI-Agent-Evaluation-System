import { ChatGoogle } from "@langchain/google";

export const gemini = new ChatGoogle("gemini-3.0-flash-lite", {
  apiKey: process.env.GOOGLE_API_KEY,
  temperature: 0.5,
});
