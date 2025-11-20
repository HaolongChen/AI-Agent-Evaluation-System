import { HumanMessage } from "@langchain/core/messages";
import { graph } from "../src/langGraph";
import { config } from "dotenv";

config();

async function main() {
  console.log("Starting LangGraph test...");

  try {
    // Test Azure
    console.log("Testing Azure Provider...");
    const result = await graph.invoke(
      {
        messages: [
          new HumanMessage(
            "Hello, world! Please reply with 'Hello from LangGraph!'"
          ),
        ],
      },
      {
        configurable: {
          provider: "azure",
          model: process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o",
        },
      }
    );

    console.log("Graph execution result (Azure):");
    console.log(JSON.stringify(result, null, 2));

    const lastMessage = result.messages[result.messages.length - 1];
    console.log("Last message content (Azure):", lastMessage.content);

    // Test Gemini (optional)
    if (process.env.GOOGLE_API_KEY && process.env.TEST_GEMINI === "true") {
      console.log("\nTesting Gemini Provider...");
      const geminiResult = await graph.invoke(
        {
          messages: [
            new HumanMessage(
              "Hello, world! Please reply with 'Hello from LangGraph!'"
            ),
          ],
        },
        {
          configurable: {
            provider: "gemini",
            model: "gemini-2.0-flash",
          },
        }
      );
      console.log("Graph execution result (Gemini):");
      const lastGeminiMessage =
        geminiResult.messages[geminiResult.messages.length - 1];
      console.log("Last message content (Gemini):", lastGeminiMessage.content);
    }
  } catch (error) {
    console.error("Error executing graph:", error);
  }
}

main();
