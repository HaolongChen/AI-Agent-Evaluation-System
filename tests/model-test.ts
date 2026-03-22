import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { GEMINI_API_KEY, GEMINI_MODEL } from "../src/config/env.ts";

const model = new ChatGoogleGenerativeAI({
	model: GEMINI_MODEL,
	apiKey: GEMINI_API_KEY,
});



const response = await model.invoke("Why do parrots talk?");

console.log(response);